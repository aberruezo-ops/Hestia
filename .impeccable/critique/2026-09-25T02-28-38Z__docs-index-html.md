---
target: docs/index.html (home) + thalassa.html + reservas.html spot-check
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-09-25T02-28-38Z
slug: docs-index-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Price/availability badges pop in silently after async fetch, no skeleton state |
| 2 | Match System / Real World | 4/4 | Real owners, real place names, real license numbers, authentic local references |
| 3 | User Control and Freedom | 3/4 | Modals/widgets dismiss fine; no way to collapse the stacked promo bands as a group |
| 4 | Consistency and Standards | 2/4 | Color/corner system consistent, but the direct-booking *promise* text is not (P0), and two independent date-picker patterns coexist for the same task |
| 5 | Error Prevention | 3/4 | Hero date form validates range client-side with aria-invalid/role="alert" |
| 6 | Recognition Rather Than Recall | 3/4 | Color-coded apartments aid recall well |
| 7 | Flexibility and Efficiency | 3/4 | URL params prefill reservas.html for repeat/power flows |
| 8 | Aesthetic and Minimalist Design | 2/4 | Homepage stacks 15+ sections plus a persistent floating widget column in one session |
| 9 | Error Recovery | 3/4 | Hero error messaging is clear and localized |
| 10 | Help and Documentation | 3/4 | In-page QuickFAQ + FAQPage schema, appropriate for a persuade-mode page |
| **Total** | | **29/40** | **Good** |

## Design Specificity Verdict

**LLM assessment**: This reads as authored for this exact business, not a template. The three apartment-color tokens (`--vm` olive, `--vt` copper, `--vs` gold) run through dozens of real usages, the asymmetric `10px 0 10px 0` corner motif recurs 50+ times, and the copy is full of hyper-local specifics (Salar de los Canos, named owners Alex/Fran with individual WhatsApp lines, "320+ días de sol"). Where it slips toward generic-SaaS-marketing territory is the *volume* of persuasion machinery stacked on one page — individually bespoke, collectively it reads like a conversion-optimization checklist.

**Deterministic scan**: Static CLI scan (index.html, thalassa.html, reservas.html + 6 core JSX components) found only 3 findings, all the same low-severity rule: `overused-font` flagging **Fraunces** loaded via Google Fonts on all three pages (index.html:38, thalassa.html:38, reservas.html:37). This doesn't match the documented type system (Playfair Display + Inter) — worth checking whether that's leftover/unused weight or an actual second display font nobody meant to ship. Zero findings in any of the 6 JSX component files.

The **live, rendered** scan (injected into an actual browser, both desktop 1440×900 and mobile 390×844, on all 3 pages) is where the real evidence is, and it corroborates and sharpens the LLM read:
- **`low-contrast` — up to 30 instances per page**, including at least two cases of **text rendered in the exact same color as its background** (`#2a0f2e` on `#2a0f2e`, `#f0e8d5` on `#f0e8d5`) — i.e. genuinely invisible text, not just "hard to read." This is precisely the failure mode your own project rules already name as "el error recurrente #1": a light-surface-on-dark-section that inherited the wrong text color instead of declaring its own.
- **`undersized-ui-text` — 15-18 instances per page**, including the apartment quick-nav labels themselves ("MAR", "THALASSA", "SALINAS") and star-rating numbers rendering under a 10-11px readable floor.
- **`monotonous-spacing`**: ~4px spacing value reused in 171 of 175 measured gaps (98%) — everything sits at the same rhythm, nothing gets more room to breathe.
- Higher-noise rule categories (`ai-color-palette`, `dark-glow`, `gradient-text`, `gpt-thin-border-wide-shadow`) fired heavily too (66-72 hits on the homepage alone) — these track surface patterns associated with generic AI-template aesthetics, which lines up with the LLM's "persuasion machinery" critique, but should be treated as directional signal, not a precise count: part of the `text-occlusion` findings turned out to be the detector's *own* debug overlay text overlapping itself, confirmed by grepping the site source for zero matches. Contrast and undersized-text findings, by contrast, cite real Hestía hex tokens and are not artifacts.

