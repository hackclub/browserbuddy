// Initialize default cursor settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    cursorEnabled: true,
    cursorType: 'trail',
    cursorColor: '#FF5733',
    cursorSize: 10
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCursorSettings') {
    chrome.storage.local.get(
      ['cursorEnabled', 'cursorType', 'cursorColor', 'cursorSize'], 
      (result) => {
        sendResponse(result);
      }
    );
    return true; // Required for async sendResponse
  }
});

// When a tab is updated, inject the cursor effect
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.indexOf('chrome://') !== 0) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => console.error("Script injection failed:", err));
  }
});
