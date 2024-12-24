class ScreenTimeManager {
  constructor() {
    this.settings = null;
    this.timeSpent = 0;
    this.isBlocked = false;
    this.currentDomain = window.location.hostname;
    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    this.startTracking();
    this.setupMessageListener();
    this.checkIfSiteBlocked();

      chrome.storage.onChanged.addListener(async (changes, areaName) => {
          if(areaName !== 'sync') return;
          if (changes.settings) {
            this.settings = changes.settings.newValue || {
                dailyLimit: 120,
                blockedSites: [],
                unblockSites: [],
                notifications: true
              };
            this.checkIfSiteBlocked();
          }
        });

    document.addEventListener('DOMContentLoaded', () => {
        this.checkIfSiteBlocked();
      });

  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings', 'timeData'], (result) => {
        this.settings = result.settings || {
          dailyLimit: 120,
          blockedSites: [],
          notifications: true,
            unblockSites:[]
        };
        const today = this.getCurrentDate();
        this.timeSpent = (result.timeData && result.timeData[today]) || 0;
        resolve();
      });
    });
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  checkIfSiteBlocked() {
      if (!this.settings) return;

      const currentUrl = window.location.href;

      const isUnblocked = (Array.isArray(this.settings.unblockSites) ? this.settings.unblockSites : []).some(pattern => {
        try {
          const regexPattern = pattern
            .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
            .replace(/\\\*/g, '.*');
          const regex = new RegExp(regexPattern);
          return regex.test(currentUrl);
        } catch (error) {
          console.error('Error in unblock pattern matching:', error);
          return false;
        }
      });

      if (isUnblocked) {
        console.log(`Site is unblocked: ${currentUrl}`);
        this.isBlocked = false;
        const overlay = document.getElementById('screenTimeOverlay');
        if (overlay) overlay.remove();
        return;
      }

      const isBlocked = (Array.isArray(this.settings.blockedSites) ? this.settings.blockedSites : []).some(pattern => {
        try {
          const regexPattern = pattern
            .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
            .replace(/\\\*/g, '.*');
          const regex = new RegExp(regexPattern);
          return regex.test(currentUrl);
        } catch (error) {
          console.error('Error in block pattern matching:', error);
          return false;
        }
      });

      if (isBlocked) {
        this.showBlockedOverlay("This site is in your blocked list.");
      }
    }



  startTracking() {
    this.checkTimeLimit();

    setInterval(() => {
      if (!document.hidden && !this.isBlocked) {
        this.timeSpent += 1;
        console.log(`Time spent updated: ${this.timeSpent} minutes`); // Debug log
        this.updateStorage();
        this.checkTimeLimit();
      }
    }, 60000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkTimeLimit();
      }
    });
  }

  async updateStorage() {
    const date = this.getCurrentDate();
    const timeData = {};
    timeData[date] = this.timeSpent;

    await chrome.storage.sync.set({ timeData });
    console.log(`Storage updated: ${this.timeSpent} minutes`); // Debug log
  }

  setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (chrome.runtime?.id === undefined) {
            console.debug("Extension context invalidated: message listener aborted", request);
            return;
        }
        try {
          switch (request.type) {
            case 'CHECK_TIME':
              sendResponse({ timeSpent: this.timeSpent });
              break;
            case 'UPDATE_SETTINGS':
              this.settings = request.settings || {
                dailyLimit: 120,
                blockedSites: [],
                unblockSites: [],
                notifications: true
              };
              this.checkTimeLimit();
              this.checkIfSiteBlocked();
              break;
            case 'RESET_TIME':
              this.timeSpent = 0;
              this.updateStorage();
              this.isBlocked = false;
              break;
            case 'GET_TIME_DATA':
              sendResponse({ timeSpent: this.timeSpent });
              break;
          }
        } catch (error) {
          console.error('Error in message listener:', error);
        }
        return true;
      });
    }


  async checkTimeLimit() {
    const currentTime = this.timeSpent;
    console.log(`Checking time limit: ${currentTime} / ${this.settings.dailyLimit}`); // Debug log

    if (currentTime >= this.settings.dailyLimit) {
      if (!this.isBlocked) {
        this.isBlocked = true;
        this.showBlockedOverlay("You've reached your daily time limit.");
      }
    } else if (this.settings.notifications &&
               currentTime >= (this.settings.dailyLimit * 0.8) &&
               !this.isBlocked) {
      this.showWarning();
    }
  }

  showBlockedOverlay(message) {
    const existingOverlay = document.getElementById('screenTimeOverlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'screenTimeOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: Arial, sans-serif;
    `;

    overlay.innerHTML = `
      <h1>Access Blocked</h1>
      <p>${message}</p>
      <p>Time spent today: ${this.timeSpent} minutes</p>
      <p>Daily limit: ${this.settings.dailyLimit} minutes</p>
    `;

    document.body.insertAdjacentElement('beforeend', overlay);

    const observer = new MutationObserver((mutations) => {
      if (!document.contains(overlay)) {
        document.body.insertAdjacentElement('beforeend', overlay);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  showWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: #ff9800;
      color: white;
      border-radius: 5px;
      z-index: 2147483647;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    warning.textContent = `Warning: You've used ${this.timeSpent} minutes out of your ${this.settings.dailyLimit} minute daily limit`;
    document.body.appendChild(warning);

    setTimeout(() => {
      warning.remove();
    }, 5000);
  }
}

const screenTimeManager = new ScreenTimeManager();
