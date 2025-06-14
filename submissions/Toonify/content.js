var myInteger = 0;
let styleEl = null;
let turtleDiv = null;
let pongGame = null; 
let speechBubbles = [];
let mainColor = '#ef5350';
let enableSoundEffects = true;
let enableSpeechBubbles = true;
let enableTurtle = true;
let enablePong = true;
let giantImageElement = null;
let enableinvert = true;
let enablePigRoaster = true; 
let enableNerdSummarizer = true; 
let pigElement = null; 
let roastBubble = null;
let nerdElement = null; 
let summaryBubble = null; 
let enableRGB = true;
let j = 0;
// Add new variables for cat and cursor tracking
let catElement = null;
let lastCursorX = 0;
let lastCursorY = 0;
let isCatFacingRight = false;
let cursorStyleElement = null;
let enableCat = true;

const audio = {
  "chill": new Audio(chrome.runtime.getURL("media/Chill.mp3")),
  "kachow": new Audio(chrome.runtime.getURL("media/kachow.mp3")),
  "boing": new Audio(chrome.runtime.getURL("media/Boing.mp3")),
  "pow": new Audio(chrome.runtime.getURL("media/Pow.mp3")),
  "boom": new Audio(chrome.runtime.getURL("media/Boom.mp3")),
  "zap": new Audio(chrome.runtime.getURL("media/Zap.mp3"))
}

audio.chill.preload = "auto";
audio.kachow.preload = "auto";
audio.boing.preload = "auto";
audio.pow.preload = "auto";
audio.boom.preload = "auto";
audio.zap.preload = "auto";

audio.chill.volume = 0.4;
audio.kachow.volume = 0.8;
audio.boing.volume = 0.1;
audio.pow.volume = 0.8;
audio.boom.volume = 0.8;
audio.zap.volume = 0.2;


audio.chill.loop = true;
audio.kachow.loop = false;
audio.boing.loop = true;
audio.pow.loop = false;
audio.boom.loop = false;
audio.zap.loop = false;

audio.chill.currentTime = 0;
audio.kachow.currentTime = 0;
audio.boing.currentTime = 0.8;
audio.pow.currentTime = 0;
audio.boom.currentTime = 0;
audio.zap.currentTime = 0;

audio.chill.load();
audio.kachow.load();
audio.boing.load();
audio.pow.load();
audio.boom.load();
audio.zap.load();


