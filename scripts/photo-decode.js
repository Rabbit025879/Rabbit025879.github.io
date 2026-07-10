/*************************
 * ID photo boot-up decode
 * On load, the hero ID photo starts hidden behind a binary/hex "rain"
 * (matrix-style) canvas, then crossfades into the real photo — as if the
 * image were being decoded from raw bytes. Progressive enhancement: the
 * base CSS state is just the plain photo, so no-JS / reduced-motion
 * visitors never see anything but the final image.
 *************************/
const CHARS = '01010101010101ABCDEF#$%';
const RAIN_DURATION = 1700; // ms of binary rain before the reveal starts
const TICK_MS = 45;

const root = document.querySelector('[data-photo-decode]');

function init() {
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = root.querySelector('.photo-decode-canvas');
  const label = root.querySelector('.photo-decode-label');
  if (!canvas) return;

  const rect = root.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const fontSize = 13;
  ctx.font = `${fontSize}px var(--font-mono), monospace`;
  ctx.textBaseline = 'top';

  const columns = Math.ceil(rect.width / fontSize);
  const drops = Array.from({ length: columns }, () => Math.random() * -20);

  root.classList.add('decoding');

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
    root.classList.remove('decoding');
  }, RAIN_DURATION);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
