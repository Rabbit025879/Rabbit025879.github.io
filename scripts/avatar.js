/*************************
 * State Machine
 *************************/
const State = Object.freeze({
  IDLE: 'IDLE',
  TYPING: 'TYPING',
  DELETING: 'DELETING',
  RACCOON_INTRO: 'RACCOON_INTRO',
  RACCOON_ACTIVE: 'RACCOON_ACTIVE',
  RACCOON_IDLE: 'RACCOON_IDLE',
  RACCOON_EXIT: 'RACCOON_EXIT'
});

let currentState = State.IDLE;

function setState(next) {
  if (currentState === next) return;
  exitState(currentState);
  currentState = next;
  enterState(next);
}

function exitState(state) {
  switch (state) {
    case State.DELETING:
      clearInterval(typingInterval);
      clearInterval(deleteInterval);
      typingInterval = null;
      deleteInterval = null;
      break;

    case State.RACCOON_ACTIVE:
      clearInterval(raccoonInterval);
      clearTimeout(raccoonTimeout);
      clearRaccoons();
      raccoonInterval = null;
      raccoonTimeout = null;
      break;
  }
}

function enterState(state) {
  switch (state) {
    case State.RACCOON_INTRO:
      enterRaccoonIntro();
      break;
    case State.RACCOON_ACTIVE:
      raccoonTime();
      break;
    case State.RACCOON_EXIT:
      exitRaccoonMode();
      break;
  }
}

/*************************
 * DOM
 *************************/
const avatar = document.getElementById('avatar-img');
const nameText = document.getElementById('name-text');
const banner = document.getElementById('raccoon-banner');
const propertyDisplay = document.getElementById('raccoon-property');
const crackOverlay = document.getElementById('crack-overlay');

/*************************
 * Constants
 *************************/
const normalImg = 'images/ME.gif';
const raccoonImg = 'images/Raccoon.jpg';

const normalName = 'Tzu-Hsiang Tu';
const chineseName = '凃紫翔';
const chineseNameWithChewing = ["ㄊㄨˊ", "凃", "ㄗˇ", "紫", "ㄒ一ㄤˊ", "翔"];

const raccoonName = '🦝 Raccoon 🦝';
const raccoonChineseName = '🦝 浣熊 🦝';
const raccoonChineseNameWithChewing = ["", "🦝", "ㄨㄢˇ", "浣", "ㄒㄩㄥˊ", "熊", "", "🦝"];

const chineseStyle = 'letter-spacing: 0.3em; font-size: 32px;';
const maxRaccoons = 7;

/*************************
 * Flags
 *************************/
let isChinese = true;
let isRaccoon = false;

/*************************
 * Typing system
 *************************/
let typingInterval = null;
let deleteInterval = null;

function typeText(target, text, style, speed = 100, callback, initialText = '') {
  setState(State.TYPING);
  target.textContent = initialText;

  if (!text || speed === 0) {
    isRaccoon
      ? setState(State.RACCOON_IDLE)
      : setState(State.IDLE);
    callback && callback();
    return;
  }

  if (style) target.style = style;
  else {
    target.style.letterSpacing = 'normal';
    target.style.fontSize = '24px';
  }

  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const chars = Array.from(segmenter.segment(text), s => s.segment);
  let i = 0;

  typingInterval = setInterval(() => {
    target.textContent += chars[i++];
    if (i >= chars.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isRaccoon
        ? setState(State.RACCOON_IDLE)
        : setState(State.IDLE);
      callback && callback();
    }
  }, speed);
}

function deleteText(target, text, callback) {
  setState(State.DELETING);
  deleteInterval = setInterval(() => {
    if (text.length === 0) {
      clearInterval(deleteInterval);
      deleteInterval = null;
      isRaccoon
        ? setState(State.RACCOON_IDLE)
        : setState(State.IDLE);
      callback && callback();
      return;
    }
    text = text.slice(0, -1);
    target.textContent = text;
  }, Math.max(20, 350 / Math.max(text.length, 1)));
}

function typeChineseName(target, arr, callback) {
  const text = arr.slice();
  let typed = [];

  function next() {
    if (text.length === 0) {
      target.style = chineseStyle;
      typeText(target, '', null, 0, () => {}, typed.join(''));
      isRaccoon
        ? setState(State.RACCOON_IDLE)
        : setState(State.IDLE);
      callback && callback();
      return;
    }
    typeText(target, text.shift() + ' ', chineseStyle, 100, () => {
      typed.push(text.shift());
      next();
    }, typed.join(''));
  }

  next();
}

/*************************
 * Initial
 *************************/