// Add this helper function to pause all audio elements
function pauseAllAudio() {
  Object.values(audio).forEach(audioElement => {
    audioElement.pause();
    if (audioElement.loop) {
      audioElement.currentTime = 0;
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "applyStyles") {
    audio.chill.play();

    mainColor = message.prefs.mainColor || mainColor;

    const wasSoundEnabled = enableSoundEffects;
    enableSoundEffects = message.prefs.enableSoundEffects;
    
    // If sound is being disabled, pause all audio
    if (wasSoundEnabled && !enableSoundEffects) {
      pauseAllAudio();
    }
    
    // Store previous state of all features
    const hasAnyFeatureEnabled = 
      message.prefs.enableSoundEffects ||
      message.prefs.enableSpeechBubbles ||
      message.prefs.enableTurtle ||
      message.prefs.enablePong ||
      message.prefs.enableinvert ||
      (message.prefs.enablePigRoaster !== undefined ? message.prefs.enablePigRoaster : true) ||
      (message.prefs.enableNerdSummarizer !== undefined ? message.prefs.enableNerdSummarizer : true) ||
      message.prefs.enableRGB;

    enableSoundEffects = message.prefs.enableSoundEffects;
    enableSpeechBubbles = message.prefs.enableSpeechBubbles;
    enableTurtle = message.prefs.enableTurtle;
    enablePong = message.prefs.enablePong;
    enableinvert = message.prefs.enableinvert;
    enablePigRoaster = message.prefs.enablePigRoaster !== undefined ? message.prefs.enablePigRoaster : true;
    enableNerdSummarizer = message.prefs.enableNerdSummarizer !== undefined ? message.prefs.enableNerdSummarizer : true; 
    enableRGB = message.prefs.enableRGB;
    enableCat = message.prefs.enableCat !== undefined ? message.prefs.enableCat : true;
    
    // Toggle logic - flip the state each time a toggle request comes in
    if (message.toggle === undefined) {
      // If not explicitly requested, toggle based on current state
      myInteger = (myInteger === 0) ? 1 : 0;
    } else {
      // If explicitly requested, set to the requested state
      myInteger = message.toggle ? 1 : 0;
    }
    
    const shouldApplyStyles = (myInteger === 1);
    
    if (shouldApplyStyles) {
      // Even if no features are enabled, we should still create the basic style 
      // to show that the extension is active
      styleEl = applyStyles();
      showGiantImage();
      
      // Only apply specific features if they're enabled
      if (enableSoundEffects) audio.chill.play();
      if (enableTurtle) applyStyles2();
      if (enablePong) applyStyles3();
      if (enableSpeechBubbles) addSpeechBubbles();
      if (enableinvert) applyInvert();
      if (enablePigRoaster) addPigRoaster();
      if (enableNerdSummarizer) addNerdSummarizer();
      if (enableRGB) applyRGB();
      
      // Add cat chase functionality
      if (enableCat) addCatChase();
      
      sendResponse({status: "Cartoonify activated! POW!", active: true});
    } else {
      unapplyStyles(); 
      sendResponse({status: "Back to reality! ZOOM!", active: false});
    }
  }
  return true;
});

function applyStyles() {
  styleEl = document.createElement('style');
  
  const doodlesURL = chrome.runtime.getURL('media/doodles.jpg');
  const cursorURL = chrome.runtime.getURL('media/mousecursor.png');
  const clickerURL = chrome.runtime.getURL('media/mouseclicker.png');
  
  styleEl.textContent = `
  * {
      font-family: 'Bangers', cursive !important;
      color: ${mainColor};
      font-weight: bold;
      cursor: url('${cursorURL}') 16 16, auto !important;
  }
  
  a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"], 
  [onclick], [onmousedown], select, details, summary, [aria-haspopup="true"],
  [class*="btn"], [class*="button"], [id*="btn"], [id*="button"] {
      cursor: url('${clickerURL}'), pointer !important;
  }
  
  body {
      background: white !important;
      background-image: url('${doodlesURL}') !important;
      background-repeat: repeat;
      background-size: auto;
  }
    
  img {
  filter: contrast(1000%) brightness(100%);
  }
  
  /* Make content containers semi-transparent to show background */
  p, div, span, section, article, main, header, footer, aside, nav {
      background-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Specific elements with fully transparent backgrounds */
  #moving-turtle, #moving-turtle *, .speech-bubble, #pong-container, #pong-canvas {
    background: transparent !important;
  }
  
  *[style*="border"], *[class*="border"], *[id*="border"], 
  *[border], *[style*="outline"], table, td, th {
    border-width: 5px !important;
    border-style: solid !important;
    border-color: ${mainColor} !important;
  }
  
  @keyframes wobble {
    0% { transform: rotate(2deg); }
    50% { transform: rotate(-2deg); }
    100% { transform: rotate(2deg); }
  }
  
  h1, h2, h3 {
    display: inline-block;
    animation: wobble 0.2s infinite alternate ease-in-out;
    background-color: rgba(255, 255, 255, 0.3) !important;
    padding: 5px !important;
  }
  
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    background-repeat: repeat;
    background-size: auto;
    opacity: 0.5;
  }
  
  /* Comic book style action words */
  .comic-effect {
    position: fixed;
    z-index: 9998;
    font-size: 40px;
    color: ${mainColor};
    text-shadow: 2px 2px 0 black;
    pointer-events: none;
    user-select: none;
    transform: rotate(-10deg) scale(0);
    animation: popIn 0.5s forwards;
  }
  
  @keyframes popIn {
    0% { transform: rotate(-10deg) scale(0); }
    70% { transform: rotate(-10deg) scale(1.2); }
    100% { transform: rotate(-10deg) scale(1); }
  }
  
  /* Speech bubble style */
  .speech-bubble {
    position: absolute;
    background: white !important;
    border-radius: 15px !important;
    padding: 10px !important;
    box-shadow: 3px 3px 0 rgba(0,0,0,0.2) !important;
    border: 3px solid ${mainColor} !important;
    max-width: 200px;
    z-index: 9997;
    pointer-events: none;
  }
  
  .speech-bubble:before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 20px;
    border: 10px solid transparent;
    border-top-color: ${mainColor};
    border-bottom: 0;
  }
  
  /* Hover effects for images and links */
  img:hover {
    transform: scale(1.5);
    transition: transform 0.3s ease;
    z-index: 9996;
    position: relative;
  }
  
  a:hover {
    transform: scale(1.5);
    display: inline-block;
    transition: transform 0.2s ease;
    z-index: 9996;
    position: relative;
  }
  `;
  
  document.head.appendChild(styleEl);

  
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
  
  
  document.addEventListener('click', function(e) {
    if (Math.random() > 0.5) {
      addComicEffect(e.clientX, e.clientY);
    }
  });
  
  // Note: Removed the addCatChase() call from here since it will be conditionally called in the message listener
}

// Function to add the cat that follows the cursor
function addCatChase() {
  // Remove any existing cat
  if (catElement && catElement.parentNode) {
    catElement.parentNode.removeChild(catElement);
  }
  
  catElement = document.createElement('div');
  catElement.id = 'cursor-cat';
  
  const catImg = document.createElement('img');
  catImg.src = chrome.runtime.getURL('media/cat.png');
  catImg.style.width = '80px'; // Resize cat
  catImg.style.height = 'auto';
  catElement.appendChild(catImg);
  
  catElement.style.cssText = `
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    transform: scaleX(1);
    transition: left 0.3s ease-out, top 0.3s ease-out;
    background: transparent !important;
    will-change: transform;
  `;
  
  catElement.style.left = '-100px';
  catElement.style.top = '-100px';
  
  document.body.appendChild(catElement);
  
  document.addEventListener('mousemove', updateCatPosition);
}

function updateCatPosition(e) {
  if (!catElement) return;
  
  const cursorX = e.clientX;
  const cursorY = e.clientY;
  
  if (cursorX > lastCursorX && !isCatFacingRight) {
    catElement.style.transform = 'scaleX(-1)'; 
    isCatFacingRight = true;
  } else if (cursorX < lastCursorX && isCatFacingRight) {
    catElement.style.transform = 'scaleX(1)'; 
    isCatFacingRight = false;
  }
  
  const catX = cursorX - (isCatFacingRight ? -20 : 80); // Position cat to left or right of cursor
  const catY = cursorY - 30; // Position cat slightly above cursor
  
  setTimeout(() => {
    if (catElement) {
      catElement.style.left = `${catX}px`;
      catElement.style.top = `${catY}px`;
    }
  }, 100);
  
  lastCursorX = cursorX;
  lastCursorY = cursorY;
}

function addComicEffect(x, y) {
  const effects = ['POW!', 'KACHOW!', 'BOOM!', 'ZAP!'];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  
  if (enableSoundEffects) {
    if (effect === 'KACHOW!'){
      audio.kachow.play();
    } else if (effect === "POW!"){
      audio.pow.play();
    } else if (effect === "BOOM!"){
      audio.boom.play();
    } else if (effect === "ZAP!"){
      audio.zap.play();
    }
  }
  
  const comicEffect = document.createElement('div');
  comicEffect.className = 'comic-effect';
  comicEffect.textContent = effect;
  comicEffect.style.left = `${x - 30}px`;
  comicEffect.style.top = `${y - 30}px`;
  
  document.body.appendChild(comicEffect);
  
  setTimeout(() => {
    comicEffect.parentNode.removeChild(comicEffect);
  }, 980);
}

function addSpeechBubbles() {
  
  speechBubbles.forEach(bubble => {
    if (bubble && bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }
  });
  speechBubbles = [];
  
  
  const headlines = document.querySelectorAll('h1, h2, h3');
  const interactiveElements = document.querySelectorAll('a, button');
  
  
  const randomHeadlines = Array.from(headlines).slice(0, Math.min(3, headlines.length));
  const randomInteractiveElements = Array.from(interactiveElements)
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(5, interactiveElements.length));
  
  const elements = [...randomHeadlines, ...randomInteractiveElements];
  
  
  const phrases = [
    'Click me!', 
    'Comic power!', 
    'Wow!', 
    'Amazing!',
    'Look at this!',
    'Incredible!',
    'Super!',
    'Fantastic!',
    'Holy moly!'
  ];
  
  elements.forEach(element => {
    if (element.getBoundingClientRect().width > 0 && isElementVisible(element)) {
      const bubble = document.createElement('div');
      bubble.className = 'speech-bubble';
      bubble.textContent = phrases[Math.floor(Math.random() * phrases.length)];
      
      const rect = element.getBoundingClientRect();
      bubble.style.left = `${rect.left + window.scrollX}px`;
      bubble.style.top = `${rect.top + window.scrollY - 50}px`;
      
      document.body.appendChild(bubble);
      speechBubbles.push(bubble);
    }
  });
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && 
         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
         rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

function applyRGB() {
  rgbInterval = setInterval(rotate, 100);
  j = 0;
  function rotate() {
    j += 10;
    document.body.style.filter = `hue-rotate(${j}deg)`;
  }
}

function applyStyles2() {
  turtleDiv = document.createElement('div');
  turtleDiv.id = 'moving-turtle';
  turtleDiv.style.cssText = 'position: sticky; bottom: -6px; z-index: 9999; pointer-events: none; background: transparent !important;';
  
  const turtleImg = document.createElement('img');
  turtleImg.src = chrome.runtime.getURL('media/turtle.gif');
  turtleImg.style.height = '200px'; 
  turtleImg.style.background = 'transparent';
  turtleDiv.appendChild(turtleImg);
  
  document.body.appendChild(turtleDiv);
  const turtleStyleEl = document.createElement('style');

  // Only play audio if sound effects are enabled
  if (enableSoundEffects) {
    audio.boing.play();
  }

  turtleStyleEl.textContent = `
    @keyframes moveLeftToRight {
      from { right: -100px; }
      to { right: calc(100% + 100px); }
    }
    
    #moving-turtle {
      animation: moveLeftToRight 15s linear infinite reverse;
    }
  `;
  
  document.head.appendChild(turtleStyleEl);
  
  if (!styleEl) styleEl = turtleStyleEl;
}

function unapplyStyles(){
  const styles = document.querySelectorAll('style');
  
  // Always pause audio when unapplying styles
  pauseAllAudio();
  
  styles.forEach(style => {
    if (style.textContent.includes('Bangers') || 
        style.textContent.includes('moveLeftToRight') ||
        style.textContent.includes('pong-container') || 
        style.textContent.includes('filter') ||
        style.textContent.includes('cursor')) {
      style.parentNode.removeChild(style);
    }
  });
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
    styleEl = null;
  }
  if (turtleDiv && turtleDiv.parentNode) {
    turtleDiv.parentNode.removeChild(turtleDiv);
    turtleDiv = null;
  }

  if (rgbInterval) {
    clearInterval(rgbInterval);
    document.body.style.filter = '';  // Reset filter properly
  }
  
  if (pongGame && pongGame.parentNode) {
    pongGame.parentNode.removeChild(pongGame);
    pongGame = null;
  }
  if (giantImageElement && giantImageElement.parentNode) {
    giantImageElement.parentNode.removeChild(giantImageElement);
    giantImageElement = null;
  }
  
  removePigRoaster();
  removeNerdSummarizer(); 
  
  speechBubbles.forEach(bubble => {
    if (bubble && bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }
  });
  speechBubbles = [];
  
  
  const comicEffects = document.querySelectorAll('.comic-effect');
  comicEffects.forEach(effect => {
    effect.parentNode.removeChild(effect);
  });
  
  styleEl = null;
  
  // Remove cat element
  if (catElement && catElement.parentNode) {
    catElement.parentNode.removeChild(catElement);
    catElement = null;
  }
  
  // Remove cursor tracking event listener
  document.removeEventListener('mousemove', updateCatPosition);
}

