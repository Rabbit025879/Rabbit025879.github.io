/*************************
 * Hidden terminal (terminal.html)
 * A tiny fake shell over a virtual filesystem of the portfolio.
 * Boots by "typing" `whoami` and `ls -l projects`, then hands over
 * the prompt. User input is only ever rendered with textContent.
 *************************/
import { pixelArt } from './pixel-art.js';

/*************************
 * Virtual filesystem
 *************************/
const file = (lines, extra = {}) => ({ type: 'file', lines, ...extra });
const link = (href, extra = {}) => ({ type: 'link', href, ...extra });
const dir = (children, extra = {}) => ({ type: 'dir', children, ...extra });

const FS = dir({
  'about.txt': file([
    "I'm Tzu-Hsiang Tu (凃紫翔), a robotics engineer from NTHU, Taiwan.",
    '',
    'I design navigation stacks, sensors and control systems that turn',
    'theory into working hardware. I like problems without a clean answer',
    'yet — a robot localizing itself in a noisy arena, a sensor asked to',
    'measure a range it was never built for.',
    '',
    'Now: M.S. student & graduate researcher, NEAF Lab, NTHU (Sep 2026–).',
    'Before: Vice Team Leader + Navigation Team Leader, DIT Robotics.',
  ], { date: '2026-09' }),
  'skills.txt': file([
    'robotics   ROS / ROS2 · Navigation2 · Control Theory',
    'sensing    Computer Vision · CMOS-MEMS · Sensor Fusion',
    'embedded   STM32 · C / C++ · Real-Time Systems',
    'modeling   COMSOL · MATLAB · LTspice',
    'design     AutoCAD · Inventor · Mechatronics',
    'tooling    Docker · Git · Linux',
  ], { date: '2026-09' }),
  'contact.txt': file([
    'mail     tu.tzu.hs@gmail.com         (open mail)',
    'github   github.com/Rabbit025879     (open github)',
    'cv       ~/cv.pdf                    (open cv.pdf)',
    'vcard    ~/contact.vcf               (open contact.vcf)',
  ], { date: '2026-09' }),
  'contact.vcf': file([
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Tu;Tzu-Hsiang;;;凃紫翔',
    'FN:Tzu-Hsiang Tu 凃紫翔',
    'ORG:NEAF Lab\\, NTHU',
    'TITLE:Student',
    'EMAIL;TYPE=INTERNET,PREF:tu.tzu.hs@gmail.com',
    'URL:https://rabbit025879.github.io/',
    'URL:https://github.com/Rabbit025879',
    'NOTE:Nice to meet you! 🐰',
    'PHOTO;ENCODING=b;TYPE=JPEG:<256x256 jpeg, base64 omitted>',
    'END:VCARD',
  ], { date: '2026-10', href: 'files/Tu-Tzu-Hsiang.vcf', cta: 'save it to your contacts' }),
  'cv.pdf': link('files/CV.pdf', { date: '2026', note: 'curriculum vitae' }),
  'projects': dir({
    'eurobot-robot': dir({
      'README.md': file([
        '# Eurobot Competition Robot — DIT Robotics, 2024–25',
        '',
        'Led the navigation stack: LIDAR + odometry → localization →',
        'Nav2 global/local planning → STM32 motor control.',
        'Opponents tracked as dynamic obstacles in custom costmap layers.',
        '',
        'result   World 5th (2024) · World Top 16 (2025)',
        'stack    ROS2 · Navigation2 · STM32 · C/C++',
      ]),
    }, { date: '2024-25', note: 'ROS2 nav stack — localization + planning', href: 'projects.html#eurobot' }),
    'tdk-cup': dir({
      'README.md': file([
        '# 27th TDK Cup Entry — National Competition, 2025',
        '',
        'Mechatronic design pairing a sensor-driven feedback loop with a',
        'mechanical structure modeled in MATLAB and detailed in AutoCAD.',
        '',
        'result   Excellence & Creativity Award',
        'stack    Control Theory · MATLAB · AutoCAD · Inventor',
      ]),
    }, { date: '2025', note: 'excellence & creativity award', href: 'projects.html#tdkcup' }),
    'cmos-mems-sensor': dir({
      'README.md': file([
        '# CMOS-MEMS Pressure Sensor — NTHU research, 2024–25',
        '',
        'Combines capacitive and Pirani sensing in one CMOS-MEMS device',
        'to extend the usable pressure range beyond either mechanism.',
        '',
        'shown    IEEE MEMS 2025 · SEMICON Taiwan 2025',
        'stack    COMSOL · LTspice · C/C++',
      ]),
    }, { date: '2024-25', note: 'capacitive + pirani, extended range', href: 'projects.html#mems' }),
  }, { date: '2026' }),
  'off-duty': link('life.html', { date: '2026', note: 'hobbies, raccoons & an easter egg' }),
  'tu-rex': link('tu-rex.html', { date: '2026', note: 'travel log of my plush dinosaur stand-in' }),
  '.rabbit': file([
    'follow the white rabbit. 🐇',
    "兔子 (rabbit) is my nickname — that's why everything here is called Rabbit025879.",
  ], { date: '????', art: 'rabbit' }),
  '.raccoon': file([
    'you found the raccoon. 🦝',
    'double-click my photo on the off-duty page to start raccoon time.',
  ], { date: '????', art: 'raccoon' }),
});

