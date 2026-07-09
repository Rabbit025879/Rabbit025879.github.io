import { pageRoot, banner, propertyDisplay, crackOverlay } from './dom.js';
import { spawnFloatingElement, clearFloatingElements, showBanner } from './effects.js';

/*************************
 * Demogorgon Hunt
 *************************/
const DEMO_DURATION = 21000;
const maxDemos = 22;

let demoInterval = null;
let activeDemos = [];
let demosLeft = 0;
let demoPoints = 0;

function demoTime(duration = DEMO_DURATION) {
  showDemoBanner('Upside Down', 2200);
  propertyDisplay.style.display = 'block';
  propertyDisplay.textContent = `Demo Points: ${demoPoints} 👹`;

  demoInterval = setInterval(() => {
    if (demosLeft < maxDemos) {
      const count = Math.min(Math.floor(Math.random() * 5 + 2), maxDemos - demosLeft);
      for (let i = 0; i < count; i++) spawnDemo(duration);
      demosLeft += count;
    }
  }, 1000);
}

function showDemoBanner(text, duration = 2000) {
  showBanner(banner, text, duration, {
    fontSize: '32px',
    fontWeight: '800',
    color: 'transparent',
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
    webkitTextStroke: '1px red',
    textShadow: `
      0 0 10px red,
      0 0 20px #b30000,
      0 0 30px #660000`,
  });
}

function spawnDemo(duration) {
  spawnFloatingElement({
    parent: pageRoot,
    list: activeDemos,
    duration,
    backgroundImage: 'images/Demogorgon.png',
    onClick: () => {
      demoPoints++;
      demosLeft--;
      propertyDisplay.textContent = `Demo Points: ${demoPoints} 👹`;
    },
  });
}

function clearDemos() {
  showDemoBanner('Rightside Up', 1500);
  clearFloatingElements(activeDemos);
  demosLeft = 0;
  clearInterval(demoInterval);
  demoInterval = null;
}

/*************************
 * Stranger Things Easter Egg
 *************************/
let isFlipped = false;

crackOverlay.addEventListener('dblclick', () => {
  flipPage();
  if (isFlipped) {
    stopStrangerLightning();
    clearDemos();
  } else {
    startStrangerLightning();
    demoTime();
  }
  isFlipped = !isFlipped;
});

function flipPage() {
  document.body.classList.toggle('flip');
}

/*************************
 * Lightning
 *************************/
const canvas = document.getElementById('lightning-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawLightning(x, y, segments = 20) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x, y);

  let cx = x;
  let cy = y;

  for (let i = 0; i < segments; i++) {
    cx += (Math.random() - 0.5) * 120;
    cy += canvas.height / segments;
    ctx.lineTo(cx, cy);
  }

  ctx.strokeStyle = 'rgba(207, 19, 19, 0.9)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#f38484ff';
  ctx.stroke();
}

function lightningStrike() {
  document.body.classList.add('lightning-flash');

  const x = Math.random() * canvas.width;
  drawLightning(x, 0);
  drawLightning(x, 0);
  drawLightning(x, 0);

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.body.classList.remove('lightning-flash');
  }, 250);
}

let lightningTimer = null;

function startStrangerLightning() {
  stopStrangerLightning();

  const loop = () => {
    lightningStrike();
    lightningTimer = setTimeout(loop, 7000);
  };
  loop();
}

function stopStrangerLightning() {
  clearTimeout(lightningTimer);
  lightningTimer = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
