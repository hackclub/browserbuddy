// Global settings
let iceSettings = {
  enabled: true,
  interval: 3,      // seconds
  size: 2,          // multiplier
  density: 3        // drops per interval
};

// Interval ID for creating ice drops
let iceDropIntervalId = null;

// Load settings when content script is initialized
chrome.storage.sync.get({
  enabled: true,
  interval: 3,
  size: 2,
  density: 3
}, function(items) {
  iceSettings = items;
  
  // Start ice drop effect if enabled
  if (iceSettings.enabled) {
    startIceDropEffect();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateSettings') {
    iceSettings = message.settings;
    
    // Stop existing interval
    if (iceDropIntervalId) {
      clearInterval(iceDropIntervalId);
      iceDropIntervalId = null;
    }
    
    // Restart if enabled
    if (iceSettings.enabled) {
      startIceDropEffect();
    }
  }
});

// Function to start ice drop effect
function startIceDropEffect() {
  // Create drops based on interval
  iceDropIntervalId = setInterval(function() {
    createIceDrops(iceSettings.density);
  }, iceSettings.interval * 1000);
  
  // Create initial drops
  createIceDrops(iceSettings.density);
}

// Function to create ice drops
function createIceDrops(count) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      // Create ice drop element
      const iceDrop = document.createElement('div');
      iceDrop.className = 'ice-drop';
      
      // Random size (10-30px) * size multiplier
      const baseSize = Math.floor(Math.random() * 20) + 10;
      const size = baseSize * iceSettings.size;
      iceDrop.style.width = `${size}px`;
      iceDrop.style.height = `${size}px`;
      
      // Random horizontal position
      const xPos = Math.floor(Math.random() * (windowWidth - size));
      iceDrop.style.left = `${xPos}px`;
      iceDrop.style.top = '-20px';
      
      // Set fall height as CSS variable for animation
      iceDrop.style.setProperty('--fall-height', `${windowHeight + 20}px`);
      
      // Random fall duration (slower for larger drops)
      const fallDuration = (Math.random() * 2 + 3) * (size / 20);
      iceDrop.style.animationDuration = `${fallDuration}s`;
      
      // Random slight left-right movement
      const swayAmount = Math.random() * 100 - 50;
      iceDrop.style.animationName = 'falling';
      
      // Add to DOM
      document.body.appendChild(iceDrop);
      
      // Create splash effect when ice drop hits bottom
      setTimeout(() => {
        createSplashEffect(xPos + size/2, windowHeight - 5, size);
        
        // Remove ice drop after animation completes
        setTimeout(() => {
          if (iceDrop.parentNode) {
            document.body.removeChild(iceDrop);
          }
        }, 100);
      }, fallDuration * 1000 * 0.95);
      
    }, i * 200); // Stagger drop creation
  }
}

// Function to create splash effect
function createSplashEffect(x, y, dropSize) {
  const splash = document.createElement('div');
  splash.className = 'ice-splash';
  
  // Size relative to drop size
  const splashSize = dropSize * 0.6;
  splash.style.width = `${splashSize}px`;
  splash.style.height = `${splashSize}px`;
  
  // Position at bottom of the screen where drop landed
  splash.style.left = `${x - splashSize/2}px`;
  splash.style.top = `${y - splashSize/2}px`;
  
  // Add to DOM
  document.body.appendChild(splash);
  
  // Remove after animation
  setTimeout(() => {
    if (splash.parentNode) {
      document.body.removeChild(splash);
    }
  }, 600);
}
