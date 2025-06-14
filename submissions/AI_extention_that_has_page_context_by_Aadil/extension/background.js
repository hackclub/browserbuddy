// Background script for handling extension-wide events
chrome.runtime.onInstalled.addListener(() => {
  console.log('Browser Buddy Context extension installed');
});

// You could add automatic content sending functionality here if needed
