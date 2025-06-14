document.addEventListener('DOMContentLoaded', function() {
  const focusToggle = document.getElementById('focusToggle');
  const statusText = document.getElementById('statusText');
  const newSiteInput = document.getElementById('newSite');
  const addSiteButton = document.getElementById('addSite');
  const blockedSitesList = document.getElementById('blockedSites');
  const timerDuration = document.getElementById('timerDuration');
  const timeRemaining = document.getElementById('timeRemaining');
  
  let intervalId = null;
  
  // Load saved state
  chrome.storage.local.get(['focusMode', 'blockedSites', 'endTime'], function(data) {
    // Set focus toggle
    if (data.focusMode) {
      focusToggle.checked = true;
      statusText.textContent = 'On';
      
      // If there's an active timer, display it
      if (data.endTime) {
        const currentTime = Date.now();
        const endTime = data.endTime;
        
        if (endTime > currentTime) {
          updateTimerDisplay(endTime - currentTime);
          startTimer(endTime);
        } else {
          // Timer has expired
          turnOffFocusMode();
        }
      }
    }
    
    // Load blocked sites
    if (data.blockedSites && data.blockedSites.length > 0) {
      const sites = data.blockedSites;
      sites.forEach(site => {
        addSiteToList(site);
      });
    } else {
      // Default blocked sites
      const defaultSites = [
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'reddit.com',
        'youtube.com'
      ];
      
      chrome.storage.local.set({ blockedSites: defaultSites });
      defaultSites.forEach(site => {
        addSiteToList(site);
      });
    }
  });
  
  // Toggle focus mode
  focusToggle.addEventListener('change', function() {
    if (this.checked) {
      statusText.textContent = 'On';
      
      // Get the selected duration
      const durationMinutes = parseInt(timerDuration.value);
      const endTime = Date.now() + (durationMinutes * 60 * 1000);
      
      chrome.storage.local.set({
        focusMode: true,
        endTime: endTime
      });
      
      // Start the timer
      startTimer(endTime);
      
      // Tell the background script to enable focus mode
      chrome.runtime.sendMessage({
        action: 'enableFocusMode'
      });
    } else {
      turnOffFocusMode();
    }
  });
  
  // Add new site to block
  addSiteButton.addEventListener('click', function() {
    const site = newSiteInput.value.trim();
    if (site) {
      // Add site to storage
      chrome.storage.local.get('blockedSites', function(data) {
        const sites = data.blockedSites || [];
        if (!sites.includes(site)) {
          sites.push(site);
          chrome.storage.local.set({ blockedSites: sites });
          addSiteToList(site);
          newSiteInput.value = '';
        }
      });
    }
  });
  
  // Enter key to add new site
  newSiteInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addSiteButton.click();
    }
  });
  
  // Helper function to add site to UI list
  function addSiteToList(site) {
    const li = document.createElement('li');
    li.textContent = site;
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-site');
    removeButton.addEventListener('click', function() {
      // Remove from storage
      chrome.storage.local.get('blockedSites', function(data) {
        const sites = data.blockedSites || [];
        const index = sites.indexOf(site);
        if (index !== -1) {
          sites.splice(index, 1);
          chrome.storage.local.set({ blockedSites: sites });
          li.remove();
        }
      });
    });
    
    li.appendChild(removeButton);
    blockedSitesList.appendChild(li);
  }
  
  // Start timer
  function startTimer(endTime) {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    intervalId = setInterval(function() {
      const currentTime = Date.now();
      const timeLeft = endTime - currentTime;
      
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        turnOffFocusMode();
      } else {
        updateTimerDisplay(timeLeft);
      }
    }, 1000);
  }
  
  // Update timer display
  function updateTimerDisplay(timeInMs) {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Turn off focus mode
  function turnOffFocusMode() {
    focusToggle.checked = false;
    statusText.textContent = 'Off';
    timeRemaining.textContent = '00:00';
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    chrome.storage.local.set({
      focusMode: false,
      endTime: null
    });
    
    // Tell the background script to disable focus mode
    chrome.runtime.sendMessage({
      action: 'disableFocusMode'
    });
  }
});
