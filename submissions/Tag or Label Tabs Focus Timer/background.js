// Default blocked sites
const DEFAULT_BLOCKED_SITES = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com',
  'youtube.com'
];

// Initialize storage
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get('blockedSites', function(data) {
    if (!data.blockedSites) {
      chrome.storage.local.set({ 
        blockedSites: DEFAULT_BLOCKED_SITES,
        focusMode: false,
        endTime: null
      });
    }
  });
});

// Listen for changes to the focus mode
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'enableFocusMode') {
    // Check if any currently open tabs should be blocked
    checkOpenTabs();
  } else if (request.action === 'disableFocusMode') {
    // No action needed, navigation will be allowed again
  }
});

// Listen for tab navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async function(details) {
  // Only handle main frame navigation (not iframes)
  if (details.frameId !== 0) return;
  
  const isActive = await isFocusModeActive();
  if (!isActive) return;
  
  const isBlocked = await isBlockedURL(details.url);
  if (isBlocked) {
    // Redirect to a blocked page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html')
    });
  }
});

// Check if URL is blocked
function isBlockedURL(url) {
  return new Promise((resolve) => {
    if (!url || url.startsWith('chrome://') || url.includes(chrome.runtime.id)) {
      resolve(false);
      return;
    }
    
    chrome.storage.local.get(['focusMode', 'blockedSites'], function(data) {
      if (!data.focusMode) {
        resolve(false);
        return;
      }
      
      const blockedSites = data.blockedSites || [];
      
      try {
        const hostname = new URL(url).hostname;
        
        // Check if the hostname matches any blocked site
        for (const site of blockedSites) {
          if (hostname === site || hostname.endsWith('.' + site)) {
            resolve(true);
            return;
          }
        }
      } catch (e) {
        console.error('Invalid URL:', url);
      }
      
      resolve(false);
    });
  });
}

// Check if focus mode is active
function isFocusModeActive() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['focusMode', 'endTime'], function(data) {
      if (!data.focusMode) {
        resolve(false);
        return;
      }
      
      // Check if timer has expired
      if (data.endTime) {
        const currentTime = Date.now();
        if (currentTime > data.endTime) {
          // Timer expired, turn off focus mode
          chrome.storage.local.set({
            focusMode: false,
            endTime: null
          });
          resolve(false);
          return;
        }
      }
      
      resolve(true);
    });
  });
}

// Check open tabs and block if necessary
async function checkOpenTabs() {
  const isActive = await isFocusModeActive();
  if (!isActive) return;
  
  const tabs = await chrome.tabs.query({});
  
  for (const tab of tabs) {
    if (tab.url) {
      const isBlocked = await isBlockedURL(tab.url);
      if (isBlocked) {
        chrome.tabs.update(tab.id, {
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    }
  }
}
