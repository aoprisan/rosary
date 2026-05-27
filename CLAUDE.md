# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A virtual Orthodox prayer rope (*metanier* / chotki) as an installable, offline-capable PWA. Pick a bead count and a prayer, then pray bead by bead. Fully bilingual (English / Română). React 18 + TypeScript + Vite, no UI framework — hand-rolled CSS styled as a leaf from a *Ceaslov* (Book of Hours).

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173/rosary/  (note the /rosary/ path)
npm run typecheck    # tsc -b --noEmit — the only "lint" gate
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production build
```

There is **no test suite and no separate linter**. CI (`.github/workflows/ci.yml`, runs on every branch except `main` and on PRs) and the deploy job both gate on exactly `typecheck` + `build`. TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters`, so dead code and unused imports break the build — keep changes clean. Run `npm run typecheck` before considering a change done.

## The `/rosary/` base path

`vite.config.ts` sets `base: '/rosary/'` because the app is served from a GitHub Pages project page. This applies in dev too, so the local URL is `/rosary/`, not `/`. All asset/scope/start_url paths in the PWA manifest live under `/rosary/`. Don't introduce root-absolute (`/foo`) asset URLs.

## Deploy

Push to `main` → `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages. `dist/` is gitignored (built in CI, not committed).

## Architecture

Two screens, switched by a single `screen` state in `src/App.tsx` (`'setup' | 'session'`) — there is no router. `App.tsx` owns the cross-screen settings (`lang`, `beadCount`, `prayerId`) and persists each to `localStorage` via `useEffect`.

- **`SetupScreen`** — pick bead count (presets 33/50/100 or custom) and prayer, then "Begin" flips `screen` to `session`.
- **`SessionScreen`** — owns the live prayer state: `{ index, laps }`. `step(±1)` wraps the index around `beadCount`, incrementing `laps` on wrap-forward and decrementing on wrap-back. Flashes a "circuit complete" notice when `laps` rises.

### localStorage keys (the persistence contract)

- `rosary:lang`, `rosary:beads`, `rosary:prayer` — owned by `App.tsx`.
- `rosary:progress` — owned by `SessionScreen`; a JSON blob `{ prayerId, beadCount, index, laps }`. On load it is **only restored if `prayerId` and `beadCount` still match** the current config (see `loadProgress`), otherwise it starts fresh. If you change the progress shape, update both the writer (the persist `useEffect`) and the validating reader.

### `BeadRing` — the joystick bead-teller (the subtle part)

`src/components/BeadRing.tsx` is the one genuinely intricate file; read its top doc comment before editing. The center knob is a thumb-stick: press and circle it, and **one full revolution tells exactly one bead** (`onStep(+1)`); reversing the loop retreats one. Key invariants, each guarding a real bug that was fixed:

- **One bead per grip.** A `drag` ref tracks the owning `pointerId` and a `stepped` flag. Once a bead ticks over, further turning in that grip is ignored until the finger lifts — a frantic spin can't run away.
- **One pointer owns the stick.** `onPointerDown` returns early if a drag is active, so a stray second touch can't start a fresh grip (which would reset `stepped` and let one spin tell two beads). End/move handlers also filter on `pointerId`.
- **Partial turns bank across strokes.** `acc` (a ref) accumulates signed radians and persists between grips, so a circle can be closed over several strokes. `turn` (state, −1..1) drives the cinnabar progress arc. Both reset only when a bead ticks over, not when the finger lifts.
- A dead-zone near center holds the angle (no reliable bearing); `DETENTS` give haptic notches via `navigator.vibrate`.

It exposes `role="slider"` with arrow-key handling and Previous/Next buttons remain in `SessionScreen` for keyboard/accessibility — keep those paths working when touching the interaction.

### i18n

Custom and dependency-free. Two patterns, don't mix them:

- **UI chrome strings** → `src/i18n/strings.ts`: flat `en`/`ro` dictionaries and `t(key, lang)`. Add a key to **both** dictionaries; `t` falls back to English then the raw key.
- **Content** (prayers) → typed `Localized` (`{ en, ro }`) / `lines: { en[], ro[] }` objects in `src/data/prayers.ts`, resolved with `loc(value, lang)` from `src/i18n/loc.ts`.

Adding a prayer = append a `Prayer` to the `PRAYERS` array (unique `id`, both languages, body as one short clause per display line). `getPrayer` falls back to the first prayer for unknown ids.

### Styling

Two CSS files, no framework or CSS-in-JS. `src/styles/tokens.css` holds the design tokens (two-ink prayer-book palette, EB Garamond + Uncial Antiqua type, motion). `src/styles/app.css` holds layout + component styles. SVG ornaments (headpiece, cross, tailpiece, corners, illuminated initial) are hand-drawn React components in `Ornament.tsx` / `IlluminatedInitial.tsx`. The only network dependency is Google Fonts, cached at runtime by the service worker.
