# Cortado

A minimalist coffee-tracking web app for two. Tap a coffee to log it, then watch your
daily count, caffeine load, and brewing streak — all in a quiet "Dark Luxe" interface.

**Live:** https://maletsden.github.io/cortado/

## Overview

Cortado is a fully client-side progressive web app. There are no accounts and no server —
each device keeps its own history in the browser, so it installs to a phone's home screen
and runs offline like a native app.

## Features

- **One-tap logging** from a photo menu of your coffees
- **At-a-glance header** — cups today, caffeine against your ceiling, current streak
- **Stats** — totals across day / week / month / all-time, breakdown by type, time-of-day rhythm, and week-over-week comparison
- **Your menu** — add coffees with their own name, caffeine content, photo, and color
- **Gentle limits** — set a daily cup limit and caffeine ceiling, with an unobtrusive nudge when you go over
- **Installable & offline** — add to home screen, works without a connection

## Tech

Vanilla JavaScript ES modules. No framework, no build step, no runtime dependencies.
Charts are pure CSS. State persists in `localStorage`. Offline support via a service
worker and web app manifest.

## Development

```bash
npm test                     # run the test suite (Node's built-in runner)
python -m http.server 8000   # serve locally at http://localhost:8000
```

App icons are generated, not committed by hand: `node scripts/gen-icons.mjs`.

## License

MIT
