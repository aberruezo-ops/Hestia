#!/usr/bin/env python3
"""
Fetch iCal feeds from Booking.com and Airbnb, merge blocked ranges,
and write docs/assets/availability.json.

Env vars (set in workflow or locally):
  ICAL_VM_AIRBNB, ICAL_VM_BOOKING
  ICAL_VT_AIRBNB, ICAL_VT_BOOKING
  ICAL_VS_AIRBNB, ICAL_VS_BOOKING

Apartments: vm (Mar), vt (Thalassa), vs (Salinas)
Sources:    airbnb, booking
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

APTS      = ["vm", "vt", "vs"]
SOURCES   = ["airbnb", "booking"]
LOOKAHEAD = 365
OUTPUT    = Path(__file__).parents[2] / "docs" / "assets" / "availability.json"

# Calendar-app User-Agent — avoids bot-blockers
HEADERS = {
    "User-Agent":      "CalendarStore/6.0 (1190; OS X 14.4) dataaccessd/1.0",
    "Accept":          "text/calendar, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control":   "no-cache",
}


def fetch_ical(url: str) -> tuple[list[dict], str | None]:
    """
    Fetch iCal URL.
    Returns (ranges, error_message).
    ranges is [] both on success-with-no-events and on failure.
    error_message is None on success, a string on failure.
    """
    try:
        resp = requests.get(url, timeout=30, headers=HEADERS)
        if resp.status_code != 200:
            return [], f"HTTP {resp.status_code}"
        cal    = Calendar.from_ical(resp.content)
        ranges = []
        for comp in cal.walk():
            if comp.name != "VEVENT":
                continue
            dtstart = comp.get("DTSTART")
            dtend   = comp.get("DTEND") or comp.get("DTSTART")
            if not dtstart:
                continue
            start = dtstart.dt
            end   = dtend.dt
            if isinstance(start, datetime):
                start = start.date()
            if isinstance(end, datetime):
                end = end.date()
            if start and end and end > start:
                ranges.append({"start": start.isoformat(), "end": end.isoformat()})
        return ranges, None
    except Exception as exc:
        return [], str(exc)


def merge(ranges: list[dict]) -> list[dict]:
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
    today   = date.today().isoformat()
    cutoff  = (date.today() + timedelta(days=LOOKAHEAD)).isoformat()
    result  = {}
    any_ok  = False

    for apt in APTS:
        all_ranges    = []
        sources_ok    = []   # fetched successfully (even if no events)
        fetch_errors  = {}   # source → error message

        for src in SOURCES:
            key = f"ICAL_{apt.upper()}_{src.upper()}"
            url = os.environ.get(key, "").strip()
            if not url:
                print(f"  {apt}/{src}: not configured — skipping")
                continue

            print(f"  {apt}/{src}: fetching {url[:60]}...")
            raw, err = fetch_ical(url)

            if err:
                print(f"    ✗ {err}")
                fetch_errors[src] = err
                continue

            sources_ok.append(src)
            any_ok = True
            future = [r for r in raw if r["end"] >= today and r["start"] <= cutoff]
            all_ranges.extend(future)
            print(f"    ✓ {len(raw)} events total, {len(future)} future")

        result[apt] = {
            "blocked":      merge(all_ranges),
            "updated":      datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sources":      sources_ok,
            "fetch_errors": fetch_errors,
            "demo":         False,
        }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)

    print(f"\nWritten → {OUTPUT}")

    # Summary
    print("\n── Summary ──")
    for apt, d in result.items():
        ok   = d["sources"]
        errs = d["fetch_errors"]
        blk  = len(d["blocked"])
        print(f"  {apt}: {blk} blocked range(s)  |  ok={ok}  |  errors={errs or 'none'}")

    if not any_ok:
        print("\n⚠ WARNING: No iCal feed could be fetched — all sources failed or unconfigured.")
        sys.exit(1)


if __name__ == "__main__":
    main()