**Visual evidence**: full-page screenshots were captured at both viewports on all 3 pages. One apparent "giant blank section" in the stitched screenshots (the Compare table on index.html) was root-caused via `getComputedStyle` to the site's own scroll-reveal animation (`useReveal()`, opacity:0 until an IntersectionObserver fires) — confirmed as a screenshot-timing artifact, not a real bug; real visitors scrolling normally see it render. One overlap **was** confirmed real on a clean, non-stitched capture: on `reservas.html` at desktop width, the cookie-consent card renders bottom-left with no backdrop and visibly truncates the last two FAQ answers underneath it. No live overlay tab is available for you to inspect directly in this remote session (the local server and live-server were both stopped after evidence collection); the findings above are the full record.

## Overall Impression

The bones are genuinely good — a real, maintained brand system and copy that could only be Hestía. The gap between "well-designed" and "genuinely production-ready" is two different things: (1) a handful of concrete, fixable accessibility/contrast bugs that both assessments converge on independently, and (2) a homepage that tries to close the sale four separate times instead of once, confidently.

## What's Working

- **`WidgetStack`** (shared.jsx): six floating widgets all default to a minimized pill and remember state in localStorage — real restraint, not a template default.
- **`DirectBookingPerks` / `.dbt-band`**: a purpose-built, reduced-motion-aware section tied directly to the core "book direct" differentiator, not a stock promo banner.
- **The apartment-color system**: consistently applied from hero thumbnails through the comparison table and mobile cards — a maintained identity, not a one-off. Confirmed clean by the static scanner across every JSX component checked.

## Priority Issues

