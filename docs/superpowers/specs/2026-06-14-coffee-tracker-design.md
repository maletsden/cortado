# Coffee Tracker — Design Spec

**Date:** 2026-06-14
**Status:** Approved (design), pending spec review

## Purpose

A private PWA for a couple to log the coffees they make at home, from two
iPhones. Each person tracks their own coffees independently. The app shows
simple statistics and charts about their coffee habits, plus a caffeine meter
and an optional daily limit. It must be installable to the iPhone home screen
and work offline, 24/7, at zero hosting cost.

## Scope

### In scope (v1)

- **Menu** — browse coffee types as a photo "menu"; one tap logs a coffee (now).
- **Manage** — add / edit / delete coffee types (name, photo, color, caffeine mg).
- **Stats** — total count (today / week / month / all-time), by-type chart,
  time-of-day chart, current streak, this-week-vs-last-week comparison.
- **Caffeine meter** — sum of caffeine logged today vs a configurable ceiling
  (default 400 mg).
- **Daily limit** — optional max number of coffees per day; soft nudge when
  exceeded (never blocks logging).
- **Settings** — daily limit, caffeine ceiling.
- Installable PWA (manifest + service worker), offline-capable.
- Hosted free on GitHub Pages over HTTPS.

### Out of scope (v1)

- Backend / cloud sync / accounts (data is local to each phone).
- Merging the two people's data (logs are separate by design).
- Supplies / inventory tracking.
- Ratings, notes, editing a log's timestamp.
- Per-day trend chart.
- Cost-saved tracking, decaf flag, export/backup (noted as easy later adds).

## Key decisions

- **Data lives locally** on each phone (`localStorage`), no backend. Each phone
  is one person; no login. Tradeoff: clearing the browser or losing the phone
  loses that person's data, and each person sets up their own menu. Accepted for
  v1. The storage layer is abstracted so a backend can be added later without
  touching the UI.
- **Separate logs per person.** No combined/household stats in v1.
- **One-tap logging.** Tapping a coffee on the Menu logs it with the current
  timestamp. No extra fields.
- **Visual design: "Dark Luxe."** Near-black background (#0e0b09) with gold
  accent (#e7c79a), serif (Georgia) display headings, real coffee photography.
  Chosen interactively from mockups.

## Visual design

Three screens share a hero header, a photo-card body, and an editorial-label
bottom nav.

- **Hero header** — full-width coffee photo with a dark gradient overlay;
  overlaid greeting + today's headline ("3 cups today") + caffeine/streak line.
- **Photo menu cards** — each coffee is a full-bleed photo row with the name,
  caffeine mg, and logged count; a circular `＋` button logs it.
- **Editorial footer nav** — uppercase, letter-spaced text labels
  (MENU · STATS · MANAGE · SETTINGS); active label is gold with a thin underline.
  No icons.

Palette: bg `#0e0b09`, panel `#16100b`, gold `#e7c79a`, muted gold `#b8946a`,
dim text `#6b5848`, light text `#f0e8dc`, hairline `#1c140e`.

## Architecture

A static, client-only PWA. No build step, no dependencies, no framework. Plain
HTML + CSS + JavaScript (ES modules). Charts are drawn with CSS/SVG — no chart
library. Deployed as static files to GitHub Pages.

### Modules

- **storage.js** — the only module that touches `localStorage`. Exposes a small
  API (`getMenu`, `saveMenu`, `getLogs`, `addLog`, `deleteLog`, `getSettings`,
  `saveSettings`). Wraps all access in try/catch; returns safe defaults on
  missing/corrupt data. This is the single seam for a future backend.
- **stats.js** — pure functions only. Input: logs (+ menu for names/colors).
  Output: computed numbers (totals by period, counts by type, time-of-day
  buckets, current streak, this-week-vs-last-week, caffeine total today). No DOM,
  no storage — fully unit-testable.
- **charts.js** — renders computed numbers into CSS/SVG (bar lists, time-of-day
  bars, caffeine meter). Pure render functions: data in, DOM nodes/HTML out.
- **app.js** — UI shell: screen routing (Menu/Stats/Manage/Settings), event
  handling, wiring storage → stats → charts.
- **sw.js** + **manifest.json** — service worker (cache app shell for offline)
  and PWA manifest (name, icons, theme color, standalone display).

### Data model

```
MenuItem {
  id:         string        // generated
  name:       string        // "Espresso"
  photo:      string        // image URL or data URL (uploaded photo)
  color:      string        // hex, used in by-type chart
  caffeineMg: number        // per cup
}

Log {
  id:          string
  menuItemId:  string
  timestamp:   number        // epoch ms, set at tap
}

Settings {
  dailyLimit:       number | null   // max cups/day; null = off
  caffeineCeiling:  number          // mg, default 400
}
```

`localStorage` keys: `coffee.menu`, `coffee.logs`, `coffee.settings`.

### Photo handling

Each coffee type has a photo. The user can paste an image URL or upload a photo
from the phone (stored as a data URL in `localStorage`). A small set of curated
default photos is offered for common coffees. Uploaded images are kept small
(reasonable for a handful of menu items).

## Data flow

1. **Log:** tap a coffee on Menu → `storage.addLog({menuItemId, timestamp})` →
   re-render the hero header (today count + caffeine meter) and that card's count.
   If `dailyLimit` is set and exceeded, show a non-blocking nudge.
2. **Stats:** open Stats → `storage.getLogs()` + `getMenu()` → `stats.js`
   computes → `charts.js` renders.
3. **Manage:** add/edit/delete coffee types → `storage.saveMenu()`.
4. **Settings:** edit limit/ceiling → `storage.saveSettings()`.

## Error handling

- All `localStorage` reads/writes wrapped in try/catch.
- Missing or corrupt data → safe defaults; on first run, seed a starter menu
  (Espresso, Cappuccino, Flat White) so the app is never empty.
- A failed photo load falls back to a coffee-gradient placeholder behind the
  image.

## Testing

- **stats.js** — unit tests for pure functions: period totals, by-type counts,
  time-of-day bucketing, streak edge cases (gaps, today not yet logged), week
  boundary math (this vs last week), caffeine-today sum.
- **storage.js** — tested against a localStorage mock: round-trip, corrupt-data
  fallback, first-run seeding.
- **UI / charts / PWA install** — manual on iPhone Safari (install to home
  screen, offline launch, log a coffee, view stats).

## Hosting / deployment

- Repo pushed to GitHub; **GitHub Pages** serves the static files over HTTPS
  (required for iPhone PWA install). Free, 24/7.
- Both phones open the Pages URL in Safari and "Add to Home Screen."

## Future (not now)

Backend + sync (Firebase/Supabase free tier) behind the existing storage seam;
combined household stats; supplies tracking; export/backup; cost-saved; decaf.
