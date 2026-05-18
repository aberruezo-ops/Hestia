#!/usr/bin/env python3
"""
Fetch iCal feeds from Booking.com and Airbnb, merge blocked ranges,
and write docs/assets/availability.json.

Env vars (set in workflow or locally):
  ICAL_VM_AIRBNB, ICAL_VM_BOOKING
  ICAL_VT_AIRBNB, ICAL_VT_BOOKING
  ICAL_VS_AIRBNB, ICAL_VS_BOOKING
"""

import json
import os
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    import requests
    from icalendar import Calendar
except ImportError:
    print("Missing deps — run: pip install requests icalendar")
    sys.exit(1)

APTS         = ["vm", "vt", "vs"]
SOURCES      = ["airbnb", "booking"]
LOOKAHEAD    = 548   # ~18 months
OUTPUT       = Path(__file__).parents[2] / "docs" / "assets" / "availability.json"
PRICES_JSON  = Path(__file__).parents[2] / "docs" / "data" / "prices.json"
RESERVAS_JSON= Path(__file__).parents[2] / "data-private" / "reservas.json"
DEBUG_DIR    = Path(__file__).parents[2] / "docs" / "assets" / "ical-debug"

HEADERS = {
    "User-Agent":      "CalendarStore/6.0 (1190; OS X 14.4) dataaccessd/1.0",
    "Accept":          "text/calendar, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control":   "no-cache",
}


def fetch_ical(url: str, debug_path: Path | None = None) -> tuple[list[dict], str | None]:
    """
    Fetch and parse an iCal URL.
    Returns (ranges_list, error_or_None).
    Saves raw iCal to debug_path if provided.
    Only filters CANCELLED/CANCELED events — all other statuses are treated as blocking.
    """
    try:
        resp = requests.get(url, timeout=30, headers=HEADERS)
        print(f"    HTTP {resp.status_code}  ({len(resp.content)} bytes)")
        if resp.status_code != 200:
            return [], f"HTTP {resp.status_code}"

        raw_text = resp.text

        # Save raw iCal for debugging
        if debug_path:
            debug_path.parent.mkdir(parents=True, exist_ok=True)
            debug_path.write_text(raw_text, encoding="utf-8")
            print(f"    raw saved → {debug_path.name}")

        # Print first chunk so it appears in CI logs
        lines = raw_text.splitlines()
        print(f"    -- raw iCal ({len(lines)} lines) --")
        for line in lines[:60]:
            print(f"    | {line}")
        if len(lines) > 60:
            print(f"    | ... ({len(lines) - 60} more lines)")

        cal    = Calendar.from_ical(resp.content)
        ranges = []

        for comp in cal.walk():

            # ── VEVENT (reservations and manually closed blocks) ──────────
            if comp.name == "VEVENT":
                try:
                    uid     = str(comp.get("UID", ""))
                    summary = str(comp.get("SUMMARY", "—"))
                    status  = str(comp.get("STATUS", "CONFIRMED")).upper()
                    transp  = str(comp.get("TRANSP", "OPAQUE")).upper()

                    # Only skip explicitly cancelled — everything else blocks
                    if status in ("CANCELLED", "CANCELED"):
                        print(f"    skip [CANCELLED]: {summary[:50]}")
                        continue

                    dtstart    = comp.get("DTSTART")
                    dtend_prop = comp.get("DTEND")
                    dur_prop   = comp.get("DURATION")

                    if not dtstart:
                        print(f"    skip [no DTSTART]: uid={uid[:24]} {summary[:30]}")
                        continue

                    start_raw = dtstart.dt
                    if dtend_prop:
                        end_raw = dtend_prop.dt
                    elif dur_prop:
                        end_raw = dur_prop.dt
                    else:
                        end_raw = None

                    # Normalise to plain date
                    if isinstance(start_raw, datetime):
                        start = start_raw.date()
                    elif isinstance(start_raw, date):
                        start = start_raw
                    else:
                        print(f"    skip [bad DTSTART type {type(start_raw).__name__}]: {summary[:30]}")
                        continue

                    if isinstance(end_raw, timedelta):
                        end = start + end_raw
                    elif isinstance(end_raw, datetime):
                        end = end_raw.date()
                    elif isinstance(end_raw, date):
                        end = end_raw
                    else:
                        end = start  # bumped below

                    # RFC 5545: DTEND is exclusive. Guard against same/earlier.
                    if end <= start:
                        end = start + timedelta(days=1)

                    print(f"    VEVENT [{status}/{transp}]: {start} -> {end}  \"{summary[:50]}\"")
                    ranges.append({"start": start.isoformat(), "end": end.isoformat()})

                except Exception as ev_err:
                    print(f"    !! VEVENT parse error: {ev_err}  uid={comp.get('UID','?')!s:.30}")

            # ── VFREEBUSY (manual blocks on some platforms) ───────────────
            elif comp.name == "VFREEBUSY":
                try:
                    fb_val = comp.get("FREEBUSY")
                    if not fb_val:
                        continue
                    items = fb_val if isinstance(fb_val, list) else [fb_val]
                    for item in items:
                        periods = item if isinstance(item, list) else [item]
                        for period in periods:
                            try:
                                s = period.start
                                if isinstance(s, datetime):
                                    s = s.date()
                                e = getattr(period, "end", None) or (s + getattr(period, "duration", timedelta(days=1)))
                                if isinstance(e, datetime):
                                    e = e.date()
                                if e <= s:
                                    e = s + timedelta(days=1)
                                print(f"    VFREEBUSY period: {s} -> {e}")
                                ranges.append({"start": s.isoformat(), "end": e.isoformat()})
                            except Exception as pe:
                                print(f"    !! period error: {pe}")
                except Exception as fb_err:
                    print(f"    !! VFREEBUSY error: {fb_err}")

        return ranges, None

    except Exception as exc:
        return [], str(exc)