const HOME = [];

const EXTERNAL = {
  mail: 'mailto:tu.tzu.hs@gmail.com',
  email: 'mailto:tu.tzu.hs@gmail.com',
  github: 'https://github.com/Rabbit025879',
  home: 'index.html',
  site: 'index.html',
  work: 'projects.html',
};

/*************************
 * DOM
 *************************/
const out = document.getElementById('term-out');
const body = document.getElementById('term-body');
const form = document.getElementById('term-form');
const input = document.getElementById('term-in');
const promptEl = document.getElementById('term-prompt');

/*************************
 * State
 *************************/
let cwd = HOME.slice();
const history = [];
let historyIndex = 0;
let booting = true;
let skipBoot = false;

/*************************
 * Path helpers
 *************************/
const cwdLabel = () => (cwd.length ? '~/' + cwd.join('/') : '~');

function nodeAt(parts) {
  let node = FS;
  for (const part of parts) {
    if (node.type !== 'dir' || !Object.hasOwn(node.children, part)) return null;
    node = node.children[part];
  }
  return node;
}

function resolveParts(path = '') {
  let parts = path.startsWith('/') || path.startsWith('~') ? [] : cwd.slice();
  const rest = path.replace(/^~\/?/, '').replace(/^\//, '');
  for (const seg of rest.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts;
}

const resolve = (path) => {
  const parts = resolveParts(path);
  return { parts, node: nodeAt(parts) };
};

/*************************
 * Output helpers
 *************************/
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  children.flat().forEach((child) => {
    if (child == null) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

function print(content = '', cls = '') {
  const line = el('div', { class: `term-line ${cls}`.trim() });
  if (content instanceof Node) line.append(content);
  else line.textContent = content;
  out.append(line);
  return line;
}

const gap = () => out.append(el('div', { class: 'term-gap' }));
const scrollDown = () => { body.scrollTop = body.scrollHeight; };

function promptNode() {
  return el('span', { class: 'term-prompt' }, el('b', { text: 'tu@TuTzuOS' }), `:${cwdLabel()}$ `);
}

function renderPrompt() {
  promptEl.replaceChildren(...promptNode().childNodes);
}

/* A clickable token that runs a command when activated. */
function cmdLink(label, command, extraClass = '') {
  const btn = el('button', { type: 'button', class: `term-link ${extraClass}`.trim(), text: label });
  btn.addEventListener('click', () => runFromUi(command));
  return btn;
}

function entryLink(name, node, path) {
  if (node.type === 'dir') return cmdLink(`${name}/`, `ls -l ${path}`, 'dir');
  if (node.type === 'link') return cmdLink(name, `open ${path}`);
  return cmdLink(name, `cat ${path}`);
}

/*************************
 * Commands
 *************************/
const COMMANDS = {
  help() {
    const rows = [
      ['whoami', 'who is this'],
      ['ls [-l] [-a] [dir]', 'list files (ll = ls -l, la = ls -a)'],
      ['cd <dir>', 'change directory'],
      ['cat <file>', 'print a file'],
      ['open <file|mail|github>', 'open in the browser'],
      ['neofetch', 'system info'],
      ['rabbit · raccoon · turex', 'say hi to the locals'],
      ['history · clear · pwd · date · echo', ''],
      ['exit', 'back to the normal website'],
    ];
    print('available commands:', 'term-dim');
    rows.forEach(([cmd, desc]) => print(el('span', {}, cmd.padEnd(26), el('span', { class: 'term-dim', text: desc }))));
    print('tip: tab completes, ↑/↓ walks history, and some names are clickable.', 'term-dim');
  },

  whoami() {
    const facts = [
      ['name', 'Tzu-Hsiang Tu (凃紫翔)'],
      ['alias', el('span', {}, '兔子 · rabbit ', pixelArt('rabbit', { pixelSize: 1, className: 'term-inline-sprite' }))],
      ['role', 'Robotics Engineer'],
      ['status', el('span', { class: 'term-amber', text: '● online — open to collaboration' })],
      ['now', 'M.S. researcher, NEAF Lab, NTHU'],
      ['focus', 'navigation · control · MEMS sensing'],
      ['eurobot', "world #5 ('24) · top 16 ('25)"],
      ['tdk cup', 'excellence & creativity award (2025)'],
      ['lang', 'zh-TW (native) · en (TOEIC 885)'],
    ];
    const kv = el('dl', { class: 'term-kv' }, facts.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', {}, v)]));
    const img = el('img', { src: 'images/ME-portrait.jpg', alt: 'Tzu-Hsiang Tu' });
    img.addEventListener('load', scrollDown);
    out.append(el('div', { class: 'term-who' }, img, kv));
  },

  ls(args) {
    const flags = args.filter((a) => a.startsWith('-')).join('');
    const long = flags.includes('l');
    const all = flags.includes('a');
    const target = args.find((a) => !a.startsWith('-')) || '.';
    const { parts, node } = resolve(target);

    if (!node) return print(`ls: cannot access '${target}': No such file or directory`, 'term-err');
    if (node.type !== 'dir') return print(target);

    const base = parts.length ? '~/' + parts.join('/') : '~';
    const names = Object.keys(node.children).filter((n) => all || !n.startsWith('.'));
    if (!long) {
      const grid = el('div', { class: 'term-grid' }, names.map((n) => entryLink(n, node.children[n], `${base}/${n}`)));
      return print(grid);
    }

    const rows = names.map((n) => {
      const child = node.children[n];
      const perms = child.type === 'dir' ? 'drwxr-xr-x' : child.type === 'link' ? 'lrwxr-xr-x' : '-rw-r--r--';
      return el('tr', {},
        el('td', { text: perms }),
        el('td', { text: child.date || '2026' }),
        el('td', {}, entryLink(n, child, `${base}/${n}`)),
        el('td', { class: 'note', text: child.note ? `# ${child.note}` : '' }),
      );
    });
    print(`total ${names.length}`, 'term-dim');
    out.append(el('table', { class: 'term-ls' }, el('tbody', {}, rows)));
  },

  cd(args) {
    const target = args[0] || '~';
    const { parts, node } = resolve(target);
    if (!node) return print(`cd: no such file or directory: ${target}`, 'term-err');
    if (node.type !== 'dir') return print(`cd: not a directory: ${target}`, 'term-err');
    cwd = parts;
  },

  pwd() {
    print('/home/tu' + (cwd.length ? '/' + cwd.join('/') : ''));
  },

  cat(args) {
    if (!args.length) return print('cat: missing file operand', 'term-err');
    args.forEach((target) => {
      const { parts, node } = resolve(target);
      if (!node) return print(`cat: ${target}: No such file or directory`, 'term-err');
      if (node.type === 'dir') {
        if (node.children['README.md']) return COMMANDS.cat([`${target.replace(/\/$/, '')}/README.md`]);
        return print(`cat: ${target}: Is a directory`, 'term-err');
      }
      if (node.type === 'link') return print(`cat: ${target}: binary file — try \`open ${target}\``, 'term-err');
      if (node.art) print(pixelArt(node.art, { pixelSize: 6, className: 'term-pixel-art' }));
      node.lines.forEach((line) => print(line, line.startsWith('#') ? 'term-amber' : ''));
      if (node.cta) print(el('span', {}, '→ ', cmdLink(node.cta, `open ${target}`)));
      const project = nodeAt(parts.slice(0, -1));
      if (project && project.href) print(el('span', {}, '→ ', cmdLink('read the full case study', `open ${'~/' + parts.slice(0, -1).join('/')}`)));
    });
  },

  open(args) {
    const target = args[0];
    if (!target) return print('open: what should I open? try `open github`', 'term-err');
    const key = target.toLowerCase().replace(/\.(txt|pdf)$/, '');
    if (Object.hasOwn(EXTERNAL, key) && !resolve(target).node) return navigate(EXTERNAL[key]);
    if (key === 'cv') return navigate('files/CV.pdf');

    const { node } = resolve(target);
    if (!node) return print(`open: ${target}: No such file or directory`, 'term-err');
    if (node.href) return navigate(node.href);
    if (node.type === 'file') return COMMANDS.cat([target]);
    print(`open: ${target}: nothing to open here`, 'term-err');
  },

  neofetch() {
    const art = [
      '████████╗██╗   ██╗',
      '╚══██╔══╝██║   ██║',
      '   ██║   ██║   ██║',
      '   ██║   ██║   ██║',
      '   ██║   ╚██████╔╝',
      '   ╚═╝    ╚═════╝ ',
    ];
    const info = [
      ['', 'tu@TuTzuOS'],
      ['', '----------'],
      ['os', `TuTzuOS ${osVersion()} · NTHU PME B.S. 2026 → M.S.`],
      ['host', 'NEAF Lab, Hsinchu, TW'],
      ['kernel', 'ROS2 + Navigation2'],
      ['uptime', '4 years of robotics'],
      ['shell', 'zsh (this one is fake)'],
      ['cpu', 'STM32 @ real-time'],
      ['memory', '2 eurobot world finals'],
    ];
    // Two-column grid (logo | info); CSS centres the logo vertically and
    // stacks the columns on narrow screens so lines never wrap mid-logo.
    const logo = el('pre', { class: 'term-neofetch-logo term-soft', text: art.join('\n') });
    const list = el('div', { class: 'term-neofetch-info' }, info.map(([k, v]) => el('div', {},
      k ? el('span', { class: 'term-amber', text: `${k}: ` }) : '',
      v)));
    out.append(el('div', { class: 'term-neofetch' }, logo, list));
  },

  history() {
    history.forEach((cmd, i) => print(`${String(i + 1).padStart(4)}  ${cmd}`));
  },

  clear() { out.replaceChildren(); },
  date() { print(new Date().toString()); },
  echo(args) { print(args.join(' ')); },

  sudo() {
    print('tu is not in the sudoers file. This incident will be reported to the raccoons. 🦝', 'term-err');
  },

  rm(args) {
    if (args.some((a) => /^-\w*r/.test(a))) return print('nice try. the robots are backed up. 🤖', 'term-err');
    print('rm: permission denied (this filesystem is read-only)', 'term-err');
  },

  raccoon() { COMMANDS.cat(['~/.raccoon']); },
  rabbit() { COMMANDS.cat(['~/.rabbit']); },

  turex() {
    print('🦖 Tu-Rex — plush T-rex, travel buddy, official stand-in for me in photos.');
    print('I would rather stay behind the camera, so Tu-Rex poses in front of the view.');
    print(el('span', {}, '→ ', cmdLink('open the travel log', 'open ~/tu-rex')));
  },

  exit() {
    print('logout — returning to the normal website…', 'term-dim');
    setTimeout(() => navigate('index.html'), 500);
  },
};
COMMANDS.logout = COMMANDS.exit;
COMMANDS.gui = COMMANDS.exit;
COMMANDS.ll = (args) => COMMANDS.ls(['-l', ...args]);
COMMANDS.follow = COMMANDS.rabbit;
COMMANDS['tu-rex'] = COMMANDS.turex;
COMMANDS.la = (args) => COMMANDS.ls(['-a', ...args]);
COMMANDS.dir = COMMANDS.ls;

function navigate(href) {
  if (/^(https?:|mailto:)/.test(href)) {
    print(`opening ${href} …`, 'term-dim');
    window.open(href, href.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
  } else {
    print(`opening ${href} …`, 'term-dim');
    window.location.href = href;
  }
}

/*************************
 * Execution
 *************************/
function echoCommand(raw) {
  print(el('span', {}, promptNode(), el('span', { class: 'term-cmd', text: raw })));
}

function execute(raw) {
  const line = raw.trim();
  if (!line) return;
  history.push(line);
  historyIndex = history.length;

  line.split('&&').forEach((part) => {
    const [name, ...args] = part.trim().split(/\s+/);
    if (!name) return;
    const cmd = Object.hasOwn(COMMANDS, name.toLowerCase()) ? COMMANDS[name.toLowerCase()] : null;
    if (cmd) cmd(args);
    else print(`zsh: command not found: ${name}`, 'term-err');
  });
}

function run(raw) {
  echoCommand(raw);
  execute(raw);
  gap();
  renderPrompt();
  scrollDown();
}

function runFromUi(command) {
  if (booting) return;
  run(command);
  input.focus({ preventScroll: true });
}

/*************************
 * Tab completion
 *************************/
function complete(value) {
  const tokens = value.split(/\s+/);
  const last = tokens[tokens.length - 1];

  let candidates;
  if (tokens.length === 1) {
    candidates = Object.keys(COMMANDS).filter((c) => c.startsWith(last));
  } else {
    const slash = last.lastIndexOf('/');
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : '';
    const namePart = last.slice(slash + 1);
    const { node } = resolve(dirPart || '.');
    if (!node || node.type !== 'dir') return value;
    candidates = Object.keys(node.children)
      .filter((n) => n.startsWith(namePart) && (namePart.startsWith('.') || !n.startsWith('.')))
      .map((n) => dirPart + n + (node.children[n].type === 'dir' ? '/' : ''));
  }

  if (candidates.length === 1) {
    tokens[tokens.length - 1] = candidates[0];
    return tokens.join(' ') + (candidates[0].endsWith('/') ? '' : ' ');
  }
  if (candidates.length > 1) {
    echoCommand(value);
    print(candidates.join('   '), 'term-dim');
    scrollDown();
  }
  return value;
}

/*************************
 * Input wiring
 *************************/
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value;
  input.value = '';
  run(value);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    input.value = complete(input.value);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = history[historyIndex] ?? input.value;
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? '';
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    COMMANDS.clear();
  }
});

body.addEventListener('click', () => {
  if (!booting && !window.getSelection().toString()) input.focus({ preventScroll: true });
});

document.querySelectorAll('.term-quick [data-cmd]').forEach((btn) => {
  btn.addEventListener('click', () => runFromUi(btn.dataset.cmd));
});

/* any key during the boot sequence fast-forwards it */
window.addEventListener('keydown', () => { if (booting) skipBoot = true; });
window.addEventListener('pointerdown', () => { if (booting) skipBoot = true; });

/*************************
 * Boot sequence
 *************************/
// TuTzuOS's version number is the owner's age (born 2004-06-14), so it
// bumps itself every birthday.
function osVersion() {
  const now = new Date();
  let age = now.getFullYear() - 2004;
  if (now.getMonth() < 5 || (now.getMonth() === 5 && now.getDate() < 14)) age--;
  return `${age}.0`;
}

const BANNER = [
  '████████╗██╗   ██╗  ████████╗███████╗██╗   ██╗   ██████╗ ███████╗',
  '╚══██╔══╝██║   ██║  ╚══██╔══╝╚══███╔╝██║   ██║  ██╔═══██╗██╔════╝',
  '   ██║   ██║   ██║     ██║     ███╔╝ ██║   ██║  ██║   ██║███████╗',
  '   ██║   ██║   ██║     ██║    ███╔╝  ██║   ██║  ██║   ██║╚════██║',
  '   ██║   ╚██████╔╝     ██║   ███████╗╚██████╔╝  ╚██████╔╝███████║',
  '   ╚═╝    ╚═════╝      ╚═╝   ╚══════╝ ╚═════╝    ╚═════╝ ╚══════╝',
].join('\n');

const sleep = (ms) => new Promise((r) => setTimeout(r, skipBoot ? 0 : ms));

async function typeCommand(command) {
  const cmdSpan = el('span', { class: 'term-cmd' });
  const cursor = el('span', { class: 'term-cursor' });
  print(el('span', {}, promptNode(), cmdSpan, cursor));
  await sleep(350);
  for (const ch of command) {
    cmdSpan.textContent += ch;
    await sleep(45 + Math.random() * 50);
  }
  await sleep(250);
  cursor.remove();
  execute(command);
  gap();
  scrollDown();
}

async function boot() {
  const last = new Date(Date.now() - 1000 * 60 * 60 * 26);
  print(`Last login: ${last.toDateString()} ${last.toTimeString().slice(0, 8)} on ttys001`, 'term-dim');
  print(BANNER, 'term-banner');
  print(el('span', {}, 'wake up, visitor… you followed the white rabbit. (try ', cmdLink('rabbit', 'rabbit'), ')'), 'term-dim');
  gap();

  await typeCommand('whoami');
  await sleep(300);
  await typeCommand('ls -l projects');
  print(el('span', {}, 'type ', cmdLink('help', 'help'), ' for commands, or ', cmdLink('exit', 'exit'), ' to go back.'), 'term-dim');
  gap();

  booting = false;
  renderPrompt();
  form.hidden = false;
  scrollDown();
  if (window.matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
}

boot();
