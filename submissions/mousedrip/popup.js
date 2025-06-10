class MouseDripPopup {
  constructor() {
    this.settings = {
      defaultEmoji: "✨",
      trailSpeed: 500,
      customSites: {},
      isEnabled: true
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners(); 
    this.updateUI(); 
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'defaultEmoji', 'trailSpeed', 'customSites', 'isEnabled'
      ]);
      
     
      this.settings = {
        defaultEmoji: result.defaultEmoji || "✨",
        trailSpeed: result.trailSpeed || 500,
        customSites: result.customSites || {},
        isEnabled: result.isEnabled !== false 
      };
    } catch (error) {
      console.log("Using default settings"); 
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
      chrome.runtime.sendMessage({ action: "updateSettings" });
      this.showNotification('Settings saved!', 'success');
    } catch (error) {
      this.showNotification('Error saving settings', 'error');
    }
  }

  setupEventListeners() {
    
    const toggle = document.getElementById('enableToggle');
    toggle.addEventListener('click', () => {
      this.settings.isEnabled = !this.settings.isEnabled;
      this.updateToggle();
      this.saveSettings();
    });
   
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.settings.isEnabled = !this.settings.isEnabled;
        this.updateToggle();
        this.saveSettings();
      }
    });

    // Emoji picker 
    const emojiDisplay = document.getElementById('emojiDisplay');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiItems = document.querySelectorAll('.emoji-item');

    emojiDisplay.addEventListener('click', () => {
      emojiPicker.classList.toggle('visible');
    });

    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        emojiPicker.classList.remove('visible');
      }
    });

    emojiItems.forEach(item => {
      item.addEventListener('click', () => {
        const newEmoji = item.textContent;
        this.settings.defaultEmoji = newEmoji;
        emojiDisplay.textContent = newEmoji;
        emojiPicker.classList.remove('visible');
        this.saveSettings();
      });
    });

    
    document.addEventListener('click', (e) => {
      if (!emojiDisplay.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.remove('visible');
      }
    });

  
    const speedControl = document.getElementById('speedSlider');
    speedControl.addEventListener('input', (e) => {
      let speed = parseInt(e.target.value);
      this.settings.trailSpeed = speed;
      this.updateSpeedDisplay(speed);
      this.saveSettings();
    });

   
    const addBtn = document.getElementById('addSite');
    const siteInput = document.getElementById('siteInput');
    const siteEmoji = document.getElementById('siteEmoji');

    addBtn.addEventListener('click', () => {
      this.addCustomSite();
    });

    
    [siteInput, siteEmoji].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addCustomSite();
        }
      });
    });

   
    const feedbackLink = document.getElementById('feedbackBtn');
    feedbackLink.addEventListener('click', () => {
      chrome.tabs.create({
        url: 'https://forms.gle/jLd4rBK5GJgCnYP46'
      });
    });
  }

  updateUI() {
    this.updateToggle();
    document.getElementById('defaultEmoji').value = this.settings.defaultEmoji;
    document.getElementById('emojiDisplay').textContent = this.settings.defaultEmoji;
    document.getElementById('speedSlider').value = this.settings.trailSpeed;
    this.updateSpeedDisplay(this.settings.trailSpeed);
    this.updateSiteList();
  }

  updateToggle() {
    const toggleBtn = document.getElementById('enableToggle');
    toggleBtn.classList.toggle('active', this.settings.isEnabled);
  }

  updateSpeedDisplay(speed) {
    const display = document.getElementById('speedValue');
    let label = 'Medium';
    
    // Map speed 
    if (speed <= 200) label = 'Lightning ';
    else if (speed <= 400) label = 'Fast ';
    else if (speed <= 600) label = 'Medium ';
    else if (speed <= 800) label = 'Slow ';
    else label = 'Chill ';
    
    display.textContent = label;
  }

  addCustomSite() {
    const siteInput = document.getElementById('siteInput');
    const siteEmoji = document.getElementById('siteEmoji');
    
    let site = siteInput.value.trim().toLowerCase();
    let emoji = siteEmoji.value.trim();

    if (!site || !emoji) {
      this.showNotification('Please enter both site and emoji', 'error');
      return;
    }

    
    site = site.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    this.settings.customSites[site] = emoji;
    this.saveSettings();
    this.updateSiteList();

    // Reset 
    siteInput.value = '';
    siteEmoji.value = '';
    siteInput.focus();

    this.showNotification(`Added ${emoji} for ${site}`, 'success');
  }

  removeSite(site) {
    delete this.settings.customSites[site];
    this.saveSettings();
    this.updateSiteList();
    this.showNotification(`Removed ${site}`, 'success');
  }

  updateSiteList() {
    const list = document.getElementById('siteList');
    list.innerHTML = '';

    Object.entries(this.settings.customSites).forEach(([site, emoji]) => {
      const item = document.createElement('div');
      item.className = 'site-item';
      item.innerHTML = `
        <div class="site-info">
          <span style="font-size: 18px;">${emoji}</span>
          <span>${site}</span>
        </div>
        <button class="remove-btn" onclick="popup.removeSite('${site}')">×</button>
      `;
      list.appendChild(item);
    });
  }

  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff6b6b' : '#4ecdc4'};
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notif);

  
    requestAnimationFrame(() => {
      notif.style.opacity = '1';
    });

    
    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 300);
    }, 2000);
  }
}


const popup = new MouseDripPopup();
window.popup = popup;