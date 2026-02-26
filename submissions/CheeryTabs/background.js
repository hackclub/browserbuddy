// Background script for Cherry Tabs extension

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('Cherry Tabs extension installed');
  
  // Initialize storage with empty favorites array if not already set
  chrome.storage.sync.get(['favorites'], function(result) {
    if (!result.favorites) {
      chrome.storage.sync.set({favorites: []});
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'quickSave') {
    // Quick save functionality from content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Get existing favorites from storage
      chrome.storage.sync.get(['favorites'], function(result) {
        let favorites = result.favorites || [];
        
        // Check if URL already exists in favorites
        const urlExists = favorites.some(favorite => favorite.url === currentTab.url);
        
        if (!urlExists) {
          // Add new favorite
          favorites.push({
            title: currentTab.title,
            url: currentTab.url,
            timestamp: Date.now()
          });
          
          // Save updated favorites list
          chrome.storage.sync.set({favorites: favorites}, function() {
            sendResponse({success: true, message: 'Page saved to favorites'});
          });
        } else {
          sendResponse({success: false, message: 'This website is already in your favorites!'});
        }
      });
    });
    
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
});
