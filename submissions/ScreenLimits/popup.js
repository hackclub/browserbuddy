class PopupManager {
  constructor() {
    this.settings = null;
    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateDisplay();
    this.startTimeUpdates();
  }

  async loadSettings() {
    this.settings = await this.sendMessage({ type: 'GET_SETTINGS' });
    const timeData = await this.sendMessage({ type: 'GET_TIME_DATA' });
    const today = new Date().toISOString().split('T')[0];
    this.timeSpent = timeData[today] || 0;
  }

  setupEventListeners() {
    document.getElementById('updateLimit').addEventListener('click', () => {
      const newLimit = document.getElementById('dailyLimit').value;
      if (newLimit && newLimit > 0) {
        this.settings.dailyLimit = parseInt(newLimit);
        this.saveSettings();
      }
    });

    document.getElementById('addSite').addEventListener('click', () => {
      const newSite = document.getElementById('newSite').value.trim();
      if (newSite && !this.settings.blockedSites.includes(newSite)) {
        this.settings.blockedSites.push(newSite);
        this.saveSettings();
        this.updateSiteList();
        document.getElementById('newSite').value = '';
      }
    });

    document.getElementById('notifications').addEventListener('change', (e) => {
      this.settings.notifications = e.target.checked;
      this.saveSettings();
    });
  }

  async sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }

  updateDisplay() {
    document.getElementById('dailyLimit').value = this.settings.dailyLimit;
    document.getElementById('notifications').checked = this.settings.notifications;
    this.updateTimeDisplay();
    this.updateSiteList();
  }

  updateTimeDisplay() {
    const hours = Math.floor(this.timeSpent / 60);
    const minutes = this.timeSpent % 60;
    const timeDisplay = `${hours}h ${minutes}m / ${this.settings.dailyLimit}m`;
    document.getElementById('timeSpent').textContent = timeDisplay;
  }

  updateSiteList() {
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';

    this.settings.blockedSites.forEach(site => {
      const item = document.createElement('div');
      item.className = 'site-item';

      const siteText = document.createElement('span');
      siteText.textContent = site;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Remove';
      deleteBtn.onclick = () => {
        this.settings.blockedSites = this.settings.blockedSites.filter(s => s !== site);
        this.saveSettings();
        this.updateSiteList();
      };

      item.appendChild(siteText);
      item.appendChild(deleteBtn);
      siteList.appendChild(item);
    });
  }

  startTimeUpdates() {
    setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_TIME' }, (response) => {
            if (response) {
              this.timeSpent = response.timeSpent;
              this.updateTimeDisplay();
            }
          });
        }
      });
    }, 60000);
  }

  async saveSettings() {
    await this.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: this.settings
    });
  }
}

document.getElementById('addUnblockSite').addEventListener('click', async () => {
  const input = document.getElementById('unblockSiteInput');
  const site = input.value.trim();
  if (!site) return;

  chrome.storage.sync.get('settings', (result) => {
    const settings = result.settings || { blockedSites: [], unblockSites: [] };
    settings.unblockSites = settings.unblockSites || [];
    if (!settings.unblockSites.includes(site)) {
      settings.unblockSites.push(site);
      chrome.storage.sync.set({ settings }, () => {
        input.value = '';
        updateUnblockList(settings.unblockSites);
      });
    }
  });
});

function updateUnblockList(unblockSites) {
  const list = document.getElementById('unblockList');
  list.innerHTML = '';
  unblockSites.forEach((site) => {
    const item = document.createElement('li');
    item.textContent = site;
    list.appendChild(item);
  });
}

chrome.storage.sync.get('settings', (result) => {
  const settings = result.settings || { blockedSites: [], unblockSites: [] };
  updateUnblockList(settings.unblockSites || []);
});


const popupManager = new PopupManager();
