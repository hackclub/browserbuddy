class BackgroundManager {
  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
      chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    } catch (error) {
      console.error('[Readcess] Background initialization error:', error);
    }
  }

  async handleInstall(details) {
    if (details.reason === 'install') {
      await StorageManager.saveSettings({
        readingSpeed: 200,
        breakInterval: 0.1
      });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch(() => {});
    }
  }
}

class BreakManager {
  constructor() {
    this.settings = null;
    this.lastActivity = Date.now();
    this.isBreakActive = false;
    this.checkInterval = null;
    this.breakShownTime = null;
    this.lastUserAction = Date.now();
    this.activeTime = 0;
    this.afkTimeout = null;
    this.maxBreakDuration = 5 * 60 * 1000;
    this.afkThreshold = 2 * 60 * 1000;
    this.gracePeriod = 300;
    
    this.initialize();
    this.setupActivityTracking();
  }

  async initialize() {
    const settings = await StorageManager.getSettings();
    this.settings = {
      readingSpeed: settings.readingSpeed || 200,
      breakInterval: settings.breakInterval || 2,
      enabled: settings.enabled !== undefined ? settings.enabled : true
    };
  }

  setupActivityTracking() {
    this.cleanup();
    this.boundUpdateActivity = this.updateActivity.bind(this);
    this.boundCheckBreakTime = this.checkBreakTime.bind(this);
    
    this.activeTimeInterval = setInterval(() => {
      if (!this.graceEndTime || Date.now() > this.graceEndTime) {
        this.activeTime += 1;
      }
    }, 1000);
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'userActivity') {
        this.lastUserAction = Date.now();
      }
    });
    
    this.checkInterval = setInterval(this.boundCheckBreakTime, 1000);
  }

  cleanup() {
    if (this.afkTimeout) {
      clearTimeout(this.afkTimeout);
      this.afkTimeout = null;
    }
    
    if (this.activeTimeInterval) {
      clearInterval(this.activeTimeInterval);
      this.activeTimeInterval = null;
    }
    
    if (this.boundUpdateActivity) {
      chrome.tabs.onActivated.removeListener(this.boundUpdateActivity);
      chrome.tabs.onUpdated.removeListener(this.boundUpdateActivity);
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  async checkBreakTime() {
    if (!this.settings?.enabled) return;
    
    if (this.graceEndTime && Date.now() < this.graceEndTime) {
      return;
    }
    this.graceEndTime = null;

    const breakIntervalSeconds = this.settings.breakInterval * 60;

    if (this.activeTime >= breakIntervalSeconds && !this.isBreakActive) {
      this.showBreakReminder();
      this.activeTime = 0;
    }
  }

  async showBreakReminder() {
    this.isBreakActive = true;
    this.breakShownTime = Date.now();
    this.lastUserAction = Date.now();
    
    if (this.afkTimeout) {
      clearTimeout(this.afkTimeout);
    }
    
    this.afkTimeout = setTimeout(() => {
      if (this.isBreakActive) {
        this.dismissBreak();
      }
    }, this.maxBreakDuration);
    
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        url: ['http://*/*', 'https://*/*']
      });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'showBreak',
            breakInterval: this.settings.breakInterval
          });
        } catch (e) {}
      }
    } catch (e) {}
  }

  async dismissBreak() {
    if (this.afkTimeout) {
      clearTimeout(this.afkTimeout);
      this.afkTimeout = null;
    }
    
    this.isBreakActive = false;
    this.lastActivity = Date.now();
    this.breakShownTime = null;
    this.activeTime = 0;
    this.graceEndTime = Date.now() + (this.gracePeriod * 1000);
    
    const tabs = await chrome.tabs.query({
      active: true,
      url: ['http://*/*', 'https://*/*']
    });
    
    for (const tab of tabs) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' })
          .catch(() => null);
        
        if (response) {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'dismissBreak'
          }).catch(() => {});
        }
      } catch (e) {}
    }
  }

  handleBreakDismissed() {
    this.dismissBreak();
  }

  async handleBreakSnoozed() {
    this.dismissBreak();
    this.activeTime = Math.max(0, (this.settings.breakInterval * 60) - 10);
  }

  validateSettings(readingSpeed, breakInterval) {
    if (isNaN(readingSpeed) || readingSpeed < 100 || readingSpeed > 1000) {
      this.showStatus('Reading speed must be between 100 and 1000 WPM', 'error');
      return false;
    }

    if (isNaN(breakInterval) || breakInterval < 0.1 || breakInterval > 480) {
      this.showStatus('Break interval must be between 6 seconds and 8 hours', 'error');
      return false;
    }

    return true;
  }
}

const backgroundManager = new BackgroundManager();
const breakManager = new BreakManager();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    breakManager.settings = message.settings;
  } else if (message.action === 'breakSnoozed') {
    breakManager.handleBreakSnoozed();
  } else if (message.action === 'breakDismissed') {
    breakManager.handleBreakDismissed();
  }
});