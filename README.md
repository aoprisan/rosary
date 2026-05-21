# Rosary · Metanier

A virtual prayer rope. Choose the number of beads, pick a prayer, and pray a
session bead by bead — spin the beads with your finger, tap them, or use the
buttons. Bilingual: **English** and **Română**.

Sibling to the [Orthodox Calendar](../orthodox) app; it shares the same
React + Vite + TypeScript stack and Byzantine visual language.

## Features

- **Choose your rope** — presets of 33 / 50 / 100 beads, or any custom count.
- **Choose a prayer** — the Jesus Prayer, the Lord's Prayer, the Theotokion,
  the Trisagion, or the Glory Be. One prayer is said on each bead.
- **A spinnable ring** — drag a finger around the rope to tick through beads,
  tap a bead to jump, tap the centre (or use ←/→) to advance. The active bead
  glows like a vigil lamp; completed circuits are counted.
- **Bilingual** — every prayer and label is provided in English and Romanian;
  the choice is remembered between visits.
- Progress, language, bead count, and prayer choice persist in `localStorage`.
- **Installable PWA** — a web app manifest + service worker (Workbox) make it
  installable to the home screen and fully usable offline.

## Tech stack

- [React 18](https://react.dev/) + TypeScript
- [Vite 5](https://vitejs.dev/)
- Hand-rolled CSS with design tokens (no UI framework), shared palette with the
  Orthodox Calendar
- Custom, dependency-free i18n (`src/i18n/`)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the manifest +
  service worker. Icons are generated from `public/icon.svg`.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173/rosary/
```

## Build & checks

```bash
npm run typecheck    # tsc, no emit
npm run build        # tsc -b && vite build  →  dist/
npm run preview      # serve the production build
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. The app is served under `/rosary/` (see
`base` in `vite.config.ts`); set the repository's **Settings → Pages → Source**
to **GitHub Actions**.

## Project layout

```
src/
  App.tsx                 # screen state (setup ↔ session) + persisted settings
  types.ts                # Lang, Localized, Prayer, SessionConfig
  data/prayers.ts         # the prayers (EN + RO), as display lines
  i18n/
    strings.ts            # UI strings (en / ro) + t()
    loc.ts                # resolve a { en, ro } value for the active language
  components/
    SetupScreen.tsx       # bead-count + prayer pickers
    SessionScreen.tsx     # session state, progress, circuit counting
    BeadRing.tsx          # the interactive, spinnable prayer rope
    PrayerCard.tsx        # the prayer text for the active language
    LangSelector.tsx      # EN / RO toggle
  styles/
    tokens.css            # palette, typography, motion, background
    app.css               # layout + components
```