function applyStyles3() {
  addPongGame(); 
  
  const styleEl = document.createElement('style');
  
  document.head.appendChild(styleEl);
}

function showGiantImage() {
  if (giantImageElement && giantImageElement.parentNode) {
    giantImageElement.parentNode.removeChild(giantImageElement);
  }
  
  giantImageElement = document.createElement('div');
  giantImageElement.id = 'giant-image';
  
  const imageUrl = chrome.runtime.getURL('media/chillguy.png');
  
  giantImageElement.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('${imageUrl}');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 9990;
  opacity: 0;
  pointer-events: none;
  animation: fadeInOut 10s linear forwards; 
  background-color: transparent !important;
`;

const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; }
    25% { opacity: 0.5; } /* Slower fade-in */
    75% { opacity: 0.5; } /* Hold visibility */
    100% { opacity: 0; } /* Smooth fade-out */
  }
`;
  
  document.head.appendChild(fadeStyle);
  document.body.appendChild(giantImageElement);
  
  // Remove the element after animation completes
  setTimeout(() => {
    if (giantImageElement && giantImageElement.parentNode) {
      giantImageElement.parentNode.removeChild(giantImageElement);
      giantImageElement = null;
    }
  }, 14100); // Slightly longer than 5s to ensure animation completes
}

