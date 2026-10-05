# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small multi-page personal portfolio/resume site (Tzu-Hsiang Tu), deployed as a static site via GitHub Pages. Pure HTML/CSS/JS — no build step, no package manager, no dependencies.

## Commands

There is no build/lint/test tooling. To preview locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A local server is required — `scripts/avatar.js` and `scripts/stranger-things.js` are loaded as ES modules (`<script type="module">`), and browsers block module `import`s over `file://`.

To sanity-check a JS file after editing:

```bash
node --check scripts/<file>.js
```

## Architecture

Everything lives in four top-level dirs: `css/`, `scripts/`, `images/`, `files/` (just `CV.pdf`), plus four pages:

| Page | Style | Stylesheets |
|---|---|---|
| `index.html` (home) | Neumorphism | `css/style.css` |
| `projects.html` (case studies + experiments log) | Neumorphism | `css/style.css` |
| `life.html` (Off Duty, reached via the "I'm not a robot" checkpoint on the home page) | Claymorphism or Neobrutalism, switchable | `css/style.css` + `css/life.css` |
| `terminal.html` (hidden easter egg) | Green-phosphor terminal | `css/terminal.css` only |

**Styling.** `css/style.css` holds the Neumorphism design tokens (`--bg`, `--raise*`, `--inset*`, `--accent`, …) and every shared component, plus the structural (theme-neutral) rules for the Off Duty page. In Neumorphism every surface uses the page background; depth comes only from the paired light/dark shadow tokens, so don't give cards their own background colour. `css/life.css` only *skins* the Off Duty page: each theme overrides tokens under `:root[data-theme="clay"|"neo"]` and restyles components under `[data-theme=…]` selectors.

**Off Duty theme switching.** `scripts/theme.js` is a classic (non-module) script loaded in `<head>` of `life.html` so the theme lands before first paint. It picks the theme from `?theme=clay|neo`, then `localStorage` (`offduty-theme`), then defaults to `clay`, and wires any `[data-theme-set]` buttons to switch live (updating the URL with `history.replaceState`). To add a theme, add its name to `THEMES` in `theme.js`, a `[data-theme=…]` block in `life.css`, and a button.

**Terminal easter egg.** `scripts/terminal-egg.js` (on `index.html` and `projects.html`) sends visitors to `terminal.html` when they press `` ` `` or type `sudo`/`whoami`; the footer's tiny `>_` link is the clickable entrance. `scripts/terminal.js` is a fake shell over a virtual filesystem (`FS`) describing the portfolio: it boots by auto-typing `whoami` and `ls -l projects`, then supports `help`, `ls [-l] [-a]`, `cd`, `cat`, `open`, `neofetch`, history, tab completion, etc. All user input is rendered with `textContent` only — keep it that way. To add a command, add a function to `COMMANDS`; to add content, add nodes to `FS`.

The two minigames on the Off Duty page — the raccoon minigame and the Stranger Things Demogorgon-hunt easter egg — share DOM elements and spawn/animation logic through two small modules:

- **`scripts/dom.js`** — exports the DOM element references (`pageRoot`, `banner`, `propertyDisplay`, `crackOverlay`) shared across both features. `banner`/`propertyDisplay` are one pair of elements reused for both games (IDs `#game-banner`/`#game-property`), not per-feature elements.
- **`scripts/effects.js`** — exports `spawnFloatingElement()`, `clearFloatingElements()`, `showBanner()`. This is the one place that creates the roaming, spinning, clickable emoji/image elements used by both minigames (raccoons and Demogorgons behave identically — text emoji vs. a background-image sprite is just a param). `showBanner()` always resets prior inline styles before applying new ones, since the banner element is shared and styled differently by each feature.
- **`scripts/avatar.js`** — everything about the avatar: the name-typing/deleting animation (English ⇄ Chinese with zhuyin), a small state machine (`State`: IDLE/TYPING/DELETING/RACCOON_*) that gates which interactions are valid when, and the raccoon minigame (double-click avatar to enter/exit). Imports from `dom.js` and `effects.js`.
- **`scripts/stranger-things.js`** — the `#crack-overlay` easter egg: double-clicking it flips the page 180°, starts a periodic lightning-strike canvas animation, and starts the Demogorgon hunt (spawns clickable Demogorgon sprites for points). Independent of the avatar's state machine — has its own `isFlipped` flag. Imports from `dom.js` and `effects.js`.

Both feature modules are loaded via `<script type="module">` in `life.html`; there's no bundler, so `import`/`export` paths must stay relative and file extensions must be included (`./dom.js`, not `./dom`).

## Conventions worth preserving

- Keep all styling in the `css/` files — don't reintroduce inline `<style>` blocks in the HTML pages.
- Keep image/CV asset paths relative (`images/...`, `files/...`), not root-absolute (`/images/...`), so the site works whether GitHub Pages serves it from a custom domain or a `/<repo>/` subpath.
- When adding a new spawn-based effect, extend `spawnFloatingElement()`'s options rather than writing a new bespoke spawn function — that duplication (raccoon vs. Demogorgon spawn code) is exactly what `effects.js` was created to eliminate.
