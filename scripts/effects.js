/*************************
 * Floating element spawn
 * Shared by the raccoon game (avatar.js) and the
 * Demogorgon hunt (stranger-things.js).
 *************************/
export function spawnFloatingElement({ parent, list, duration, text, backgroundImage, size = 200, onClick }) {
  const el = document.createElement('div');
  if (text !== undefined) el.textContent = text;

  Object.assign(el.style, {
    position: 'fixed',
    opacity: '0',
    fontSize: Math.random() * 72 + 36 + 'px',
    top: Math.random() * (window.innerHeight - 50) + 'px',
    left: Math.random() * (window.innerWidth - 50) + 'px',
    transition: 'left 1s linear, top 1s linear',
    zIndex: '10000',
    cursor: 'crosshair',
  });

  if (backgroundImage) {
    Object.assign(el.style, {
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: `${size}px`,
      height: `${size}px`,
    });
  }

  parent.appendChild(el);
  list.push(el);

  let dx = (Math.random() - 0.5) * 1000;
  let dy = (Math.random() - 0.5) * 1000;
  let currentSize = parseFloat(el.style.fontSize);
  let angle = 0;
  let growth = 1;

  const moveTimer = setInterval(() => {
    const newLeft = Math.max(0, Math.min(window.innerWidth - 50, el.offsetLeft + dx));
    const newTop = Math.max(0, Math.min(window.innerHeight - 50, el.offsetTop + dy));
    el.style.opacity = '0.8';
    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
    dx = (Math.random() - 0.5) * 1000;
    dy = (Math.random() - 0.5) * 1000;
  }, Math.random() * 2200 + 400);

  const spinTimer = setInterval(() => {
    angle = (angle + 5) % 360;
    currentSize += 10 * growth;
    if (currentSize > 108) growth = -1;
    if (currentSize < 72) growth = 1;
    el.style.transform = `rotate(${angle}deg)`;
    el.style.fontSize = `${currentSize}px`;
  }, 50);

  const cleanup = () => {
    clearInterval(moveTimer);
    clearInterval(spinTimer);
    clearTimeout(removalTimer);
  };

  el.addEventListener('click', () => {
    el.remove();
    cleanup();
    onClick && onClick();
  });

  const removalTimer = setTimeout(() => {
    el.remove();
    cleanup();
  }, duration);

  return el;
}

export function clearFloatingElements(list) {
  list.forEach(el => el.remove());
  list.length = 0;
}

/*************************
 * Banner
 * Resets prior custom styling before applying the new one,
 * since the raccoon and Demogorgon games share one banner element.
 *************************/
export function showBanner(banner, text, duration = 2000, style = {}) {
  banner.textContent = text;
  banner.style.display = 'block';
  banner.style.textShadow = '';
  banner.style.color = '';
  banner.style.webkitTextStroke = '';
  banner.style.fontSize = '';
  banner.style.fontWeight = '';
  banner.style.fontFamily = '';
  Object.assign(banner.style, style);
  banner.classList.remove('shrink');

  setTimeout(() => {
    banner.classList.add('shrink');
    banner.addEventListener('animationend', () => {
      banner.style.display = 'none';
    }, { once: true });
  }, duration);
}