def merge(ranges: list[dict]) -> list[dict]:
    """Merge overlapping or adjacent blocked ranges."""
    if not ranges:
        return []
    s = sorted(ranges, key=lambda x: x["start"])
    m = [dict(s[0])]
    for r in s[1:]:
        if r["start"] <= m[-1]["end"]:
            m[-1]["end"] = max(m[-1]["end"], r["end"])
        else:
            m.append(dict(r))
    return m


def load_manual_blocks() -> dict[str, list[dict]]:
    """Load manual_blocks from prices.json (direct bookings not in iCal feeds)."""
    try:
        prices = json.loads(PRICES_JSON.read_text(encoding="utf-8"))
        mb = prices.get("manual_blocks", {})
        count = sum(len(v) for v in mb.values())
        print(f"Manual blocks from prices.json: {count} total")
        for apt, blocks in mb.items():
            for b in blocks:
                print(f"  {apt}: {b.get('start')} → {b.get('end')}  {b.get('note','')}")
        return mb
    except Exception as e:
        print(f"Warning: could not load manual blocks from prices.json: {e}")
        return {}


def load_direct_reservas() -> dict[str, list[dict]]:
    """Load direct bookings (canal=Directo/Directa) from data-private/reservas.json."""
    try:
        if not RESERVAS_JSON.exists():
            print("  data-private/reservas.json not found — skipping direct bookings")
            return {}
        data = json.loads(RESERVAS_JSON.read_text(encoding="utf-8"))
        reservas = data.get("reservas", [])
        blocks: dict[str, list[dict]] = {}
        count = 0
        for r in reservas:
            canal = (r.get("canal") or "").strip().lower()
            if canal not in ("directo", "directa"):
                continue
            apt   = r.get("apt", "").strip().lower()
            start = (r.get("entrada") or "").strip()
            end   = (r.get("salida") or "").strip()
            if not apt or not start or not end or apt not in APTS:
                continue
            blocks.setdefault(apt, []).append({"start": start, "end": end})
            count += 1
        print(f"Direct bookings from reservas.json: {count} total")
        for apt, bl in blocks.items():
            for b in bl:
                print(f"  {apt}: {b['start']} → {b['end']}")
        return blocks
    except Exception as e:
        print(f"Warning: could not load direct bookings from reservas.json: {e}")
        return {}


