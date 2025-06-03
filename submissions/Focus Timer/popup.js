document.addEventListener('DOMContentLoaded', function() {
  const toggleFocusButton = document.getElementById('toggleFocus');
  const newSiteInput = document.getElementById('newSite');
  const addSiteButton = document.getElementById('addSite');
  const siteListElement = document.getElementById('siteList');
  const timerInput = document.getElementById('timer');
  const timeRemainingElement = document.getElementById('timeRemaining');

  let focusMode = false;
  let blockedSites = [];
  let timerEnd = 0;
  let countdownInterval;

  // Load saved state
  chrome.storage.local.get(['focusMode', 'blockedSites', 'timerEnd'], function(result) {
    if (result.focusMode) {
      focusMode = result.focusMode;
      toggleFocusButton.textContent = 'Disable Focus Mode';
      toggleFocusButton.classList.add('active');
    }
    
    if (result.blockedSites) {
      blockedSites = result.blockedSites;
      renderSiteList();
    }
    
    if (result.timerEnd && result.timerEnd > Date.now()) {
      timerEnd = result.timerEnd;
      startCountdown();
    }
  });

  // Toggle focus mode
  toggleFocusButton.addEventListener('click', function() {
    focusMode = !focusMode;
    
    if (focusMode) {
      toggleFocusButton.textContent = 'Disable Focus Mode';
      toggleFocusButton.classList.add('active');
      
      // Set timer if focus mode is enabled
      const minutes = parseInt(timerInput.value) || 25;
      timerEnd = Date.now() + minutes * 60 * 1000;
      
      chrome.storage.local.set({ 
        focusMode: true,
        timerEnd: timerEnd
      });
      
      startCountdown();
    } else {
      toggleFocusButton.textContent = 'Enable Focus Mode';
      toggleFocusButton.classList.remove('active');
      chrome.storage.local.set({ focusMode: false });
      clearInterval(countdownInterval);
      timeRemainingElement.textContent = '';
    }
    
    chrome.runtime.sendMessage({ action: 'toggleFocusMode', focusMode: focusMode });
  });

  // Add new site to block
  addSiteButton.addEventListener('click', function() {
    const site = newSiteInput.value.trim().toLowerCase();
    if (site && !blockedSites.includes(site)) {
      blockedSites.push(site);
      chrome.storage.local.set({ blockedSites: blockedSites });
      newSiteInput.value = '';
      renderSiteList();
    }
  });

  // Render the list of blocked sites
  function renderSiteList() {
    siteListElement.innerHTML = '';
    blockedSites.forEach(function(site) {
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      
      const siteName = document.createElement('span');
      siteName.textContent = site;
      
      const removeButton = document.createElement('button');
      removeButton.textContent = '✕';
      removeButton.className = 'remove-site';
      removeButton.addEventListener('click', function() {
        blockedSites = blockedSites.filter(s => s !== site);
        chrome.storage.local.set({ blockedSites: blockedSites });
        renderSiteList();
      });
      
      siteItem.appendChild(siteName);
      siteItem.appendChild(removeButton);
      siteListElement.appendChild(siteItem);
    });
  }

  // Start countdown timer
  function startCountdown() {
    clearInterval(countdownInterval);
    
    function updateCountdown() {
      const now = Date.now();
      const timeLeft = timerEnd - now;
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        timeRemainingElement.textContent = '';
        focusMode = false;
        toggleFocusButton.textContent = 'Enable Focus Mode';
        toggleFocusButton.classList.remove('active');
        chrome.storage.local.set({ focusMode: false });
        chrome.runtime.sendMessage({ action: 'toggleFocusMode', focusMode: false });
        return;
      }
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      timeRemainingElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }
});