**[P0] Invisible text: at least two instances of text color identical to its background**
- What: live browser scan measured `#2a0f2e` text on `#2a0f2e` background and `#f0e8d5` on `#f0e8d5` background — 1.0:1 contrast, i.e. the text cannot be read at all in that state.
- Why it matters: this is a content-blocking accessibility failure, not a taste issue, and it's exactly the failure mode your own project documentation flags as the #1 recurring bug class (a light-surface component nested in a dark section that didn't declare its own text color, or vice versa).
- Fix: find the specific component(s) rendering `#2a0f2e`-on-`#2a0f2e` and `#f0e8d5`-on-`#f0e8d5` (a fresh `$impeccable audit` with browser evidence will pinpoint the exact selector/state — the live scan that found this didn't preserve DOM paths for these two hits) and give them an explicit, hardcoded text color per the existing house rule instead of inheriting.
- Suggested command: `$impeccable audit`

**[P0] Absolute claim in reservas.html FAQ contradicts the hedged copy used everywhere else**
- What: `docs/reservas.html` line 48 (FAQPage JSON-LD): *"Sí. Nuestro precio directo es siempre mejor que cualquier plataforma, sin excepciones."* Every other instance of this claim is deliberately hedged (`DIRECT_PERKS.comision`: "hasta un 10% aprox.", with `reservas-page.jsx` even carrying a disclaimer explaining why it's not exact).
- Why it matters: this is baked into structured data Google may surface verbatim in search/voice results, on the page whose whole job is converting, and it directly conflicts with your own CLAUDE.md rule ("hasta un 10% aprox., no un número fijo distinto").
- Fix: rewrite to match the hedged phrasing used everywhere else.
- Suggested command: `$impeccable clarify`

**[P1] Cookie-consent card overlaps and truncates FAQ content on reservas.html (desktop)**
- What: confirmed on a clean, non-stitched screenshot at 1440×900 — the cookie card has no backdrop and its top-right corner covers the first characters of the last two FAQ answers underneath it.
- Why it matters: this is the booking page; a visitor trying to read cancellation-policy or date-change FAQ content right before committing to pay gets it physically obscured by a compliance banner.
- Fix: give the cookie card a scrim/backdrop or reposition it so it never overlaps page content, especially on reservas.html.
- Suggested command: `$impeccable harden`

**[P1] Desktop nav shows 10 simultaneous links plus a topbar with two phone numbers before the fold**
- What: `Header` (chrome.jsx) plus `Topbar` above it.
- Why it matters: this is the first decision surface on a page whose real job is to move the visitor into the hero's date picker; confirmed as a >4-option decision point by both the cognitive-load checklist and (indirectly) the detector's `monotonous-spacing`/density signals.
- Fix: collapse "Para empresas", "Extracto Guía" and "Noticias" into the footer/mobile-menu only.
- Suggested command: `$impeccable layout`

**[P2] Two structurally independent "check availability" widgets on one page**
- What: the hero's native date-input pair (redirects to reservas.html) and the separate `HomeSearch` calendar component mounted further down, holding independent state.
- Why it matters: a visitor who fills the hero dates and scrolls down meets a second, reset picker for what looks like the same task.
- Fix: seed `HomeSearch`'s initial dates from the hero's chosen values, or replace the hero fields with a single button that opens/scrolls to `HomeSearch`.
- Suggested command: `$impeccable layout`

**[P2] Undersized functional text below the readable floor**
- What: live scan measured the apartment quick-nav labels ("MAR"/"THALASSA"/"SALINAS") and star-rating numbers at 9-10.5px.
- Why it matters: these are navigation and trust-signal elements, exactly where legibility matters most, on both desktop and mobile.
- Fix: raise to at least 11-12px for functional/UI text.
- Suggested command: `$impeccable typeset`

**[P3] Redundant repetition of the direct-booking pitch dilutes its own climax**
- What: "reserva directa / 0% comisiones / hasta 10%" is independently restated at least four times on one homepage load (hero price line, each apartment card's price badge, the dedicated `dbt-band` section, and a teaser right before the contact CTA).
- Why it matters: four full restatements risks banner-blindness by the time the visitor reaches the section actually meant to be the persuasive high point.
- Fix: keep the micro-mentions and the one dedicated section; fold the teaser into the contact CTA as a single inline line.
- Suggested command: `$impeccable distill`

## Persona Red Flags

**Jordan (First-Timer)**: Lands on 10 nav links + an unexplained two-number topbar before the headline. Fills the hero's date form, scrolls past several sections, and meets `HomeSearch`'s empty calendar — unsure whether their first entry "counted."

**Casey (Distracted Mobile User)**: The hero alone stacks six content blocks over an autoplaying video before any scroll. Further down, `mob-book-btn`, a weather widget FAB, floating chat, a sound toggle and the cookie banner all compete for thumb space simultaneously — real risk of visual crowding on a small screen.

**Sam (Accessibility-Dependent User)**: Directly hit by the confirmed P0 — text-on-identical-background is invisible regardless of assistive tech, and 9-10.5px functional labels fail comfortably at 100% browser zoom before any accessibility settings even come into play.

## Minor Observations

- `overused-font`: Fraunces is loaded via Google Fonts on index/thalassa/reservas but isn't part of the documented Playfair Display + Inter system — worth confirming it's intentional and not leftover.
- Ambient sea audio defaults to ON and autoplays on first gesture — an unexpected sound can startle someone browsing quietly.
- `DIRECT_PERKS.descuento` mixes two framings of the long-stay deal (percentage-off stat + price-per-month sentence) in one card.
- Three attention-grabbing bands (offer banner, ratings marquee, cookie consent) can all be visible near-simultaneously on a first visit.

## Questions to Consider

- What if the header nav were cut to Mar / Thalassa / Salinas / Reservar only, with everything else living in the footer and mobile menu?
- What if there were exactly one "check availability" widget on the whole homepage?
- What if the direct-booking pitch appeared once, at full strength, timed with the price display — would visitors trust it more precisely because it wasn't repeated?
