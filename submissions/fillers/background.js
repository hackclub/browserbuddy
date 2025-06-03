// Initialize extension when installed
chrome.runtime.onInstalled.addListener(function() {
  // Set default values
  chrome.storage.local.set({
    isActive: false,
    savedItems: [],
    currentItem: ''
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'toggleActive') {
    // When extension is toggled active/inactive, notify all tabs
    const isActive = message.isActive;
    
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleActive',
          isActive: isActive
        }).catch(function(error) {
          // Ignore errors from tabs where content script isn't loaded
          console.log('Could not send message to tab:', tab.id);
        });
      });
    });
  }
});

// Set up context menu item (optional enhancement)
chrome.contextMenus?.create({
  id: 'saveSelection',
  title: 'Save to Smart Form Filler',
  contexts: ['selection']
});

// Handle context menu clicks
chrome.contextMenus?.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'saveSelection' && info.selectionText) {
    // Save selected text
    chrome.storage.local.get(['savedItems'], function(result) {
      const savedItems = result.savedItems || [];
      savedItems.push(info.selectionText);
      
      chrome.storage.local.set({savedItems: savedItems}, function() {
        // Optionally notify user
        chrome.notifications?.create({
          type: 'basic',
          title: 'Smart Form Filler',
          message: 'Text saved: ' + info.selectionText.substring(0, 50) + (info.selectionText.length > 50 ? '...' : ''),
          iconUrl: 'icon.png'
        });
      });
    });
  }
});
