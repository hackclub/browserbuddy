const imageUrls = [];
for (let i = 1; i <= 7; i++) {
  imageUrls.push(chrome.runtime.getURL(`images/${i}.jpg`));
}

let currentIndex = 0;

const replaceImage = (img) => {
  if (!img.dataset.orpheousReplaced) {
    img.src = imageUrls[currentIndex % 7];
    img.dataset.orpheousReplaced = "true";
    currentIndex++;
    img.style.objectFit = "cover";
  }
};

const replaceThumbnails = () => {
  try {
    const images = document.getElementsByTagName('img');
    
    for (const img of images) {
      if (img.complete) {
        replaceImage(img);
      } else {
        img.addEventListener('load', () => replaceImage(img), { once: true });
      }
    }
  } catch (err) {
    if (err.message.includes('Extension context invalidated')) {
      cleanup();
      return;
    }
  }
};

const observer = new MutationObserver(replaceThumbnails);
observer.observe(document.body, { childList: true, subtree: true });

const cleanup = () => {
  clearInterval(mainInterval);
  clearInterval(urlCheckInterval);
  observer.disconnect();
};

setTimeout(replaceThumbnails, 1000);
const mainInterval = setInterval(replaceThumbnails, 500);

let lastUrl = location.href;
const urlCheckInterval = setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    currentIndex = 0;
    setTimeout(replaceThumbnails, 1000);
  }
}, 500);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(replaceThumbnails, 1000);
  }
});

window.addEventListener('yt-navigate-finish', () => {
  setTimeout(replaceThumbnails, 1000);
});