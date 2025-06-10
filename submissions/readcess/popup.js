class PopupManager {
  constructor() {
    this.readingSpeedInput = document.getElementById('readingSpeed');
    this.breakIntervalInput = document.getElementById('breakInterval');
    this.saveButton = document.getElementById('saveSettings');
    this.saveStatus = document.getElementById('saveStatus');
    this.enabledToggle = document.getElementById('extensionEnabled');
    
    this.initialize();
  }

  async initialize() {
    console.log('[Readcess] Initializing popup');
    try {
      const settings = await StorageManager.getSettings();
      console.log('[Readcess] Got settings:', settings);
      this.readingSpeedInput.value = settings.readingSpeed;
      this.breakIntervalInput.value = settings.breakInterval;
      this.updateToggleState(settings.enabled);
      
      this.saveButton.addEventListener('click', () => this.saveSettings());
      this.enabledToggle.addEventListener('click', async () => {
        const currentState = this.enabledToggle.classList.contains('on');
        const newState = !currentState;
        
        try {
          await StorageManager.saveSettings({
            readingSpeed: parseInt(this.readingSpeedInput.value),
            breakInterval: parseFloat(this.breakIntervalInput.value),
            enabled: newState
          });
          
          this.updateToggleState(newState);
          this.showStatus('Settings saved!', 'success');
          
          const tabs = await chrome.tabs.query({});
          for (const tab of tabs) {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: 'settingsUpdated',
                settings: {
                  readingSpeed: parseInt(this.readingSpeedInput.value),
                  breakInterval: parseFloat(this.breakIntervalInput.value),
                  enabled: newState
                }
              });
            } catch (e) {
              console.log('[Readcess] Could not update tab:', tab.id);
            }
          }
        } catch (error) {
          console.error('[Readcess] Error saving settings:', error);
          this.updateToggleState(!newState);
          this.showStatus('Error saving settings', 'error');
        }
      });
      console.log('[Readcess] Popup initialized');
    } catch (error) {
      console.error('[Readcess] Popup initialization error:', error);
      this.showStatus('Error loading settings', 'error');
    }
  }

  updateToggleState(enabled) {
    if (enabled) {
      this.enabledToggle.classList.remove('off');
      this.enabledToggle.classList.add('on');
      this.enabledToggle.textContent = 'ON';
    } else {
      this.enabledToggle.classList.remove('on');
      this.enabledToggle.classList.add('off');
      this.enabledToggle.textContent = 'OFF';
    }
  }

  async saveSettings() {
    const readingSpeed = parseInt(this.readingSpeedInput.value);
    const breakInterval = parseFloat(this.breakIntervalInput.value);
    const enabled = this.enabledToggle.classList.contains('on');
    
    if (!this.validateSettings(readingSpeed, breakInterval)) {
      return;
    }

    this.saveButton.classList.add('saving');
    try {
      await StorageManager.saveSettings({ readingSpeed, breakInterval, enabled });
      
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'settingsUpdated',
            settings: { readingSpeed, breakInterval, enabled }
          });
        } catch (e) {}
      }
      
      this.showStatus('Settings saved!', 'success');
    } catch (error) {
      this.showStatus('Error saving settings', 'error');
      this.updateToggleState(false);
    } finally {
      this.saveButton.classList.remove('saving');
    }
  }

  validateSettings(readingSpeed, breakInterval) {
    if (isNaN(readingSpeed) || readingSpeed < 100 || readingSpeed > 1000) {
      this.showStatus('Reading speed must be between 100 and 1000 WPM', 'error');
      return false;
    }

    if (isNaN(breakInterval) || breakInterval < 2 || breakInterval > 480) {
      this.showStatus('Break interval must be between 2 minutes and 8 hours', 'error');
      return false;
    }

    return true;
  }

  showStatus(message, type) {
    this.saveStatus.textContent = message;
    this.saveStatus.className = `status-message ${type}`;
    setTimeout(() => {
      this.saveStatus.textContent = '';
      this.saveStatus.className = 'status-message';
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Readcess] DOM loaded, creating PopupManager');
  new PopupManager();
}); 