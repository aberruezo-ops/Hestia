#!/usr/bin/env python3
"""
Run this script from your OWN computer to sync availability from Booking.com.

Booking.com restricts iCal fetches to known calendar-app IPs.
Run from your home/office machine where your IP is not restricted.

Usage (from repo root):
    python3 .github/scripts/sync_local.py

Then commit the updated docs/assets/availability.json and push.
"""

import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    import requests
    from icalendar import Calendar
except ImportError:
    print("Missing deps — run: pip install requests icalendar")
    sys.exit(1)

# ── iCal URLs — add Airbnb URLs when available ───────────────────────────────
ICAL_URLS = {
    "vm": {
        "booking": "https://ical.booking.com/v1/export?t=782a0141-0657-48ea-81fc-2b45e4a5ac12",
        "airbnb":  "",
    },
    "vt": {
        "booking": "https://ical.booking.com/v1/export?t=b7ee28cf-3302-435e-ab0e-4f9e64f3f6a7",
        "airbnb":  "",
    },
    "vs": {
        "booking": "https://ical.booking.com/v1/export?t=237c401e-dc78-4a18-a06d-00868f58c58c",
        "airbnb":  "",
    },
}

LOOKAHEAD = 365
OUTPUT    = Path(__file__).parents[2] / "docs" / "assets" / "availability.json"

HEADERS = {
    "User-Agent":      "CalendarStore/6.0 (1190; OS X 14.4) dataaccessd/1.0",
    "Accept":          "text/calendar, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control":   "no-cache",
}


def fetch_ical(url: str) -> tuple[list[dict], str | None]:
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
            dtend   = comp.get("DTEND") or comp.get("DURATION")
            if not dtstart:
                continue
            start = dtstart.dt
            end   = dtend.dt if dtend else start
            # Handle DURATION instead of DTEND
            if isinstance(end, timedelta):
                end = start + end
            if isinstance(start, datetime):
                start = start.date()
            if isinstance(end, datetime):
                end = end.date()
            # Single-day events where DTSTART == DTEND: checkout is the following day
            if end <= start:
                end = start + timedelta(days=1)
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
    today  = date.today().isoformat()
    cutoff = (date.today() + timedelta(days=LOOKAHEAD)).isoformat()
    result = {}

    for apt, sources in ICAL_URLS.items():
        all_ranges   = []
        sources_ok   = []
        fetch_errors = {}

        for src, url in sources.items():
            if not url:
                print(f"  {apt}/{src}: not configured — skipping")
                continue
            print(f"  {apt}/{src}: fetching...")
            raw, err = fetch_ical(url)
            if err:
                print(f"    ✗ {err}")
                fetch_errors[src] = err
                continue
            sources_ok.append(src)
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
    print("\nNext steps:")
    print("  git add docs/assets/availability.json")
    print('  git commit -m "chore: sync availability"')
    print("  git push")


if __name__ == "__main__":
    main()
