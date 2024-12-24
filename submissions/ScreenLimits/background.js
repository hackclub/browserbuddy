class BackgroundManager {
  constructor() {
    this.activeTabId = null;
    this.initialize();
  }

  initialize() {
    this.setupTabListeners();
    this.setupAlarms();
    this.setupMessageListeners();
  }

  setupTabListeners() {
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.activeTabId = activeInfo.tabId;
      if (this.activeTabId) {
        this.checkSiteBlocking(this.activeTabId).catch(console.error);
      }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.checkSiteBlocking(tabId).catch(console.error);
      }
    });
  }

  setupAlarms() {
    const midnightTime = this.getNextMidnight();
    chrome.alarms.create('dailyReset', {
      when: midnightTime,
      periodInMinutes: 1440
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'dailyReset') {
        this.resetDailyTracking().catch(console.error);
      }
    });
  }

  getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'GET_SETTINGS':
          this.getSettings().then(sendResponse);
          return true;
        case 'UPDATE_SETTINGS':
          this.updateSettings(request.settings).then(sendResponse);
          return true;
        case 'GET_TIME_DATA':
          this.getTimeData().then(sendResponse);
          return true;
      }
    });
  }

  shouldCheckUrl(url) {
    const skipPatterns = [
      'chrome://',
      'chrome-extension://',
      'about:',
      'data:',
      'file:',
      'edge://',
      'brave://'
    ];

    return !skipPatterns.some(pattern => url.startsWith(pattern));
  }

  matchesBlockedPattern(url, pattern) {
    try {
      const regexPattern = pattern
        .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
        .replace(/\\\*/g, '.*');
      const regex = new RegExp(regexPattern);
      return regex.test(url);
    } catch (error) {
      console.error('Error in pattern matching:', error, pattern);
      return false;
    }
  }


  async checkSiteBlocking(tabId) {
    try {
      const settings = await this.getSettings();
      let tab;
      try{
         tab = await chrome.tabs.get(tabId);
      } catch(e){
          console.debug("Tab not found: ", tabId);
          return;
      }

      if (!tab.url || !this.shouldCheckUrl(tab.url)) {
        return;
      }

      const isUnblocked = settings.unblockSites.some(pattern =>
        this.matchesBlockedPattern(tab.url, pattern)
      );
      if (isUnblocked) {
        console.log(`Unblock list matched: ${tab.url}`);
        return;
      }

      const isBlocked = settings.blockedSites.some(pattern =>
        this.matchesBlockedPattern(tab.url, pattern)
      );

      if (isBlocked) {
        try {
          await chrome.tabs.sendMessage(tabId, {
            type: 'UPDATE_SETTINGS',
            settings: settings
          });
        } catch (error) {
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tabId, {
                type: 'UPDATE_SETTINGS',
                settings: settings
              });
            } catch (retryError) {
              console.error('Failed to send message after retry:', retryError);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error in checkSiteBlocking:', error);
    }
  }


  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('settings', (result) => {
        resolve(result.settings || {
          dailyLimit: 120,
          blockedSites: [],
          unblockSites: [],
          notifications: true
        });
      });
    });
  }



  async updateSettings(settings) {
    try {
      await chrome.storage.sync.set({ settings });

      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && this.shouldCheckUrl(tab.url)) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: 'UPDATE_SETTINGS',
              settings: settings
            });
          } catch (error) {
            console.debug('Could not update tab:', tab.id, error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  async getTimeData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('timeData', (result) => {
        resolve(result.timeData || {});
      });
    });
  }

  async resetDailyTracking() {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && this.shouldCheckUrl(tab.url)) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: 'RESET_TIME'
            });
          } catch (error) {
            console.debug('Could not reset tab:', tab.id, error);
          }
        }
      }
    } catch (error) {
      console.error('Error resetting daily tracking:', error);
    }
  }
}

const backgroundManager = new BackgroundManager();