# Tu Infinity & Beyond

Personal portfolio site for Tzu-Hsiang Tu — B.S. in Power Mechanical Engineering, National Tsing Hua University. Plain static HTML/CSS/JS, deployed via GitHub Pages.

**Live site:** https://rabbit025879.github.io/

## Structure

```
index.html
css/style.css              Site styling
scripts/
  dom.js                   Shared DOM element references
  effects.js                Shared floating-element spawn/animation + banner helpers
  avatar.js                 Avatar, name-typing animation, raccoon minigame
  stranger-things.js        Crack-overlay easter egg (page flip, lightning, Demogorgon hunt)
images/                    Site + easter-egg image assets
files/CV.pdf               Downloadable CV
```

No build step, no dependencies — just static files.

## Local development

Scripts are loaded as ES modules, so they must be served over HTTP (not opened directly via `file://`):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Pushing to `main` on GitHub with Pages enabled serves the site directly — no build/publish step required.

## Easter eggs

- Double-click the avatar to enter/exit raccoon mode.
- Double-click the crack in the bottom-left corner for a Stranger Things–themed page flip and Demogorgon hunt.
