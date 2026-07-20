# Flag Trainer

A distraction-free flag, calling-code, and capital-city trainer. React 19 + TypeScript + Vite + Tailwind v4 + Framer Motion, deployed as a static site to GitHub Pages.

## Status

All three modes (Learning, Guess, Compete), the Home/Statistics/Settings screens, resume-on-refresh, and offline support are built and wired together. Verified by direct execution (not just written and hoped for) — see "How this was verified" below — but never run inside an actual browser, since this environment has no network access for `npm install`. Treat first run as a real first run.

## Setup

```bash
npm install              # also copies flag-icons' SVGs into public/ (postinstall)
npm run generate-data    # optional at first — see "Data" below
npm run dev
```

The app runs immediately after `npm install` using the 10-country sample data baked into `src/data/countries.json`. Run `generate-data` when you want the real 198.

## Data

Country data (name, calling code, capitals, currency, languages, continent) comes from [mledoze/countries](https://github.com/mledoze/countries) (ODbL license — credit it if you redistribute the generated file). Flags come from the [`flag-icons`](https://github.com/lipis/flag-icons) npm package (MIT) — `npm install` pulls it in, and a `postinstall` script copies its SVGs into `public/flags/4x3` automatically.

`scripts/generate-data.mjs` fetches mledoze/countries and writes `src/data/countries.json`, curated to your specific 198:

- 193 UN member states, plus
- Vatican City and Palestine (UN observers, not members)
- Taiwan, Kosovo, and Western Sahara

**This script needs real network access to run**, and hasn't been executed end to end — the sandbox that built this has none, so it's written directly against mledoze's documented schema rather than tested against live output. Run it once, read the console warnings it prints (entry count, any of the five extra territories it can't find, unfilled population), and fix anything it flags. In particular:

- **Population isn't in mledoze/countries at all.** The script leaves it at `0` with a `POPULATION_OVERRIDES` map at the top for you to fill in. Info-card-only, never scored.
- **Kosovo has no official ISO 3166-1 code.** The script looks for the unofficial `XKX`/`XK` code several datasets use as a de facto standard; if this dataset doesn't carry it, add that entry by hand.

## Local development in VS Code

1. **Prerequisites**: [Node.js](https://nodejs.org) 20 or newer (check with `node --version` in a terminal), and VS Code itself.
2. **Open the folder**: unzip this project, then in VS Code use *File → Open Folder…* and select the `flag-trainer` folder (not a parent folder, not a single file).
3. **Install dependencies**: open the integrated terminal (`` Ctrl+` `` / `` Cmd+` ``, or *Terminal → New Terminal*) and run:
   ```bash
   npm install
   ```
   This needs real internet access — it downloads React, Vite, Tailwind, etc., and the `postinstall` step copies flag SVGs into `public/`.
4. **Recommended extensions**: VS Code will likely prompt you, but if not, install **Tailwind CSS IntelliSense** and **ES7+ React/Redux/React-Native snippets** (optional, but both make editing this codebase noticeably nicer — Tailwind's extension gives you autocomplete and hover previews for the utility classes throughout).
5. **Run it**:
   ```bash
   npm run dev
   ```
   Vite will print a local URL (typically `http://localhost:5173`) — open it in a browser, or `Cmd+Click`/`Ctrl+Click` the link directly in VS Code's terminal output.
6. **Edit and see changes live**: Vite hot-reloads on save — no need to restart `npm run dev` for most changes. If something looks broken after a big change, stop the server (`Ctrl+C` in the terminal) and start it again.
7. **Type-check before committing**: `npm run build` runs a full TypeScript check (`tsc --noEmit`) before bundling — this is the closest thing to a test suite this project currently has (see "Testing" below). Run it before pushing.
8. **Get the real data**: `npm run generate-data` (needs network access, same terminal).

If port 5173 is already in use, Vite will automatically try the next one and print whichever URL it actually bound to — use that one.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`, regenerating the data file each time (remove that step if you'd rather commit the data and refresh it manually). One-time setup:

1. In the repo's Settings → Pages, set **Source** to "GitHub Actions".
2. In `vite.config.ts`, set `BASE_PATH` to match your actual repo name (defaults to `/flag-trainer/`).

## Architecture

The quiz engine (`src/engine/`) is mode-agnostic — Learning, Guess, and Compete are configuration, not separate implementations:

```
resolveFieldPlan(mode, capitalGuessingChosen) -> which fields are guessed vs. revealed
resolveQueue(mode, length, allIso2)           -> the ordered list of countries for the session
buildGameSteps(mode, fieldPlan)               -> the ask/reveal sequence for one question
createSession / submitAnswer / summarize      -> the session lifecycle
```

`src/pages/GameScreen.tsx` is the one screen that renders all three modes, driven entirely by `buildGameSteps`'s output. Adding a future quiz type (capitals-only, map silhouettes, etc.) means adding a config and a question type, not a new screen.

No router: navigation is a plain view-state switch in `App.tsx`. Deliberate, not an oversight — it sidesteps GitHub Pages' well-known issue with client-side routers on a refresh, and nothing in the spec calls for deep-linkable URLs.

## How this was verified

No `npm install` in the build environment meant no real `npm run dev` to click through. Instead:

- Every engine function (`buildGameSteps`, `submitAnswer`, `resolveFieldPlan`, spaced repetition, answer validation/normalization) was executed directly with real scenarios — not just read over — including a full 20-question session with deliberately mixed right/wrong answers, verifying the scoring came out exactly right.
- Every screen was rendered (via `react-dom/server`, with a real React and a minimal runtime-only Framer Motion stub standing in for the real package) across all three modes and every step of their question flows — 69 distinct render checks, covering Home with and without a resumable session, every ask/reveal step in Learning/Guess/Compete, Results for both a mixed-answer Guess session and a new-personal-best Compete session, empty and populated Statistics, and Settings.
- The statistics reducer (streaks, per-country accuracy, Compete personal-best logic) was exercised directly against constructed scenarios (a broken streak, a worse session that shouldn't overwrite a personal best, a better one that should).

What this does **not** cover: actual Tailwind CSS compilation (no way to run the real build), real Framer Motion animation behavior (the stub just jumps to end states), and anything only a browser can tell you — real touch/keyboard behavior, actual visual layout, real service-worker caching. Give it a real first run and expect some CSS class or animation-timing tweaks.

## Testing

Not yet automated (component tests, Playwright, etc.) — flagged earlier as a later concern, per your call. `npm run build`'s `tsc --noEmit` step is the current safety net.
