const avatar = document.getElementById('avatar-img');
const nameText = document.getElementById('name-text');
const banner = document.getElementById('raccoon-banner');
const propertyDisplay = document.getElementById('raccoon-property');
const normalImg = 'images/Me.jpg';
const raccoonImg = 'images/Raccoon.jpg';
const normalName = 'Tzu-Hsiang Tu';
const chineseName = '凃紫翔';
const chineseNameWithChewing = ["ㄊㄨˊ", "凃", "ㄗˇ", "紫", "ㄒ一ㄤˊ", "翔"];
const raccoonName = '🦝 Raccoon 🦝';
const raccoonChineseName = '🦝 浣熊 🦝';
const raccoonChineseNameWithChewing = ["", "🦝", "ㄨㄢˇ", "浣", "ㄒㄩㄥˊ", "熊", "", "🦝"];
const chineseStyle = 'letter-spacing: 0.3em; font-size: 32px;';
const maxRaccoons = 7;
let isRaccoon = false;
let isChinese = true;
let isTyping = false;
let isDeleting = false;
let typingInterval = null;
let deleteInterval = null;
let raccoonInterval = null;
let raccoonTimeout = null;
let activeRaccoons = [];
let raccoonPoints = 0;
let displayTime = true;
let raccoonsLeft = 0;

