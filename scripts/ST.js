// ! Unfinished Code !
// Stranger Things Easter Egg with Demogorgon Hunt Game
/*************************
 * DOM
 *************************/
const banner = document.getElementById('raccoon-banner');
const propertyDisplay = document.getElementById('raccoon-property');
const crackOverlay = document.getElementById('crack-overlay');
const pageRoot = document.getElementById('page-root');

/*************************
 * Hunting Game
 *************************/
let demoInterval = null;
let activeDemos = [];
let demosLeft = 0;
let demoPoints = 0;
const maxDemos = 22;

function demoTime() {
  showDemoBanner("Upside Down", 2200);
  propertyDisplay.style.display = 'block';
  propertyDisplay.textContent = `Demo Points: ${demoPoints} 👹`;

  demoInterval = setInterval(() => {
    if (demosLeft < maxDemos) {
      const count = Math.floor(Math.random() * 5 + 2);
      for (let i = 0; i < count; i++) spawnDemo();
      demosLeft += count;
    }
  }, 1000);
}

/*************************
 * Banner
 *************************/
function showDemoBanner(text, duration = 2000) {
  banner.textContent = text;
  banner.style.display = 'block';
  banner.style.fontSize = '32px';
  banner.style.fontWeight = '800';

  banner.style.color = 'transparent';
  banner.style.fontFamily = 'Inter'
  banner.style.webkitTextStroke = '1px red';
  banner.style.textShadow = `
    0 0 10px red,
    0 0 20px #b30000,
    0 0 30px #660000`;
  banner.classList.remove('shrink');

  setTimeout(() => {
    banner.classList.add('shrink');
    banner.addEventListener('animationend', () => {
      banner.style.display = 'none';
    }, { once: true });
  }, duration);
}

/*************************
 * Raccoon Spawn
 *************************/
function spawnDemo() {
  const r = document.createElement('div');
  r.textContent = '';
  r.style.backgroundImage = "url('images/Demogorgon.png')";
  r.style.backgroundSize = 'contain';
  r.style.backgroundRepeat = 'no-repeat';
  r.style.backgroundPosition = 'center';
  r.style.width = '200px';
  r.style.height = '200px';
  r.style.position = 'fixed';
  r.style.opacity = '0';
  r.style.fontSize = Math.random() * 72 + 36 + 'px';
  r.style.top = Math.random() * (window.innerHeight - 50) + 'px';
  r.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  r.style.transition = 'left 1s linear, top 1s linear';
  r.style.zIndex = '10000';
  r.style.cursor = 'crosshair';
  pageRoot.appendChild(r);
  activeDemos.push(r);

  let dx = (Math.random() - 0.5) * 1000;
  let dy = (Math.random() - 0.5) * 1000;
  let size = parseFloat(r.style.fontSize);
  let angle = 0;
  let growth = 1;

  let moveTimer = setInterval(() => {
    let newLeft = Math.max(0, Math.min(window.innerWidth - 50, r.offsetLeft + dx));
    let newTop = Math.max(0, Math.min(window.innerHeight - 50, r.offsetTop + dy));
    r.style.opacity = '0.8';
    r.style.left = newLeft + 'px';
    r.style.top = newTop + 'px';
    dx = (Math.random() - 0.5) * 1000;
    dy = (Math.random() - 0.5) * 1000;
  }, Math.random() * 2200 + 400);

  let spinTimer = setInterval(() => {
    angle = (angle + 5) % 360;
    size += 10 * growth;
    if (size > 108) growth = -1;
    if (size < 72) growth = 1;
    r.style.transform = `rotate(${angle}deg)`;
    r.style.fontSize = size + 'px';
  }, 50);

  r.addEventListener('click', () => {
    r.remove();
    demoPoints++;
    demosLeft--;
    propertyDisplay.textContent = `Demo Points: ${demoPoints} 👹`;
    clearInterval(moveTimer);
    clearInterval(spinTimer);
  });

  setTimeout(() => {
    r.remove();
    clearInterval(moveTimer);
    clearInterval(spinTimer);
  }, duration);
}

function clearDemos() {
  showDemoBanner("Rightside Up", 1500);
  activeDemos.forEach(r => r.remove());
  activeDemos = [];
  demosLeft = 0;
  clearInterval(demoInterval);
}

/*************************
 * Stranger Things Easter Egg
 *************************/
let isFlipped = false;

crackOverlay.addEventListener('dblclick', () => {
  flipPage();
  if(isFlipped) {
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