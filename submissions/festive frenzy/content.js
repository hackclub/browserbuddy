let isTabFocused = true;
let snowfallEnabled = true;

const songs = [
  'https://cloud-qj0czltv1-hack-club-bot.vercel.app/1deck_the_halls.mp3',
  'https://cloud-qj0czltv1-hack-club-bot.vercel.app/0last_christmas.mp3'
];
let currentSongIndex = Math.floor(Math.random() * songs.length);

const audio = new Audio(songs[currentSongIndex]);
audio.loop = true;
audio.volume = 0.5;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'enable') {
    snowfallEnabled = true;
    console.log("Snowfall enabled");
    toggleSnowfall();
    playRandomSong();
    sendResponse({ success: true, status: "Snowfall enabled" });
  } else if (message.action === 'disable') {
    snowfallEnabled = false;
    console.log("Snowfall disabled");
    toggleSnowfall();
    stopMusic();
    sendResponse({ success: true, status: "Snowfall disabled" });
  } else {
    sendResponse({ success: false, error: "Unknown action" });
  }
});

function toggleSnowfall() {
  if (snowfallEnabled) {
    document.body.classList.add('snowfall');
    preloadedImage.style.opacity = '1';
    if (!snowflakeInterval) snowflakeInterval = setInterval(createSnowflake, 50);
    if (!emojiInterval) emojiInterval = setInterval(createEmoji, 4000);
  } else {
    document.body.classList.remove('snowfall');
    preloadedImage.style.opacity = '0';
    clearInterval(snowflakeInterval);
    clearInterval(emojiInterval);
    snowflakeInterval = null;
    emojiInterval = null;
  }
  chrome.storage.sync.set({ snowfallEnabled });
}

function playRandomSong() {
  currentSongIndex = Math.floor(Math.random() * songs.length);
  audio.src = songs[currentSongIndex];
  audio.play();
}

function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
}

function createSnowflake() {
  if (!snowfallEnabled || !isTabFocused) return;

  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.textContent = '⚪';
  snowflake.style.left = (Math.random() * 100) + 'vw';
  snowflake.style.top = '-1%';
  snowflake.style.animationDuration = 10 + Math.random() * 5 + 's';
  snowflake.style.fontSize = 8 + Math.random() * 2 + 'px';
  snowflake.style.opacity = Math.random();
  snowflake.style.zIndex = 9999;
  document.body.appendChild(snowflake);

  snowflake.addEventListener('animationend', () => {
    snowflake.remove();
  });
}

let snowflakeInterval = null;
let emojiInterval = null;

const snowStyle = document.createElement('style');
snowStyle.textContent = `
  .snowflake {
    position: fixed;
    top: 0;
    pointer-events: none;
    animation: fall linear infinite;
  }

  @keyframes fall {
    from {
      transform: translate(0, 0) rotate(0deg);
    }
    to {
      transform: translate(15vw, 100vh) rotate(8deg);
    }
  }
`;
document.head.appendChild(snowStyle);

const preloadedImage = document.createElement('img');
preloadedImage.src = 'https://cloud-enugqt3ba-hack-club-bot.vercel.app/0snow.png';
preloadedImage.style.position = 'fixed';
preloadedImage.style.bottom = '0';
preloadedImage.style.right = '0';
preloadedImage.style.width = '25%';
preloadedImage.style.pointerEvents = 'none';
preloadedImage.style.opacity = '1';
preloadedImage.style.zIndex = '9999';
document.body.appendChild(preloadedImage);

const emojis = [
  '🎄', '🎅', '🦌', '❄️', '🌟', '🎁', '🎉', '🕯️', 
  'https://cloud-b5tnt582t-hack-club-bot.vercel.app/0christmas11q.png',
  'https://cloud-b5tnt582t-hack-club-bot.vercel.app/1christmas2q.png',
  'https://cloud-b5tnt582t-hack-club-bot.vercel.app/4yay.gif',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/0christmascatsq.png',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/1christmas1q.png',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/2christmas5q__1_.png',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/3christmas5q.png',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/4celebrate5q.gif',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/5christmascakeq.gif',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/6christmastree.png',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/7santa.gif',
  'https://cloud-5fx3h95vw-hack-club-bot.vercel.app/8heart-8bit-1.gif'
];

function createEmoji() {
  if (!snowfallEnabled || !isTabFocused) return;

  const emoji = document.createElement('div');
  emoji.className = 'emoji';

  const emojiContent = emojis[Math.floor(Math.random() * emojis.length)];

  if (emojiContent.includes('http')) {
    const img = document.createElement('img');
    img.src = emojiContent;
    img.style.width = 20 + Math.random() * 10 + 'px';
    img.style.height = img.style.width;

    emoji.appendChild(img);
  } else {
    emoji.textContent = emojiContent;
    emoji.style.fontSize = 20 + Math.random() * 10 + 'px';
  }

  emoji.style.left = Math.random() * 100 + 'vw';
  emoji.style.top = Math.random() * 100 + 'vh';
  emoji.style.opacity = 0;
  emoji.style.position = 'fixed';
  emoji.style.animation = 'emojiUp 2.3s forwards';

  document.body.appendChild(emoji);

  emoji.addEventListener('animationend', () => {
    emoji.remove();
  });
}

const emojiStyle = document.createElement('style');
emojiStyle.textContent = `
  @keyframes emojiUp {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-60px);
    }
  }
`;
document.head.appendChild(emojiStyle);

window.addEventListener('focus', () => {
  isTabFocused = true;
});

window.addEventListener('blur', () => {
  isTabFocused = false;
});

chrome.storage.sync.get('snowfallEnabled', (data) => {
  console.log("Stored snowfall state:", data.snowfallEnabled);
  if (data.snowfallEnabled === undefined) {
    chrome.storage.sync.set({ snowfallEnabled: true });
    snowfallEnabled = true;
  } else {
    snowfallEnabled = data.snowfallEnabled;
  }
  toggleSnowfall();
});

window.addEventListener('beforeunload', () => {
  clearInterval(snowflakeInterval);
  clearInterval(emojiInterval);
});