def main() -> None:
    today  = date.today().isoformat()
    cutoff = (date.today() + timedelta(days=LOOKAHEAD)).isoformat()
    result = {}
    any_ok = False

    print(f"Sync — today={today}  cutoff={cutoff}  lookahead={LOOKAHEAD}d\n")

    manual_blocks  = load_manual_blocks()
    direct_blocks  = load_direct_reservas()
    print()

    for apt in APTS:
        all_ranges   = []
        sources_ok   = []
        fetch_errors = {}

        for src in SOURCES:
            key = f"ICAL_{apt.upper()}_{src.upper()}"
            url = os.environ.get(key, "").strip()
            if not url:
                print(f"  {apt}/{src}: not configured — skipping")
                continue

            debug_file = DEBUG_DIR / f"{apt}-{src}.ics" if os.environ.get("ICAL_DEBUG") else None
            print(f"  {apt}/{src}: fetching…")
            raw, err = fetch_ical(url, debug_path=debug_file)

            if err:
                print(f"    ✗ {err}")
                fetch_errors[src] = err
                continue

            sources_ok.append(src)
            any_ok = True

            future  = [r for r in raw if r["end"] > today and r["start"] <= cutoff]
            past    = [r for r in raw if r["end"] <= today]
            far     = [r for r in raw if r["start"] > cutoff]
            all_ranges.extend(future)
            print(f"    ✓ {len(raw)} events — {len(future)} kept, "
                  f"{len(past)} past, {len(far)} beyond lookahead ({cutoff})")

        # Merge manual blocks from prices.json (BloquesTab in admin)
        apt_manual = [
            {"start": b["start"], "end": b["end"]}
            for b in manual_blocks.get(apt, [])
            if b.get("start") and b.get("end") and b["end"] > today and b["start"] <= cutoff
        ]
        if apt_manual:
            print(f"  {apt}: adding {len(apt_manual)} manual block(s)")
            all_ranges.extend(apt_manual)

        # Merge direct bookings from reservas.json (canal=Directo/Directa)
        apt_direct = [
            {"start": b["start"], "end": b["end"]}
            for b in direct_blocks.get(apt, [])
            if b["end"] > today and b["start"] <= cutoff
        ]
        if apt_direct:
            print(f"  {apt}: adding {len(apt_direct)} direct booking block(s)")
            all_ranges.extend(apt_direct)

        merged = merge(all_ranges)
        result[apt] = {
            "blocked":      merged,
            "updated":      datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sources":      sources_ok,
            "fetch_errors": fetch_errors,
            "demo":         False,
        }
        print(f"  {apt}: {len(merged)} merged block(s) from {sources_ok or 'none'}\n")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)

    print(f"Written → {OUTPUT}")
    print("\n── Final blocked ranges ──")
    for apt, d in result.items():
        print(f"  {apt} ({len(d['blocked'])} blocks):")
        for b in d["blocked"]:
            print(f"    {b['start']} → {b['end']}")
        if d["fetch_errors"]:
            print(f"    errors: {d['fetch_errors']}")

    if not any_ok:
        print("\n⚠  WARNING: No iCal feed fetched — all sources failed or unconfigured.")
        if OUTPUT.exists():
            print("Keeping existing availability.json unchanged (stale data is better than none).")
            sys.exit(0)
        else:
            print("No existing availability.json to fall back on — aborting.")
            sys.exit(1)


if __name__ == "__main__":
    main()
