// Keep track of our lock tab
let lockTabId = null;

// Use the appropriate API namespace (browser for Firefox, chrome for Chrome)
const api = typeof browser !== 'undefined' ? browser : chrome;

// Check lock status on startup
chrome.runtime.onStartup.addListener(checkLockStatus);
chrome.runtime.onInstalled.addListener(checkLockStatus);

async function isLocked() {
  const data = await api.storage.local.get(['lockEndTime']);
  const lockEndTime = data.lockEndTime;
  return lockEndTime && Date.now() < lockEndTime;
}

async function checkLockStatus() {
  try {
    const data = await api.storage.local.get(['lockEndTime']);
    const lockEndTime = data.lockEndTime;
    
    if (lockEndTime && Date.now() < lockEndTime) {
      // We're still in lock period, recreate the alarm
      await api.alarms.create('lockEnd', {
        when: lockEndTime
      });
      // Recreate the lock screen
      await initiateLock(true);
    } else if (lockEndTime) {
      // Lock period has expired, clean up
      await api.storage.local.remove(['lockEndTime']);
    }
  } catch (error) {
    console.error('Error checking lock status:', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startLock') {
    initiateLock(false);
  }
});

// Handle when lock expires
api.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'lockEnd') {
    endLock();
  }
});

async function isNewTabPage(tab) {
  return tab.pendingUrl === 'chrome://newtab/' || 
         tab.url === 'chrome://newtab/' || 
         tab.pendingUrl === 'edge://newtab/' || 
         tab.url === 'edge://newtab/';
}

async function safeRemoveTab(tabId) {
  try {
    // Check if tab still exists before removing
    const tab = await api.tabs.get(tabId);
    if (!tab) return;

    // Don't remove if it's our lock tab
    if (tab.id === lockTabId) return;

    // If it's a new tab page, update it instead of removing
    if (await isNewTabPage(tab)) {
      await api.tabs.update(tab.id, { url: 'lock.html' });
      lockTabId = tab.id;
    } else {
      await api.tabs.remove(tab.id);
    }
  } catch (error) {
    // Tab might not exist anymore, which is fine
    console.log('Tab removal failed, might already be gone:', error);
  }
}

// Handle tab creation attempts
api.tabs.onCreated.addListener(async (tab) => {
  try {
    if (await isLocked()) {
      // Check if it's a new tab page
      if (await isNewTabPage(tab)) {
        // Update the tab to show our lock page instead
        await api.tabs.update(tab.id, { url: 'lock.html' });
        // Set this as our lock tab
        lockTabId = tab.id;
      } else {
        // For non-NTP tabs, try to remove them
        await api.tabs.remove(tab.id);
      }
    }
  } catch (error) {
    console.error('Error handling new tab:', error);
  }
});

// Prevent URL changes when locked
api.webNavigation.onBeforeNavigate.addListener(async (details) => {
  try {
    if (await isLocked() && details.frameId === 0) {
      // Only allow navigation to our lock page
      if (details.url !== chrome.runtime.getURL('lock.html')) {
        return { cancel: true };
      }
    }
  } catch (error) {
    console.error('Error handling navigation:', error);
  }
});

// Catch and prevent URL changes through tab updates
api.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (await isLocked()) {
      // If URL is changing and it's not to our lock page
      if (changeInfo.url && changeInfo.url !== chrome.runtime.getURL('lock.html')) {
        // Force the tab back to our lock page
        await api.tabs.update(tabId, { url: 'lock.html' });
      }
    }
  } catch (error) {
    console.error('Error handling tab update:', error);
  }
});

// Handle window creation attempts
api.windows.onCreated.addListener(async (window) => {
  try {
    if (await isLocked()) {
      const tabs = await api.tabs.query({ windowId: window.id });
      
      // Create our lock tab first
      const lockTab = await api.tabs.create({
        windowId: window.id,
        url: 'lock.html',
        pinned: true
      });
      lockTabId = lockTab.id;

      // Then handle any other tabs
      for (const tab of tabs) {
        if (tab.id !== lockTabId) {
          await safeRemoveTab(tab.id);
        }
      }
    }
  } catch (error) {
    console.error('Error handling new window:', error);
  }
});

// Handle window focus changes
api.windows.onFocusChanged.addListener(async (windowId) => {
  try {
    if (await isLocked() && windowId !== -1) {
      const tabs = await api.tabs.query({ windowId });
      let hasLockTab = false;
      
      // First check if we have a lock tab
      for (const tab of tabs) {
        if (tab.id === lockTabId) {
          hasLockTab = true;
          break;
        }
      }

      // If no lock tab, create one first
      if (!hasLockTab) {
        const lockTab = await api.tabs.create({
          windowId,
          url: 'lock.html',
          pinned: true
        });
        lockTabId = lockTab.id;
      }

      // Then handle other tabs
      for (const tab of tabs) {
        if (tab.id !== lockTabId) {
          await safeRemoveTab(tab.id);
        }
      }
    }
  } catch (error) {
    console.error('Error handling window focus:', error);
  }
});

async function ensureWindow() {
  try {
    // Check for existing windows
    const windows = await api.windows.getAll();
    if (windows.length === 0) {
      // Create a new window if none exists
      await api.windows.create();
    }
    // Get the current window
    const currentWindow = await api.windows.getCurrent();
    return currentWindow;
  } catch (error) {
    console.error('Error ensuring window exists:', error);
    throw error;
  }
}

async function initiateLock(isStartup) {
  try {
    // Ensure we have a window
    await ensureWindow();

    // Create the lock screen tab first
    const lockTab = await api.tabs.create({
      url: 'lock.html',
      pinned: true
    });
    
    lockTabId = lockTab.id;

    // If it's startup, create a small delay to ensure the lock tab is properly loaded
    if (isStartup) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Get all tabs after creating the lock screen
    const tabs = await api.tabs.query({});
    
    // Handle each tab individually
    for (const tab of tabs) {
      if (tab.id !== lockTabId) {
        await safeRemoveTab(tab.id);
      }
    }

    // Focus the lock tab window
    const lockTabInfo = await api.tabs.get(lockTabId);
    if (lockTabInfo) {
      await api.windows.update(lockTabInfo.windowId, { focused: true });
    }
  } catch (error) {
    console.error('Error initiating lock:', error);
  }
}

async function endLock() {
  try {
    if (lockTabId) {
      await safeRemoveTab(lockTabId);
    }
    lockTabId = null;
    await api.storage.local.remove(['lockEndTime']);
  } catch (error) {
    console.error('Error ending lock:', error);
  }
} 