addEventListener('DOMContentLoaded', () => {
  // Initial name typing
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

// Typing effect
function typeText(target, text, style, speed = 100, callback, initialText = '') {
  target.textContent = initialText;
  if (speed === 0 || !text) {
    if (callback) callback();
    return;
  }
  clearInterval(typingInterval);
  if (style) target.style = style;
  else {
    target.style.letterSpacing = 'normal';
    target.style.fontSize = '24px';
  }
  target.classList.add('typing');
  isTyping = true;
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const chars = Array.from(segmenter.segment(text), s => s.segment);
  let i = 0;
  typingInterval = setInterval(() => {
    target.textContent += chars[i++];
    if (i === chars.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      target.classList.remove('typing');
      isTyping = false;
      if (callback) callback();
    }
  }, speed);
}

function deleteText(target, text, callback) {
  if(isTyping) {
    clearInterval(typingInterval);
    typingInterval = null;
    isTyping = false;
  }
  deleteInterval = setInterval(() => {
    isDeleting = true;
    if (text.length === 0) {
      isDeleting = false;
      clearInterval(deleteInterval);
      if (callback) callback();
      return;
    }
    text = text.slice(0, -1);
    target.textContent = text;
  }, 350/text.length);
}

// Type Chinese name
function typeChineseName(target, text, callback) {
  let typedText = [];
  text = text.slice(); // clone array

  typeNextWord();

  function typeNextWord() {

    if (text.length === 0) {
      // Show completed name without delay (no entering callback)
      typeText(target, null, chineseStyle, 0, () => {
        if (callback) callback();
      }, typedText.join(''));
      return;
    }

    // Add a space after each Chinese character to show tone symbols
    typeText(target, text[0] + ' ', chineseStyle, 100, () => {
      text.shift();
      typedText.push(text.shift());
      typeNextWord();
    }, typedText.join(''));
  }
}

function typeProfileName() {
  if(isDeleting) {
    clearInterval(deleteInterval);
    deleteInterval = null;
    isChinese = !isChinese;
    nameText.style = isChinese ? chineseStyle : null;
    nameText.textContent = isRaccoon ? (isChinese ? raccoonChineseName : raccoonName) : (isChinese ? chineseName : normalName);
    isDeleting = false;
    return;
  }
  deleteText(nameText, nameText.textContent, () => {
    isChinese = !isChinese;
    if (isRaccoon) {
      isChinese ? typeChineseName(nameText, raccoonChineseNameWithChewing) : typeText(nameText, raccoonName, null, 100);
    } else {
      isChinese ? typeChineseName(nameText, chineseNameWithChewing) : typeText(nameText, normalName, null, 60);
    }
  }); 
}

// Single-click name to toggle language or show raccoon name
nameText.addEventListener('click', () => {
  typeProfileName();
});
// double-click avatar to toggle Raccoon Mode
avatar.addEventListener('dblclick', () => {
  typeProfileName();
  toggleRaccoonMode();
});
// Toggle Raccoon Mode
function toggleRaccoonMode() {
  avatar.classList.add('fade');
  nameText.classList.add('fade');
  setTimeout(() => {
    isRaccoon = !isRaccoon;
    if (isRaccoon) {
      enterRaccoonMode();
    } else {
      exitRaccoonMode();
    }
    avatar.classList.remove('fade');
    nameText.classList.remove('fade');
  }, 400);
}
// Enter Raccoon Mode
function enterRaccoonMode() {
  avatar.src = raccoonImg;
  propertyDisplay.style.display = 'block';
  propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;
  typeText(nameText, raccoonName, null, 100, () => {
    raccoonTime();
  });
}
// Exit Raccoon Mode
function exitRaccoonMode() {
  // Stop all actions and animations
  clearInterval(typingInterval);
  clearInterval(raccoonInterval);
  clearTimeout(raccoonTimeout);
  typingInterval = null;
  raccoonInterval = null;
  raccoonTimeout = null;
  displayTime = true;
  clearRaccoons();
  
  // Reset state
  avatar.src = normalImg;
  propertyDisplay.style.display = 'none';
  nameText.style.letterSpacing = 'normal';
  nameText.style.fontSize = '24px';
  isChinese ? typeChineseName(nameText, chineseNameWithChewing) : typeText(nameText, normalName, null, 60);
}
// Activate Raccoon Time
function raccoonTime(duration = 21000) {
  showBanner('🦝🦝🦝 Raccoon Time !!', 2200);
  let rounds = 0;
  let spawnFreq = 1000;
  raccoonInterval = setInterval(() => {
    if (!isRaccoon) return;
    rounds++;
    const spawnCount = Math.floor(Math.random() * 5 + 2);
    if (raccoonsLeft < maxRaccoons) {
      for (let i = 0; i < spawnCount; i++) spawnRaccoon(duration-rounds*spawnFreq);
      raccoonsLeft += spawnCount;
    }
    if (displayTime) propertyDisplay.textContent = `Times Left: ${(duration - rounds * spawnFreq) / 1000}s`;
  }, spawnFreq);
  raccoonTimeout = setTimeout(() => {
    if (isRaccoon) {
      clearInterval(raccoonInterval);
      showBanner('Raccoon Escaped !!', 800);
      propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;
    }
  }, duration);
}
// Show and hide banner
function showBanner(text, duration = 2000) {
  if (!isRaccoon) return;
  banner.textContent = text;
  banner.style.display = 'block';
  banner.classList.remove('shrink');
  setTimeout(() => {
    banner.classList.add('shrink');
    banner.addEventListener('animationend', () => {
      if (banner.classList.contains('shrink')) banner.style.display = 'none';
    }, { once: true });
  }, duration);
}
// Spawn a raccoon that moves and spins
function spawnRaccoon(duration) {
  if (!isRaccoon) return;
  const r = document.createElement('div');
  r.textContent = '🦝';
  r.style.position = 'fixed';
  r.style.fontSize = Math.random() * 72 + 36 + 'px';
  r.style.opacity = '0';
  r.style.top = Math.random() * (window.innerHeight - 50) + 'px';
  r.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  r.style.transition = 'left 1s linear, top 1s linear';
  r.style.zIndex = '10000';
  r.style.cursor = 'crosshair';
  document.body.appendChild(r);
  activeRaccoons.push(r);
  let dx = (Math.random() - 0.5) * 1000;
  let dy = (Math.random() - 0.5) * 1000;
  let size = parseFloat(r.style.fontSize);
  let angle = 0;
  let growth = 1;
  const move = () => {
    if (!isRaccoon) {
      clearInterval(moveTimer);
      r.remove();
      return;
    }
    r.style.opacity = '0.8';
    let newLeft = Math.max(0, Math.min(window.innerWidth - 50, r.offsetLeft + dx));
    let newTop = Math.max(0, Math.min(window.innerHeight - 50, r.offsetTop + dy));
    r.style.left = newLeft + 'px';
    r.style.top = newTop + 'px';
    dx = (Math.random() - 0.5) * 1000;
    dy = (Math.random() - 0.5) * 1000;
  };
  const spin = () => {
    if (!isRaccoon) return;
    angle = (angle + 5) % 360;
    size += 10 * growth;
    if (size > 108) growth = -1;
    if (size < 72) growth = 1;
    r.style.transform = `rotate(${angle}deg)`;
    r.style.fontSize = size + 'px';
  };
  const moveTimer = setInterval(move, Math.random() * 2200 + 400);
  const spinTimer = setInterval(spin, 50);
  r.addEventListener('click', () => {
    r.remove();
    raccoonPoints++;
    raccoonsLeft--;
    displayTime = false;
    propertyDisplay.textContent = `Raccoon Points: ${raccoonPoints} 🦝`;
    setTimeout(() => { displayTime = true; }, 500);
    clearInterval(moveTimer);
    clearInterval(spinTimer);
  });
  setTimeout(() => {
    r.remove();
    clearInterval(moveTimer);
    clearInterval(spinTimer);
  }, duration);
}
// Clear all raccoons
function clearRaccoons() {
  activeRaccoons.forEach(r => r.remove());
  activeRaccoons = [];
  raccoonsLeft = 0;
}