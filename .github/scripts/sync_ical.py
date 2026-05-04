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
    from icalendar import Calendar, vPeriod
except ImportError:
    print("Missing deps — run: pip install requests icalendar")
    sys.exit(1)

APTS      = ["vm", "vt", "vs"]
SOURCES   = ["airbnb", "booking"]
LOOKAHEAD = 365
OUTPUT    = Path(__file__).parents[2] / "docs" / "assets" / "availability.json"

HEADERS = {
    "User-Agent":      "CalendarStore/6.0 (1190; OS X 14.4) dataaccessd/1.0",
    "Accept":          "text/calendar, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control":   "no-cache",
}

# Booking.com sometimes sends DTEND as inclusive (last blocked night) instead of
# exclusive (first free night per RFC 5545).  We detect this by checking whether
# DTEND == DTSTART (single-day all-day block) and NEVER adjust in that case.
# For multi-night all-day ranges Booking uses exclusive DTEND — keep as-is.


def _to_date(val) -> date | None:
    """Convert icalendar date/datetime value to a plain date, or None."""
    if val is None:
        return None
    dt = val.dt if hasattr(val, "dt") else val
    if isinstance(dt, datetime):
        # Use UTC date; Booking.com all-day events use DATE not DATE-TIME,
        # but if a datetime slips through, take the UTC date.
        return dt.utctimetuple()[:3]  # (y, m, d)
    if isinstance(dt, date):
        return dt
    if isinstance(dt, timedelta):
        return dt  # caller handles duration
    return None


def _coerce_date(val) -> date | None:
    result = _to_date(val)
    if isinstance(result, tuple):
        return date(*result)
    return result


def fetch_ical(url: str) -> tuple[list[dict], str | None]:
    """
    Fetch and parse an iCal URL.
    Returns (ranges_list, error_or_None).
    Skips CANCELLED/CANCELED events; handles VFREEBUSY blocks.
    Individual parse errors per event are caught and logged without aborting.
    """
    try:
        resp = requests.get(url, timeout=30, headers=HEADERS)
        if resp.status_code != 200:
            return [], f"HTTP {resp.status_code}"

        cal    = Calendar.from_ical(resp.content)
        ranges = []

        for comp in cal.walk():

            # ── VEVENT (reservations and manually closed blocks) ──────────
            if comp.name == "VEVENT":
                try:
                    uid     = str(comp.get("UID", ""))
                    summary = str(comp.get("SUMMARY", "—"))
                    transp  = str(comp.get("TRANSP", "OPAQUE")).upper()
                    status  = str(comp.get("STATUS", "CONFIRMED")).upper()

                    # Skip cancelled reservations — they should not block dates
                    if status in ("CANCELLED", "CANCELED"):
                        print(f"    skip [cancelled]: {summary[:45]}")
                        continue

                    # TRANSPARENT events are "free" (no blocking)
                    if transp == "TRANSPARENT":
                        print(f"    skip [transparent]: {summary[:45]}")
                        continue

                    dtstart = comp.get("DTSTART")
                    if not dtstart:
                        print(f"    skip [no DTSTART]: uid={uid[:24]} {summary[:30]}")
                        continue

                    start_raw = dtstart.dt
                    dtend_prop = comp.get("DTEND")
                    dur_prop   = comp.get("DURATION")

                    if dtend_prop:
                        end_raw = dtend_prop.dt
                    elif dur_prop:
                        end_raw = dur_prop.dt  # timedelta
                    else:
                        end_raw = None

                    # Convert datetimes → dates
                    if isinstance(start_raw, datetime):
                        start = start_raw.date()
                    elif isinstance(start_raw, date):
                        start = start_raw
                    else:
                        print(f"    skip [bad DTSTART type {type(start_raw)}]: {summary[:30]}")
                        continue

                    if isinstance(end_raw, timedelta):
                        end = start + end_raw
                    elif isinstance(end_raw, datetime):
                        end = end_raw.date()
                    elif isinstance(end_raw, date):
                        end = end_raw
                    else:
                        end = start  # will be bumped below

                    # RFC 5545: DTEND for DATE values is exclusive.
                    # Guard against end <= start (some feeds send same-day).
                    if end <= start:
                        end = start + timedelta(days=1)

                    print(f'    event [{status}]: {start} -> {end}  "{summary[:45]}"')
                    ranges.append({"start": start.isoformat(), "end": end.isoformat()})

                except Exception as ev_err:
                    print(f"    !! VEVENT parse error: {ev_err} — uid={comp.get('UID','?')!s:.24}")

            # ── VFREEBUSY (some platforms use this for manual blocks) ─────
            elif comp.name == "VFREEBUSY":
                try:
                    fb_val = comp.get("FREEBUSY")
                    if not fb_val:
                        continue
                    fb_items = fb_val if isinstance(fb_val, list) else [fb_val]
                    for item in fb_items:
                        periods = item if isinstance(item, list) else [item]
                        for period in periods:
                            try:
                                if hasattr(period, "start"):
                                    s = period.start.date() if isinstance(period.start, datetime) else period.start
                                    if hasattr(period, "end"):
                                        e = period.end.date() if isinstance(period.end, datetime) else period.end
                                    elif hasattr(period, "duration"):
                                        e = s + period.duration
                                    else:
                                        e = s + timedelta(days=1)
                                else:
                                    continue
                                if e <= s:
                                    e = s + timedelta(days=1)
                                print(f"    freebusy: {s} → {e}")
                                ranges.append({"start": s.isoformat(), "end": e.isoformat()})
                            except Exception as per_err:
                                print(f"    !! period parse error: {per_err}")
                except Exception as fb_err:
                    print(f"    !! VFREEBUSY parse error: {fb_err}")

        return ranges, None

    except Exception as exc:
        return [], str(exc)


def merge(ranges: list[dict]) -> list[dict]:
    """Merge overlapping or adjacent blocked ranges (ISO date strings)."""
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


def main() -> None:
    today  = date.today().isoformat()
    cutoff = (date.today() + timedelta(days=LOOKAHEAD)).isoformat()
    result = {}
    any_ok = False

    print(f"Sync — today={today}  cutoff={cutoff}\n")

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

            print(f"  {apt}/{src}: fetching {url[:60]}…")
            raw, err = fetch_ical(url)

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
            print(f"    ✓ {len(raw)} events total — "
                  f"{len(future)} kept, {len(past)} past, {len(far)} beyond lookahead")

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
        print(f"  {apt}: {d['blocked']}")
        if d["fetch_errors"]:
            print(f"       errors: {d['fetch_errors']}")

    if not any_ok:
        print("\n⚠ WARNING: No iCal feed fetched — all sources failed or unconfigured.")
        sys.exit(1)


if __name__ == "__main__":
    main()