function applyInvert() {
  const styleEl = document.createElement('style');

  styleEl.textContent = `
  /* Additional styles can be added here if needed */
  html{
  filter: invert(1);
  }
  `;
  document.head.appendChild(styleEl);
}

function addPongGame() {
  pongGame = document.createElement('div');
  pongGame.id = 'pong-container';
  pongGame.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    height: 240px;
    background: black;
    border: 3px solid ${mainColor};
    z-index: 10000;
    overflow: hidden;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  `;
  
  const canvas = document.createElement('canvas');
  canvas.id = 'pong-canvas';
  canvas.width = 320;
  canvas.height = 240;
  canvas.style.cssText = `
    display: block;
    background: black;
  `;
  
  pongGame.appendChild(canvas);
  document.body.appendChild(pongGame);
  
  const ctx = canvas.getContext('2d');
  let gameState = 'start'; 
  let score = { player: 0, computer: 0 };
  
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 5,
    velocityX: 5,
    velocityY: 5,
    speed: 3,
    color: "white"
  };
  
  const paddleHeight = 50;
  const paddleWidth = 10;
  
  const player = {
    x: canvas.width - paddleWidth - 10,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0,
    color: mainColor,
    speed: 8
  };
  
  const computer = {
    x: 10,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0,
    color: mainColor,
    speed: 5
  };
  
  let upArrowPressed = false;
  let downArrowPressed = false;
  let enterPressed = false;
  
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  
  function keyDownHandler(e) {
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      upArrowPressed = true;
    }
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      downArrowPressed = true;
    }
    if (e.key === 'Enter') {
      enterPressed = true;
      if (gameState === 'start' || gameState === 'gameOver') {
        resetGame();
        gameState = 'playing';
      }
    }
  }
  
  function keyUpHandler(e) {
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      upArrowPressed = false;
    }
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      downArrowPressed = false;
    }
    if (e.key === 'Enter') {
      enterPressed = false;
    }
  }
  
  function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
    score.player = 0;
    score.computer = 0;
  }
  
  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
  }
  
  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  
  function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  }
  
  function drawText(text, x, y, color, fontSize) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Bangers`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }
  
  function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
      drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
    }
  }
  
  function collision(b, p) {
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
  }
  
  function update() {
    if (upArrowPressed && player.y > 0) {
      player.y -= player.speed;
    } else if (downArrowPressed && player.y < canvas.height - player.height) {
      player.y += player.speed;
    }
    
    let computerCenter = computer.y + computer.height / 2;
    let ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 35) {
      computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
      computer.y -= computer.speed;
    }
    
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.velocityY = -ball.velocityY;
    }
    
    let paddle = (ball.x + ball.radius < canvas.width / 2) ? computer : player;
    
    if (collision(ball, paddle)) {
      let collidePoint = (ball.y - (paddle.y + paddle.height / 2));
      collidePoint = collidePoint / (paddle.height / 2);
      
      let angleRad = (Math.PI / 4) * collidePoint;
      
      let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
      
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      
      ball.speed += 0.1;
      
      
      addComicEffect(paddle.x, ball.y);
    }
    
    if (ball.x - ball.radius < 0) {
      score.player++;
      resetBall();
      if (score.player >= 5) {
        gameState = 'gameOver';
      }
    } else if (ball.x + ball.radius > canvas.width) {
      score.computer++;
      resetBall();
      if (score.computer >= 5) {
        gameState = 'gameOver';
      }
    }
  }
  
  function render() {
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");
    
    if (gameState === 'start') {
      drawText("PONG", canvas.width / 2, canvas.height / 2 - 30, mainColor, 30);
      drawText("Press ENTER to Start", canvas.width / 2, canvas.height / 2 + 30, "white", 15);
    } 
    else if (gameState === 'playing') {
      drawNet();
      
      drawText(score.computer.toString(), canvas.width / 4, 30, "white", 24);
      drawText(score.player.toString(), 3 * canvas.width / 4, 30, "white", 24);
      
      drawRect(player.x, player.y, player.width, player.height, player.color);
      drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
      
      drawCircle(ball.x, ball.y, ball.radius, ball.color);
    } 
    else if (gameState === 'gameOver') {
      let winner = score.player > score.computer ? "YOU WIN!" : "COMPUTER WINS!";
      drawText(winner, canvas.width / 2, canvas.height / 2 - 30, mainColor, 24);
      drawText(`${score.computer} - ${score.player}`, canvas.width / 2, canvas.height / 2, "white", 20);
      drawText("Press ENTER to Restart", canvas.width / 2, canvas.height / 2 + 30, "white", 15);
    }
  }
  
  function gameLoop() {
    if (gameState === 'playing') {
      update();
    }
    render();
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
}

