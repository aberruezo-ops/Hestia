#!/usr/bin/env python3
"""
Fetch iCal feeds from Booking.com and Airbnb, merge blocked ranges,
and write docs/assets/availability.json.

Each apartment reads two environment variables:
  ICAL_{APT}_{SOURCE}   e.g.  ICAL_VM_AIRBNB, ICAL_VM_BOOKING

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

APTS        = ["vm", "vt", "vs"]
SOURCES     = ["airbnb", "booking"]
LOOKAHEAD   = 365                                   # days ahead to keep
OUTPUT_FILE = Path(__file__).parents[2] / "docs" / "assets" / "availability.json"


def fetch_blocked(url: str) -> list[dict]:
    """Download an iCal URL and return list of {start, end} date strings."""
    if not url:
        return []
    try:
        resp = requests.get(url, timeout=20, headers={"User-Agent": "HestiaBot/1.0"})
        resp.raise_for_status()
        cal = Calendar.from_ical(resp.content)
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
            # icalendar returns date or datetime depending on the feed
            if isinstance(start, datetime):
                start = start.date()
            if isinstance(end, datetime):
                end = end.date()
            if start and end and end > start:
                ranges.append({"start": start.isoformat(), "end": end.isoformat()})
        return ranges
    except Exception as exc:
        print(f"    Warning: {exc}")
        return []


def merge(ranges: list[dict]) -> list[dict]:
    """Merge overlapping or adjacent blocked ranges."""
    if not ranges:
        return []
    sorted_r = sorted(ranges, key=lambda x: x["start"])
    merged   = [dict(sorted_r[0])]
    for r in sorted_r[1:]:
        if r["start"] <= merged[-1]["end"]:
            merged[-1]["end"] = max(merged[-1]["end"], r["end"])
        else:
            merged.append(dict(r))
    return merged


def main() -> None:
    today   = date.today().isoformat()
    cutoff  = (date.today() + timedelta(days=LOOKAHEAD)).isoformat()
    result  = {}

    for apt in APTS:
        all_ranges     = []
        active_sources = []

        for src in SOURCES:
            env_key = f"ICAL_{apt.upper()}_{src.upper()}"
            url     = os.environ.get(env_key, "").strip()
            if not url:
                print(f"  {apt}/{src}: secret {env_key} not set — skipping")
                continue

            print(f"  {apt}/{src}: fetching...")
            raw    = fetch_blocked(url)
            future = [r for r in raw
                      if r["end"] >= today and r["start"] <= cutoff]

            if future:
                all_ranges.extend(future)
                active_sources.append(src)
                print(f"    → {len(future)} events kept")
            else:
                print(f"    → no future events")

        result[apt] = {
            "blocked": merge(all_ranges),
            "updated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sources": active_sources,
            "demo":    False,
        }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)

    print(f"\nWritten → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
