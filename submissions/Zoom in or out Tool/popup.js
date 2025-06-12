document.addEventListener('DOMContentLoaded', function() {
  const zoomInButton = document.getElementById('zoom-in');
  const zoomOutButton = document.getElementById('zoom-out');
  const resetButton = document.getElementById('reset-zoom');
  const fitWidthButton = document.getElementById('fit-width');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  const rememberZoomCheckbox = document.getElementById('remember-zoom');
  
  let currentZoom = 100;
  let rememberZoom = false;
  
  // Load saved settings
  chrome.storage.sync.get(['rememberZoom'], function(result) {
    rememberZoom = result.rememberZoom || false;
    rememberZoomCheckbox.checked = rememberZoom;
  });
  
  // Get current tab's zoom level
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const tabId = tabs[0].id;
      const url = new URL(tabs[0].url).hostname;
      
      if (rememberZoom) {
        chrome.storage.sync.get([url], function(result) {
          if (result[url]) {
            currentZoom = result[url];
            zoomLevelDisplay.textContent = `${currentZoom}%`;
          }
        });
      }
      
      // Send message to content script to get current zoom
      chrome.tabs.sendMessage(tabId, {action: "getZoom"}, function(response) {
        if (response && response.zoom) {
          currentZoom = response.zoom;
          zoomLevelDisplay.textContent = `${currentZoom}%`;
        }
      });
    }
  });
  
  // Zoom in
  zoomInButton.addEventListener('click', function() {
    changeZoom(10);
  });
  
  // Zoom out
  zoomOutButton.addEventListener('click', function() {
    changeZoom(-10);
  });
  
  // Reset zoom
  resetButton.addEventListener('click', function() {
    setZoom(100);
  });
  
  // Fit width
  fitWidthButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "fitWidth"});
      }
    });
  });
  
  // Remember zoom checkbox
  rememberZoomCheckbox.addEventListener('change', function() {
    rememberZoom = this.checked;
    chrome.storage.sync.set({rememberZoom: rememberZoom});
  });
  
  // Change zoom by a relative amount
  function changeZoom(amount) {
    currentZoom += amount;
    currentZoom = Math.max(25, Math.min(400, currentZoom)); // Limit between 25% and 400%
    setZoom(currentZoom);
  }
  
  // Set zoom to a specific level
  function setZoom(level) {
    currentZoom = level;
    zoomLevelDisplay.textContent = `${currentZoom}%`;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        const url = new URL(tabs[0].url).hostname;
        
        chrome.tabs.sendMessage(tabId, {action: "setZoom", zoom: currentZoom});
        
        if (rememberZoom) {
          let data = {};
          data[url] = currentZoom;
          chrome.storage.sync.set(data);
        }
      }
    });
  }
});