addEventListener('DOMContentLoaded', () => {
  typeChineseName(nameText, chineseNameWithChewing, () => {
    setTimeout(() => {
      deleteText(nameText, nameText.textContent, () => {
        typeText(nameText, normalName, null, 60, () => {
          isChinese = false;
        });
      });
    }, 250);
  });
});

/*************************
 * Name toggle
 *************************/
function toggleName() {
  if (currentState !== State.IDLE && currentState !== State.RACCOON_IDLE) return;

  deleteText(nameText, nameText.textContent, () => {
    isChinese = !isChinese;

    if (isRaccoon) {
      isChinese
        ? typeChineseName(nameText, raccoonChineseNameWithChewing)
        : typeText(nameText, raccoonName, null, 100);
    } else {
      isChinese
        ? typeChineseName(nameText, chineseNameWithChewing)
        : typeText(nameText, normalName, null, 60);
    }
  });
}

nameText.addEventListener('click', toggleName);

/*************************
 * Raccoon Mode
 *************************/
avatar.addEventListener('dblclick', () => {
  if(currentState === State.TYPING || currentState === State.DELETING) return;
  if(currentState === State.IDLE) {
    setState(State.RACCOON_INTRO);
  } else {
    setState(State.RACCOON_EXIT);
  }
});

function enterRaccoonIntro() {
  isRaccoon = true;
  avatar.src = raccoonImg;
  propertyDisplay.style.display = 'block';
  propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;

  isChinese 
    ? typeChineseName(nameText, raccoonChineseNameWithChewing, () => {setState(State.RACCOON_ACTIVE);})
    : typeText(nameText, raccoonName, null, 100, () => {setState(State.RACCOON_ACTIVE);});
}

function exitRaccoonMode() {
  isRaccoon = false;
  avatar.src = normalImg;
  propertyDisplay.style.display = 'none';

  isChinese
    ? typeChineseName(nameText, chineseNameWithChewing)
    : typeText(nameText, normalName, null, 60);

  setState(State.IDLE);
}

/*************************
 * Raccoon Game
 *************************/
let raccoonInterval = null;
let raccoonTimeout = null;
let raccoonPoints = 0;
let activeRaccoons = [];
let raccoonsLeft = 0;
let displayTime = true;

function raccoonTime(duration = 21000) {
  showBanner('🦝🦝🦝 Raccoon Time !!', 2200);

  let rounds = 0;
  raccoonInterval = setInterval(() => {
    if (currentState !== State.RACCOON_ACTIVE) return;

    rounds++;
    if (raccoonsLeft < maxRaccoons) {
      const count = Math.floor(Math.random() * 5 + 2);
      for (let i = 0; i < count; i++) spawnRaccoon(duration);
      raccoonsLeft += count;
    }

    if (displayTime)
      propertyDisplay.textContent = `Times Left: ${(duration - rounds * 1000) / 1000}s`;
  }, 1000);

  raccoonTimeout = setTimeout(() => {
    showBanner('Raccoon Escaped !!', 800);
    propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;
    setState(State.RACCOON_IDLE);

  }, duration);
}

/*************************
 * Banner
 *************************/
function showBanner(text, duration = 2000) {
  banner.textContent = text;
  banner.style.display = 'block';
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
function spawnRaccoon(duration) {
  if (currentState !== State.RACCOON_ACTIVE) return;

  const r = document.createElement('div');
  r.textContent = '🦝';
  r.style.position = 'fixed';
  r.style.fontSize = Math.random() * 72 + 36 + 'px';
  r.style.top = Math.random() * window.innerHeight + 'px';
  r.style.left = Math.random() * window.innerWidth + 'px';
  r.style.zIndex = '10000';
  r.style.cursor = 'crosshair';
  document.body.appendChild(r);
  activeRaccoons.push(r);

  let moveTimer = setInterval(() => {
    r.style.left = Math.random() * window.innerWidth + 'px';
    r.style.top = Math.random() * window.innerHeight + 'px';
  }, 800);

  r.addEventListener('click', () => {
    r.remove();
    raccoonPoints++;
    raccoonsLeft--;
    displayTime = false;
    propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;
    setTimeout(() => displayTime = true, 500);
    clearInterval(moveTimer);
  });

  setTimeout(() => {
    r.remove();
    clearInterval(moveTimer);
  }, duration);
}

function clearRaccoons() {
  activeRaccoons.forEach(r => r.remove());
  activeRaccoons = [];
  raccoonsLeft = 0;
}

/*************************
 * Stranger Things Easter Egg
 *************************/
let isFlipped = false;

crackOverlay.addEventListener('dblclick', () => {
  flipPage();
  if(isFlipped) {
    stopStrangerLightning();
  } else {
    startStrangerLightning();
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

