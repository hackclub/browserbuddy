// Keep track of our lock tab
let lockTabId = null;

// Use the appropriate API namespace (browser for Firefox, chrome for Chrome)
const api = typeof browser !== 'undefined' ? browser : chrome;

// Check lock status on startup
api.runtime.onStartup.addListener(checkLockStatus);
api.runtime.onInstalled.addListener(checkLockStatus);

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

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  // Firefox uses about:newtab instead of chrome://newtab
  return tab.pendingUrl === 'about:newtab' || 
         tab.url === 'about:newtab' || 
         tab.pendingUrl === 'chrome://newtab/' || 
         tab.url === 'chrome://newtab/';
}

async function safeRemoveTab(tabId) {
  try {
    // Check if tab still exists before removing
    const tab = await api.tabs.get(tabId).catch(() => null);
    if (!tab) return;

    // Don't remove if it's our lock tab
    if (tab.id === lockTabId) return;

    // If it's a new tab page, update it instead of removing
    if (await isNewTabPage(tab)) {
      await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
      lockTabId = tab.id;
    } else {
      // Instead of removing, update to lock page
      await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
    }
  } catch (error) {
    // Tab might not exist anymore, which is fine
    console.log('Tab update failed:', error);
  }
}

// Handle tab creation attempts
api.tabs.onCreated.addListener(async (tab) => {
  try {
    if (await isLocked()) {
      // Instead of removing, update to lock page
      await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
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
      if (details.url !== api.runtime.getURL('lock.html')) {
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
      if (changeInfo.url && changeInfo.url !== api.runtime.getURL('lock.html')) {
        // Force the tab back to our lock page
        await api.tabs.update(tabId, { url: api.runtime.getURL('lock.html') }).catch(() => {});
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
        url: api.runtime.getURL('lock.html'),
        pinned: true
      }).catch(() => null);
      
      if (lockTab) {
        lockTabId = lockTab.id;
      }

      // Then handle any other tabs
      for (const tab of tabs) {
        if (tab.id !== lockTabId) {
          await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
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
          url: api.runtime.getURL('lock.html'),
          pinned: true
        }).catch(() => null);
        
        if (lockTab) {
          lockTabId = lockTab.id;
        }
      }

      // Then handle other tabs
      for (const tab of tabs) {
        if (tab.id !== lockTabId) {
          await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error('Error handling window focus:', error);
  }
});

async function ensureWindow() {
  try {
    // Get the current window
    const currentWindow = await api.windows.getCurrent();
    return currentWindow;
  } catch (error) {
    console.error('Error getting current window:', error);
    throw error;
  }
}

async function initiateLock(isStartup) {
  try {
    // Ensure we have a window
    await ensureWindow();

    // Create the lock screen tab first
    const lockTab = await api.tabs.create({
      url: api.runtime.getURL('lock.html'),
      pinned: true
    }).catch(() => null);
    
    if (!lockTab) {
      throw new Error('Failed to create lock tab');
    }
    
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
        await api.tabs.update(tab.id, { url: api.runtime.getURL('lock.html') }).catch(() => {});
      }
    }

    // Focus the lock tab window
    const lockTabInfo = await api.tabs.get(lockTabId).catch(() => null);
    if (lockTabInfo) {
      await api.windows.update(lockTabInfo.windowId, { focused: true }).catch(() => {});
    }
  } catch (error) {
    console.error('Error initiating lock:', error);
    // Reset lockTabId if something went wrong
    lockTabId = null;
  }
}

async function endLock() {
  try {
    if (lockTabId) {
      await api.tabs.remove(lockTabId).catch(() => {});
      lockTabId = null;
    }
    await api.storage.local.remove(['lockEndTime']);
  } catch (error) {
    console.error('Error ending lock:', error);
  }
} 