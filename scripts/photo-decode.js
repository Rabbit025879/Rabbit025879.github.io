/*************************
 * ID photo boot-up decode
 * On load, the hero ID photo starts hidden behind a binary/hex "rain"
 * (matrix-style) canvas, then crossfades into the real photo — as if the
 * image were being decoded from raw bytes. The CSS default (html.has-js)
 * is already the hidden/glitched look, so there's no flash of the plain
 * photo before this runs. Whatever happens here — reduced motion, a
 * zero-size element, a canvas error on some mobile browser — reveal()
 * is guaranteed to fire so the photo is never stuck hidden.
 *************************/
const CHARS = '01010101010101ABCDEF#$%';
const RAIN_DURATION = 1700; // ms of binary rain before the reveal starts
const TICK_MS = 45;
const SAFETY_TIMEOUT = RAIN_DURATION + 2000; // absolute worst-case fallback

const root = document.querySelector('[data-photo-decode]');

function reveal() {
  if (root) root.classList.add('decoded');
}

function runRain(rect) {
  const canvas = root.querySelector('.photo-decode-canvas');
  const label = root.querySelector('.photo-decode-label');
  if (!canvas) return false;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.scale(dpr, dpr);

  const fontSize = 13;
  ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textBaseline = 'top';

  const columns = Math.max(1, Math.ceil(rect.width / fontSize));
  const drops = Array.from({ length: columns }, () => Math.random() * -20);

  let tick = 0;
  const rainTimer = setInterval(() => {
    ctx.fillStyle = 'rgba(12, 8, 24, 0.18)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < columns; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillStyle = Math.random() < 0.5 ? '#c4b5fd' : '#67e8f9';
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > rect.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    if (label && tick % 3 === 0) {
      const addr = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
      label.textContent = `0x${addr} :: decrypting_ME.JPEG`;
    }
    tick++;
  }, TICK_MS);

  setTimeout(() => {
    clearInterval(rainTimer);
    reveal();
  }, RAIN_DURATION);

  return true;
}

function start() {
  const rect = root.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  try {
    return runRain(rect);
  } catch (err) {
    return false;
  }
}

function init() {
  if (!root) return;

  const safety = setTimeout(reveal, SAFETY_TIMEOUT);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearTimeout(safety);
    reveal();
    return;
  }

  if (start()) return;

  // Layout (e.g. web fonts still swapping on a slow mobile connection)
  // may not have settled yet — retry once on the next frame before
  // giving up and just revealing the photo.
  requestAnimationFrame(() => {
    if (!start()) {
      clearTimeout(safety);
      reveal();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
