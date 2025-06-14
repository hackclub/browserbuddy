console.log('[Readcess] Content script loaded');

class ReadingTracker {
  constructor() {
    console.log('[Readcess] Content script constructor start');
    this.settings = null;
    this.banner = null;
    this.breakOverlay = null;
    this.dragListeners = null;
    this.boundHandleMessage = this.handleMessage.bind(this);
    this.lastActivityTime = Date.now();
    this.activityListeners = [];
    
    console.log('[Readcess] ReadingTracker initializing');
    this.initialize();
    this.setupMessageListener();
    this.setupActivityTracking();
  }

  async initialize() {
    console.log('[Readcess] Content script initializing...');
    try {
      this.settings = await StorageManager.getSettings();
      console.log('[Readcess] Settings loaded:', this.settings);
      if (this.settings.enabled) {
        this.createBanner();
      }
      this.calculateAndDisplayReadingTime();
    } catch (e) {
      console.error('[Readcess] Initialization error:', e);
    }
  }

  createBanner() {
    if (window.location.hostname === 'github.com') {
      return;
    }

    this.banner = document.createElement('div');
    this.banner.className = 'reading-banner';
    
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const isDarkPage = this.isColorDark(bodyBg);
    this.banner.classList.add(isDarkPage ? 'light-theme' : 'dark-theme');
    
    const textContent = document.createElement('span');
    this.banner.appendChild(textContent);
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const handleDragStart = (e) => {
      isDragging = true;
      startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      currentX = startX;
      this.banner.style.transition = 'none';
    };
    
    const handleDrag = (e) => {
      if (!isDragging) return;
      
      const x = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const diff = x - startX;
      
      if (diff < 0) return;
      
      currentX = x;
      this.banner.style.transform = `translateX(${diff}px)`;
    };
    
    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      this.banner.style.transition = 'transform 0.3s ease';
      
      const diff = currentX - startX;
      if (diff > this.banner.offsetWidth * 0.5) {
        this.banner.style.transform = 'translateX(100%)';
        setTimeout(() => {
          this.cleanupBanner();
        }, 300);
      } else {
        this.banner.style.transform = 'translateX(0)';
      }
    };
    
    this.dragListeners = {
      mousedown: handleDragStart,
      touchstart: handleDragStart,
      mousemove: handleDrag,
      touchmove: handleDrag,
      mouseup: handleDragEnd,
      touchend: handleDragEnd
    };
    
    this.banner.addEventListener('mousedown', this.dragListeners.mousedown);
    this.banner.addEventListener('touchstart', this.dragListeners.touchstart);
    
    document.addEventListener('mousemove', this.dragListeners.mousemove);
    document.addEventListener('touchmove', this.dragListeners.touchmove);
    
    document.addEventListener('mouseup', this.dragListeners.mouseup);
    document.addEventListener('touchend', this.dragListeners.touchend);
    
    document.body.appendChild(this.banner);
    
    setTimeout(() => {
      if (this.banner) {
        this.banner.classList.add('visible');
      }
    }, 500);
    
