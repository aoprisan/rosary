# Rosary · Metanier

A virtual prayer rope. Choose the number of beads, pick a prayer, and pray a
session bead by bead — trace a full circle around the rope with your finger to
tell each bead, or use the buttons. Bilingual: **English** and **Română**.

Sibling to the [Orthodox Calendar](../orthodox) app; it shares the same
React + Vite + TypeScript stack. The interface is set like a leaf from an
Orthodox *Ceaslov* (Book of Hours): warm laid paper printed in two inks —
iron-gall black for the body, cinnabar red for the rubrics — with a
hand-drawn frontispiece, a three-bar cross, and an illuminated initial
opening each prayer.

## Features

- **Choose your rope** — presets of 33 / 50 / 100 beads, or any custom count.
- **Choose a prayer** — the Jesus Prayer, the Lord's Prayer, the Theotokion,
  the Trisagion, or the Glory Be. One prayer is said on each bead.
- **A circled ring** — trace one full circle around the rope to tell a single
  bead (reverse the loop to step back); a cinnabar arc fills as you go, and
  partial circles are banked across strokes so a bead can be closed over
  several movements. Arrow keys and the Previous/Next buttons remain for
  keyboard and accessibility. The told bead is inked in cinnabar; completed
  circuits are counted.
- **Bilingual** — every prayer and label is provided in English and Romanian;
  the choice is remembered between visits.
- Progress, language, bead count, and prayer choice persist in `localStorage`.
- **Practice mode** — an optional, reverent layer for the Jesus Prayer:
  - **Paced breathing** — one calm form expands on the inhale and contracts on
    the exhale, the prayer's two halves resting on each. Durations are gentle
    and configurable (4s in / 6s out by default, with an optional hold); it
    honours the OS *reduce-motion* setting with a still, text-only fallback,
    holds a screen **wake lock**, and ends softly when its bound (a number of
    breaths, a duration, or open-ended) is reached. A one-time, dismissible
    pastoral note appears on first use. Optionally advances the rope one knot
    per completed breath.
  - **Ambient sound** — bundled, gapless-looping ison/drone and chant beds with
    an independent per-layer volume mixer, plus an optional soft tap on each
    completed circuit. All offline; played via the Web Audio API (no library).
  - All of it defaults **off** and is configured in the *Breath & sound* panel;
    nothing is gamified — no streaks, scores, or notifications.
- **Installable PWA** — a web app manifest + service worker (Workbox) make it
  installable to the home screen and fully usable offline.

### Audio assets

The ambient layers live in `public/audio/` (precached by the service worker for
offline use). The committed files are tiny **synthesized placeholders** — drop
real, royalty-free recordings in under the same names to replace them:

| File               | Role                         | Format / notes               |
| ------------------ | ---------------------------- | ---------------------------- |
| `ison-drone.wav`   | low ison / drone, loops      | seamless loop, 44.1 kHz mono |
| `chant.wav`        | soft chant bed, loops        | seamless loop, 44.1 kHz mono |
| `semantron.wav`    | short tap, one-shot per knot | ~300 ms, 44.1 kHz mono       |

WAV or OGG both work (`decodeAudioData`). Regenerate the placeholders with
`node scripts/gen-audio.mjs`.

## Tech stack

- [React 18](https://react.dev/) + TypeScript
- [Vite 5](https://vitejs.dev/)
- Hand-rolled CSS with design tokens (no UI framework) — a two-ink prayer-book
  palette, with EB Garamond + Uncial Antiqua type and hand-drawn SVG ornaments
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
    SetupScreen.tsx       # bead-count + prayer pickers (title page + index)
    SessionScreen.tsx     # session state, progress, circuit counting
    BeadRing.tsx          # the interactive, spinnable prayer rope
    PrayerCard.tsx        # the prayer text for the active language
    Ornament.tsx          # hand-drawn SVG headpiece, divider rule, and cross
    LangSelector.tsx      # EN / RO toggle
  styles/
    tokens.css            # palette, typography, motion, background
    app.css               # layout + components
```
