class BlackHoleController {
  constructor() {
    this.isActive = false;
    this.activateBtn = document.getElementById('activate-btn');
    this.deactivateBtn = document.getElementById('deactivate-btn');
    this.status = document.getElementById('status');
    this.blackHole = document.querySelector('.black-hole');
    
    this.init();
  }
  
  init() {
    this.activateBtn.addEventListener('click', () => this.activateBlackHole());
    this.deactivateBtn.addEventListener('click', () => this.deactivateBlackHole());
    
    this.checkCurrentState();
  }
  
  async checkCurrentState() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'checkState' });
      
      if (result && result.isActive) {
        this.showActiveState();
      }
    } catch (error) {
      console.log('Could not check state:', error);
    }
  }
  
  async activateBlackHole() {
    this.status.textContent = 'Initializing gravitational field...';
    this.blackHole.classList.add('active');
    this.activateBtn.classList.add('active');
    
    await this.sleep(1000);
    
    this.status.textContent = 'Sucking in photons...';
    await this.sleep(1000);
    
    this.status.textContent = 'Applying dark matter transformation...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'activateDarkMode' });
      
      await this.sleep(1500);
      
      this.showActiveState();
      this.status.textContent = 'Reality successfully consumed! 🌑';
      
    } catch (error) {
      this.status.textContent = 'Error: Black hole collapsed! Please reload the tab... 💥';
      this.blackHole.classList.remove('active');
      this.activateBtn.classList.remove('active');
    }
  }
  
  async deactivateBlackHole() {
    this.status.textContent = 'Reversing spacetime...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'deactivateDarkMode' });
      
      await this.sleep(1000);
      
      this.showInactiveState();
      this.status.textContent = 'Reality restored! ✨';
      
    } catch (error) {
      this.status.textContent = 'Error restoring reality! 🌪️';
    }
  }
  
  showActiveState() {
    this.isActive = true;
    this.activateBtn.style.display = 'none';
    this.deactivateBtn.style.display = 'inline-block';
    this.blackHole.classList.add('active');
  }
  
  showInactiveState() {
    this.isActive = false;
    this.activateBtn.style.display = 'inline-block';
    this.deactivateBtn.style.display = 'none';
    this.blackHole.classList.remove('active');
    this.activateBtn.classList.remove('active');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BlackHoleController();
});