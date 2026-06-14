# Cortado

A small coffee-tracking PWA. Tap a coffee to log it, watch your daily count, caffeine
ceiling, streak, and stats. Built for two phones — no accounts, no server. Data lives in
each device's `localStorage`.

"Dark Luxe" theme. Vanilla JS ES modules, no build step, no dependencies.

## Features

- One-tap logging from a photo menu
- Hero header: cups today, caffeine vs. ceiling, current streak
- Stats: totals (today / week / month / all-time), by-type bars, time-of-day chart, week comparison
- Manage your own coffees (name, caffeine, photo, color)
- Settings: daily coffee limit + caffeine ceiling, with an over-limit nudge
- Installable PWA, works offline

## Run locally

ES modules need to be served over HTTP (opening `index.html` via `file://` won't work).
Any static server does. With Python:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or with Node:

```bash
npx serve .
```

## Tests

Pure logic (storage + stats) is covered by Node's built-in test runner:

```bash
npm test   # = node --test
```

## Icons

App icons are generated (no binary assets checked in by hand):

```bash
node scripts/gen-icons.mjs   # writes icons/icon-192.png and icon-512.png
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Build and deployment → Source: **Deploy from a branch**.
3. Pick the branch and `/ (root)` folder, save.
4. Open the published URL on each iPhone in Safari → Share → **Add to Home Screen**.

Everything is static and relative-pathed, so it serves correctly from a project subpath
(`https://<user>.github.io/<repo>/`).

## Notes

- Data is per-device. The two phones do not sync — each keeps its own log.
- Clearing Safari site data wipes the log.
- Coffee photos load from Unsplash; once visited they're cached for offline use.