function addPigRoaster() {
  
  removePigRoaster();
  
  
  pigElement = document.createElement('div');
  pigElement.id = 'roast-pig';
  pigElement.style.cssText = `
    position: fixed;
    right: -80px;
    bottom: 100px; /* Moved lower down instead of vertically centered */
    width: 170px;
    height: 200px;
    background-image: url('${chrome.runtime.getURL('media/pig.png')}');
    background-size: contain;
    background-position: left;
    background-repeat: no-repeat;
    z-index: 10000;
    cursor: pointer;
    transition: right 0.3s ease;
    background-color: transparent !important; /* Ensure transparent background */
  `;
  
  
  pigElement.addEventListener('mouseenter', () => {
    pigElement.style.right = '0';
  });
  
  pigElement.addEventListener('mouseleave', () => {
    pigElement.style.right = '-80px';
  });
  
  
  pigElement.addEventListener('click', generateRoast);
  
  document.body.appendChild(pigElement);
  
  
  const pigStyle = document.createElement('style');
  pigStyle.textContent = `
    #roast-pig {
      background-color: transparent !important;
    }
    
    /* Roast bubble styling */
    .roast-bubble {
      background-color: white !important;
      box-shadow: 3px 3px 5px rgba(0,0,0,0.3) !important;
      font-family: 'Bangers', cursive !important;
      font-size: 16px !important;
      color: ${mainColor} !important;
      border: 3px solid ${mainColor} !important;
      border-radius: 15px !important;
      padding: 15px !important;
    }
    
    .roast-bubble-tail {
      border-left-color: ${mainColor} !important;
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(pigStyle);
}


async function generateRoast() {
  
  const pageText = document.body.innerText.substring(0, 1000); 
  const pageTitle = document.title;
  
  
  showRoastBubble("Cooking up a roast... 🔥");
  
  try {
    
    const fallbackRoasts = [
      "Oink oink! Spending your time on this page? Your productivity just went to the slaughterhouse!",
      "Squeal! Reading this when you should be working? That's what I call hogwashing your responsibilities!",
      "Oink! Nice try opening this page. Your browser history is messier than a pig pen!",
      "OINK! This page again? You're really wallowing in mediocrity today!",
      "Snort snort! If your boss saw this page, you'd be bacon by morning!",
      "Oink oink! Your interest in this content is as questionable as my table manners!"
    ];

    const GEMINI_API_KEY = "AIzaSyARBgeRS6EQS4tsdO9yQvYh_biYNbOVJeU";
    
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const fetchPromise = fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts:[{text: `Based on this webpage title: "${pageTitle}" and content: "${pageText}", create a short, funny, pig-themed roast of the user for browsing this page. Make it witty, sarcastic and comically insulting, but not mean-spirited. Keep it under 150 characters. Start with "Oink oink!" or similar pig sounds.`}]
        }]
      })
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const data = await response.json();
    
    if (data && data.candidates && data.candidates[0] && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      const roast = data.candidates[0].content.parts[0].text;
      showRoastBubble(roast);
    } else {
      const fallbackRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
      showRoastBubble(fallbackRoast);
    }
  } catch (error) {
    console.error("Roast generation failed:", error);
    
    const fallbackRoasts = [
      "Oink oink! Spending your time on this page? Your productivity just went to the slaughterhouse!",
      "Squeal! Reading this when you should be working? That's what I call hogwashing your responsibilities!",
      "Oink! Nice try opening this page. Your browser history is messier than a pig pen!",
      "OINK! This page again? You're really wallowing in mediocrity today!",
      "Snort snort! If your boss saw this page, you'd be bacon by morning!",
      "Oink oink! Your interest in this content is as questionable as my table manners!"
    ];
    
    const fallbackRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
    showRoastBubble(fallbackRoast);
  }
}

function showRoastBubble(text) {
  
  if (roastBubble && roastBubble.parentNode) {
    roastBubble.parentNode.removeChild(roastBubble);
  }
  
  
  roastBubble = document.createElement('div');
  roastBubble.className = 'roast-bubble';
  roastBubble.style.cssText = `
    position: fixed;
    right: 120px;
    bottom: 160px; /* Adjusted to align with pig */
    background: white !important;
    border: 3px solid ${mainColor};
    border-radius: 15px;
    padding: 15px;
    max-width: 300px;
    z-index: 10001;
    box-shadow: 3px 3px 5px rgba(0,0,0,0.3);
    font-family: 'Bangers', cursive;
    font-size: 16px;
    color: ${mainColor};
  `;
  
  roastBubble.textContent = text;
  
  
  const tail = document.createElement('div');
  tail.className = 'roast-bubble-tail';
  tail.style.cssText = `
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 15px solid ${mainColor};
    background-color: transparent !important;
  `;
  
  roastBubble.appendChild(tail);
  document.body.appendChild(roastBubble);
  
  
  setTimeout(() => {
    if (roastBubble && roastBubble.parentNode) {
      roastBubble.parentNode.removeChild(roastBubble);
      roastBubble = null;
    }
  }, 10000);
}


function removePigRoaster() {
  if (pigElement && pigElement.parentNode) {
    pigElement.parentNode.removeChild(pigElement);
    pigElement = null;
  }
  
  if (roastBubble && roastBubble.parentNode) {
    roastBubble.parentNode.removeChild(roastBubble);
    roastBubble = null;
  }
}


function addNerdSummarizer() {
  
  removeNerdSummarizer();
  
  
  nerdElement = document.createElement('div');
  nerdElement.id = 'nerd-summarizer';
  nerdElement.style.cssText = `
    position: fixed;
    left: -80px;
    bottom: 100px;
    width: 170px;
    height: 200px;
    background-image: url('${chrome.runtime.getURL('media/spongebob.png')}');
    background-size: contain;
    background-position: right;
    background-repeat: no-repeat;
    z-index: 10000;
    cursor: pointer;
    transition: left 0.3s ease;
    background-color: transparent !important;
  `;
  
  
  nerdElement.addEventListener('mouseenter', () => {
    nerdElement.style.left = '0';
  });
  
  nerdElement.addEventListener('mouseleave', () => {
    nerdElement.style.left = '-80px';
  });
  
  nerdElement.addEventListener('click', generateSummary);
  
  document.body.appendChild(nerdElement);
  
  const nerdStyle = document.createElement('style');
  nerdStyle.textContent = `
    #nerd-summarizer {
      background-color: transparent !重要;
    }
    
    /* Summary bubble styling */
    .summary-bubble {
      background-color: white !important;
      box-shadow: 3px 3px 5px rgba(0,0,0,0.3) !重要;
      font-family: 'Bangers', cursive !重要;
      font-size: 16px !重要;
      color: ${mainColor} !重要;
      border: 3px solid ${mainColor} !重要;
      border-radius: 15px !重要;
      padding: 15px !重要;
    }
    
    .summary-bubble-tail {
      border-right-color: ${mainColor} !重要;
      background-color: transparent !重要;
    }
  `;
  document.head.appendChild(nerdStyle);
}

function removeNerdSummarizer() {
  if (nerdElement && nerdElement.parentNode) {
    nerdElement.parentNode.removeChild(nerdElement);
    nerdElement = null;
  }
  
  if (summaryBubble && summaryBubble.parentNode) {
    summaryBubble.parentNode.removeChild(summaryBubble);
    summaryBubble = null;
  }
}

async function generateSummary() {
  const pageText = document.body.innerText.substring(0, 1500); 
  const pageTitle = document.title;
  const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
  const h1Text = Array.from(document.querySelectorAll('h1')).map(h => h.innerText).join('. ');
  
  
  showSummaryBubble("Erm, analyzing page content... *adjusts glasses*");
  
  try {
    
    const fallbackSummaries = [
      "Erm, actually this appears to be a webpage about general internet content. *adjusts glasses* The information architecture could be improved by approximately 37.2%.",
      "Well, technically speaking, this site contains HTML, CSS, and Javascript. *snorts* I could have coded it better in 1/3 the time.",
      "Um, according to my calculations, this page has a complexity rating of 3.7 on the Flesch-Kincaid scale. *pushes up glasses* Not that impressive really.",
      "Erm, I've analyzed this content and found exactly 42 semantic errors. *cleans glasses nervously* The developer clearly didn't validate their markup.",
      "Actually, this page loads in 2.3 seconds, which is approximately 0.7 seconds slower than optimal. *adjusts bowtie* I could optimize it with a few algorithmic adjustments.",
      "Based on my extensive research, this content has a correlation coefficient of 0.86 with similar websites. *pushes glasses up* Not statistically significant enough."
    ];


    const GEMINI_API_KEY = "AIzaSyCL_N3hmVIlEE5jRY7-stVzAgD4H2JVkG0";

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const fetchPromise = fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts:[{text: `Analyze this webpage with title: "${pageTitle}", description: "${metaDesc}", main heading: "${h1Text}" and content: "${pageText}". Create a brief, nerdy summary of what this page is about. Make it sound like a stereotypical nerd - include phrases like "erm, actually", "technically speaking", "*adjusts glasses*", or "*pushes up glasses*". Keep it under 150 characters. Be a bit condescending but factually accurate.`}]
        }]
      })
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const data = await response.json();
    
    if (data && data.candidates && data.candidates[0] && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      const summary = data.candidates[0].content.parts[0].text;
      showSummaryBubble(summary);
    } else {
      const fallbackSummary = fallbackSummaries[Math.floor(Math.random() * fallbackSummaries.length)];
      showSummaryBubble(fallbackSummary);
    }
  } catch (error) {
    console.error("Summary generation failed:", error);
    
    const fallbackSummaries = [
      "Erm, actually this appears to be a webpage about general internet content. *adjusts glasses* The information architecture could be improved by approximately 37.2%.",
      "Well, technically speaking, this site contains HTML, CSS, and Javascript. *snorts* I could have coded it better in 1/3 the time.",
      "Um, according to my calculations, this page has a complexity rating of 3.7 on the Flesch-Kincaid scale. *pushes up glasses* Not that impressive really.",
      "Erm, I've analyzed this content and found exactly 42 semantic errors. *cleans glasses nervously* The developer clearly didn't validate their markup.",
      "Actually, this page loads in 2.3 seconds, which is approximately 0.7 seconds slower than optimal. *adjusts bowtie* I could optimize it with a few algorithmic adjustments.",
      "Based on my extensive research, this content has a correlation coefficient of 0.86 with similar websites. *pushes glasses up* Not statistically significant enough."
    ];
    
    const fallbackSummary = fallbackSummaries[Math.floor(Math.random() * fallbackSummaries.length)];
    showSummaryBubble(fallbackSummary);
  }
}

function showSummaryBubble(text) {
  
  if (summaryBubble && summaryBubble.parentNode) {
    summaryBubble.parentNode.removeChild(summaryBubble);
  }
  
  
  summaryBubble = document.createElement('div');
  summaryBubble.className = 'summary-bubble';
  summaryBubble.style.cssText = `
    position: fixed;
    left: 120px;
    bottom: 160px; /* Aligned with the nerd character */
    background: white !important;
    border: 3px solid ${mainColor};
    border-radius: 15px;
    padding: 15px;
    max-width: 300px;
    z-index: 10001;
    box-shadow: 3px 3px 5px rgba(0,0,0,0.3);
    font-family: 'Bangers', cursive;
    font-size: 16px;
    color: ${mainColor};
  `;
  
  summaryBubble.textContent = text;
  
  
  const tail = document.createElement('div');
  tail.className = 'summary-bubble-tail';
  tail.style.cssText = `
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 15px solid ${mainColor};
    background-color: transparent !important;
  `;
  
  summaryBubble.appendChild(tail);
  document.body.appendChild(summaryBubble);
  
  
  setTimeout(() => {
    if (summaryBubble && summaryBubble.parentNode) {
      summaryBubble.parentNode.removeChild(summaryBubble);
      summaryBubble = null;
    }
  }, 15000);
}
