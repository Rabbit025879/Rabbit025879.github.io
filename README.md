# Tu Infinity & Beyond

Personal portfolio site for Tzu-Hsiang Tu (凃自翔) — B.S. in Power Mechanical Engineering, National Tsing Hua University. Plain static HTML/CSS/JS, deployed via GitHub Pages.

**Live site:** https://rabbit025879.github.io/

## Pages

| Page | What it is | Style |
|---|---|---|
| `index.html` | Home — about, skills network, contact (with vCard download) | Neumorphism, light + dark |
| `projects.html` | Case studies + experiments log | Neumorphism, light + dark |
| `life.html` | Off Duty, reached via the "I'm not a robot" checkpoint on the home page | Claymorphism / Neobrutalism, switchable |
| `terminal.html` | Hidden easter egg — a fake shell (`tu@TuTzuOS`) over a virtual filesystem | Green-phosphor terminal |
| `tu-rex.html` | Tu-Rex's Travel Log — the plush dinosaur's travel photos | Travel journal, no JS |

## Structure

```
index.html, projects.html, life.html, terminal.html, tu-rex.html
css/
  style.css                Neumorphism tokens + shared components
  life.css                 Clay / Neo skins for the Off Duty page
  terminal.css             Terminal page
  tu-rex.css               Travel Log page (self-contained)
scripts/
  scheme.js                Light/dark scheme (follows OS, remembers toggle)
  theme.js                 Off Duty theme switching (?theme=clay|neo, localStorage)
  nav.js                   Mobile nav toggle
  reveal.js                Scroll reveal + pointer-following glow
  skills.js                Interactive skills network
  log.js                   Experiments log filter + accordion
  checkpoint.js            "I'm not a robot" checkpoint
  pixel-art.js             Pixel-art sprites + SVG renderer
  pixel-mount.js           Mounts [data-pixel-art] elements
  terminal-egg.js          Entrance to the terminal (`, sudo, whoami)
  terminal.js              Fake shell
  dom.js                   Shared DOM element references (minigames)
  effects.js               Shared floating-element spawn/animation + banner helpers
  avatar.js                Avatar, name-typing animation, raccoon minigame
  stranger-things.js       Crack-overlay easter egg (page flip, lightning, Demogorgon hunt)
images/                    Site, easter-egg and Tu-Rex photo assets
files/                     CV.pdf, Tu-Tzu-Hsiang.vcf
```

No build step, no dependencies — just static files.

## Local development

Some scripts are loaded as ES modules, so the site must be served over HTTP (not opened directly via `file://`):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. To sanity-check a script after editing: `node --check scripts/<file>.js`.

## Deployment

Pushing to `main` on GitHub with Pages enabled serves the site directly — no build/publish step required.

## Easter eggs

- Double-click the avatar on Off Duty to enter/exit raccoon mode.
- Double-click the crack in the bottom-left corner for a Stranger Things–themed page flip and Demogorgon hunt.
- Press `` ` `` or type `sudo` / `whoami` on the home or projects page (or click the tiny `>_` in the footer) to open the terminal. Try `help`, `neofetch`, `rabbit`, `turex`, or `cat contact.vcf`.
- Follow the white rabbit peeking from the Off Duty footer.