    this.bannerText = textContent;
  }

  cleanupBanner() {
    if (!this.banner) return;
    
    if (this.dragListeners) {
      this.banner.removeEventListener('mousedown', this.dragListeners.mousedown);
      this.banner.removeEventListener('touchstart', this.dragListeners.touchstart);
      document.removeEventListener('mousemove', this.dragListeners.mousemove);
      document.removeEventListener('touchmove', this.dragListeners.touchmove);
      document.removeEventListener('mouseup', this.dragListeners.mouseup);
      document.removeEventListener('touchend', this.dragListeners.touchend);
    }
    
    this.banner.remove();
    this.banner = null;
    this.bannerText = null;
    this.dragListeners = null;
  }

  calculateAndDisplayReadingTime() {
    const text = ReadingUtils.getVisibleText(document.body);
    const readingTime = ReadingUtils.calculateReadingTime(text, this.settings.readingSpeed);
    const wordCount = ReadingUtils.countWords(text);
    
    if (this.bannerText) {
      this.bannerText.textContent = `~ ${ReadingUtils.formatTime(readingTime)} · ${wordCount.toLocaleString()} words`;
      this.bannerText.style.animation = 'none';
      this.bannerText.offsetHeight;
      this.bannerText.style.animation = 'highlight 0.5s ease';
    }
  }

  setupMessageListener() {
    console.log('[Readcess] Setting up message listener');
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'ping') {
          sendResponse(true);
          return;
        }
        this.boundHandleMessage(message, sender, sendResponse);
      });
      console.log('[Readcess] Message listener setup complete');
    } catch (e) {
      console.error('[Readcess] Message listener setup failed:', e);
    }
  }

  handleMessage(message, sender, sendResponse) {
    console.log('[Readcess] Received message:', message);
    if (message.action === 'settingsUpdated') {
      this.settings = message.settings;
      this.calculateAndDisplayReadingTime();
    } else if (message.action === 'showBreak') {
      this.showBreakReminder();
      sendResponse({ success: true });
    } else if (message.action === 'dismissBreak') {
      this.dismissBreak();
      sendResponse({ success: true });
    }
  }

  showBreakReminder() {
    console.log('[Readcess] Showing break reminder');
    if (this.breakOverlay) {
      this.dismissBreak();
    }

    this.breakOverlay = document.createElement('div');
    this.breakOverlay.className = 'break-overlay';
    
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const isDarkPage = this.isColorDark(bodyBg);
    
    this.breakOverlay.innerHTML = `
      <div class="break-content ${isDarkPage ? 'light-theme' : 'dark-theme'}">
        <h2>Time for a Break</h2>
        <div class="break-actions">
          <button id="snoozeBreak">Snooze</button>
        </div>
        <div class="hover-progress"></div>
      </div>
    `;

    document.body.appendChild(this.breakOverlay);
    
    const breakContent = this.breakOverlay.querySelector('.break-content');
    let hoverTimeout;
    let isHovering = false;
    
    breakContent.addEventListener('mouseenter', () => {
      console.log('[Readcess] Break content hover started');
      isHovering = true;
      breakContent.classList.add('hovering');
      hoverTimeout = setTimeout(() => {
        if (isHovering) {
          console.log('[Readcess] Break content hover completed');
          this.dismissBreak();
        }
      }, 1000);
    });
    
    breakContent.addEventListener('mouseleave', () => {
      console.log('[Readcess] Break content hover cancelled');
      isHovering = false;
      breakContent.classList.remove('hovering');
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    });
    
    const snoozeButton = this.breakOverlay.querySelector('#snoozeBreak');
    snoozeButton.addEventListener('click', () => {
      console.log('[Readcess] Snooze clicked');
      chrome.runtime.sendMessage({ action: 'breakSnoozed' });
      this.dismissBreak();
    });
  }

  dismissBreak() {
    console.log('[Readcess] Dismissing break');
    if (this.breakOverlay) {
      this.breakOverlay.remove();
      this.breakOverlay = null;
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({ action: 'breakDismissed' })
          .catch(e => {
            if (e.message.includes('Extension context invalidated')) {
              console.log('[Readcess] Extension reloaded, refreshing page...');
              window.location.reload();
            } else {
              console.error('[Readcess] Error sending dismiss message:', e);
            }
          });
      }
    }
  }

  isColorDark(color) {
    const rgb = color.match(/\d+/g);
    if (rgb) {
      const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
      return luminance < 0.5;
    }
    return false;
  }

  setupActivityTracking() {
    this.cleanupActivityListeners();
    
    const trackActivity = () => {
      this.lastActivityTime = Date.now();
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({ action: 'userActivity' })
          .catch(e => {
            if (e.message.includes('Extension context invalidated')) {
              console.log('[Readcess] Extension reloaded, refreshing page...');
              window.location.reload();
            } else {
              console.error('[Readcess] Error sending activity:', e);
            }
          });
      }
    };
    
    const debouncedTrackActivity = ReadingUtils.debounce(trackActivity, 1000);
    
    const events = ['scroll', 'mousemove', 'keypress', 'click'];
    events.forEach(event => {
      window.addEventListener(event, debouncedTrackActivity, { passive: true });
      this.activityListeners.push({ event, handler: debouncedTrackActivity });
    });
  }

  cleanupActivityListeners() {
    if (this.activityListeners && this.activityListeners.length > 0) {
      this.activityListeners.forEach(({ event, handler }) => {
        try {
          window.removeEventListener(event, handler);
        } catch (e) {}
      });
      this.activityListeners = [];
    }
  }

  cleanup() {
    console.log('[Readcess] Cleanup method called');
    this.cleanupBanner();
    
    if (this.boundHandleMessage) {
      chrome.runtime.onMessage.removeListener(this.boundHandleMessage);
    }
    
    if (this.breakOverlay) {
      this.breakOverlay.remove();
      this.breakOverlay = null;
    }

    this.cleanupActivityListeners();
    console.log('[Readcess] Cleanup completed');
  }
}

let tracker;
window.addEventListener('load', () => {
  console.log('[Readcess] Window load event triggered');
  tracker = new ReadingTracker();
});

window.addEventListener('beforeunload', () => {
  console.log('[Readcess] beforeunload triggered');
  if (tracker) {
    console.log('[Readcess] Cleanup starting...');
    try {
      tracker.cleanup();
      console.log('[Readcess] Cleanup successful');
    } catch (e) {
      console.error('[Readcess] Cleanup failed:', e);
    }
  }
}); 