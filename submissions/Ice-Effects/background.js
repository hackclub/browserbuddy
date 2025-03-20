// Background script for Ice Drop Effects extension

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get({
    enabled: true,
    interval: 3,
    size: 2,
    density: 3
  }, function(items) {
    // If settings don't exist yet, set defaults
    if (chrome.runtime.lastError || Object.keys(items).length === 0) {
      chrome.storage.sync.set({
        enabled: true,
        interval: 3,
        size: 2,
        density: 3
      });
    }
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Handle any background-level tasks here if needed
  if (message.action === 'getSettings') {
    chrome.storage.sync.get({
      enabled: true,
      interval: 3,
      size: 2,
      density: 3
    }, function(items) {
      sendResponse({ settings: items });
    });
    return true; // Required for async sendResponse
  }
});
