let totalSeconds = 0;
let isActive = true;
let isEnabled = true;
let isPaused = false;
let targetSeconds = 7200; // Default 2 hours
let opacity = 70; // Default opacity
let uiMode = 'pixel'; // Changed default UI mode to 'pixel'
let colorStages = [
  { hue: 240, hex: '#0000FF', percent: 0 },    // Blue
  { hue: 120, hex: '#00FF00', percent: 33 },   // Green
  { hue: 270, hex: '#8A2BE2', percent: 66 },   // Purple
  { hue: 0, hex: '#FF0000', percent: 100 }     // Red
];

// Load settings AND timer state
chrome.runtime.onInstalled.addListener(() => {
  resetState();
  
  // Set correct popup based on UI mode
  updatePopupBasedOnMode();
});

chrome.runtime.onStartup.addListener(() => {
  resetState();
  loadState();
  
  // Set correct popup based on UI mode
  updatePopupBasedOnMode();
});

function resetState() {
  chrome.storage.local.set({ totalSeconds: 0 });
  chrome.storage.sync.set({ 
    enabled: true, 
    isPaused: false,
    targetTime: { hours: 2, minutes: 0 },
    opacity: 70,
    uiMode: 'pixel', // Changed default UI mode to 'pixel'
    colorStages: colorStages.map(({ hue, hex }) => ({ hue, hex }))
  });
  
  // Reset all internal states
  totalSeconds = 0;
  isActive = true;
  isEnabled = true;
  isPaused = false;
}

function loadState() {
  chrome.storage.local.get(['totalSeconds'], (result) => {
    totalSeconds = result.totalSeconds || 0;
    
    // Double-check enabled state when loading
    chrome.storage.sync.get(['enabled', 'isPaused', 'targetTime', 'opacity', 'uiMode'], (syncResult) => {
      isEnabled = syncResult.enabled !== false;
      isPaused = syncResult.isPaused || false;
      if (syncResult.targetTime) {
        targetSeconds = (syncResult.targetTime.hours * 3600) + (syncResult.targetTime.minutes * 60);
      }
      opacity = syncResult.opacity || 70;
      uiMode = syncResult.uiMode || 'pixel'; // Changed default fallback to 'pixel'
      
      // Force update all tabs with current state
      updateAllTabs();
    });
  });
}

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    if (!isEnabled) {
      isPaused = false;
      totalSeconds = 0; // Reset timer when disabled
      chrome.storage.sync.set({ isPaused: false });
      chrome.storage.local.set({ totalSeconds: 0 });
    }
    updateAllTabs();
  }
  if (changes.isPaused !== undefined) {
    isPaused = changes.isPaused.newValue;
    updateAllTabs();
  }
  if (changes.targetTime) {
    const newTime = changes.targetTime.newValue;
    targetSeconds = (newTime.hours * 3600) + (newTime.minutes * 60);
    updateAllTabs();
  }
  if (changes.opacity !== undefined) {
    opacity = changes.opacity.newValue;
    updateAllTabs();
  }
  if (changes.uiMode !== undefined) {
    uiMode = changes.uiMode.newValue;
    updatePopupBasedOnMode();
  }
  if (changes.colorStages) {
    const newColors = changes.colorStages.newValue;
    colorStages = [
      { ...newColors[0], percent: 0 },
      { ...newColors[1], percent: 33 },
      { ...newColors[2], percent: 66 },
      { ...newColors[3], percent: 100 }
    ];
    updateAllTabs();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'resetTimer':
      totalSeconds = 0;
      chrome.storage.local.set({ totalSeconds: 0 });
      updateAllTabs();
      break;
    case 'togglePause':
      isPaused = message.isPaused;
      updateAllTabs();
      break;
    case 'settingsUpdated':
      if (message.data?.enabled !== undefined) {
        isEnabled = message.data.enabled;
        if (!isEnabled) {
          isPaused = false;
          totalSeconds = 0; // Reset timer when disabled
          chrome.storage.sync.set({ isPaused: false });
          chrome.storage.local.set({ totalSeconds: 0 });
          forceDisableAllTabs(); // Force disable all tabs immediately
        }
        updateAllTabs();
      }
      break;
    case 'timeSettingsUpdated':
      const newTime = message.targetTime;
      targetSeconds = (newTime.hours * 3600) + (newTime.minutes * 60);
      updateAllTabs();
      break;
    case 'opacityUpdated':
      opacity = message.opacity;
      updateAllTabs();
      break;
    case 'colorStagesUpdated':
      const newColors = message.colorStages;
      colorStages = [
        { ...newColors[0], percent: 0 },
        { ...newColors[1], percent: 33 },
        { ...newColors[2], percent: 66 },
        { ...newColors[3], percent: 100 }
      ];
      updateAllTabs();
      break;
    case 'switchUI':
      uiMode = message.uiMode;
      chrome.storage.sync.set({ uiMode });
      updatePopupBasedOnMode();
      break;
    case 'getState':
      sendResponse({
        totalSeconds,
        isEnabled,
        isPaused,
        targetSeconds,
        opacity,
        uiMode,
        color: getColorFromTime(totalSeconds),
        colorStages
      });
      break;
  }
  if (message.type !== 'getState') {
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async responses
});

// Function to update the action popup based on UI mode
function updatePopupBasedOnMode() {
  const popupFile = uiMode === 'pixel' ? '/html/pixel-popup.html' : '/html/popup.html';
  if (chrome.action) { // For Manifest V3
    chrome.action.setPopup({ popup: popupFile });
  } else if (chrome.browserAction) { // For Manifest V2
    chrome.browserAction.setPopup({ popup: popupFile });
  }
}

// Color logic
function getColorFromTime(seconds) {
  if (seconds >= targetSeconds) {
    return colorStages[3].hex; // End color
  }

  const progress = (seconds / targetSeconds) * 100;
  
  // Find the current color stage
  let startStage = colorStages[0];
  let endStage = colorStages[1];
  
  for (let i = 0; i < colorStages.length - 1; i++) {
    if (progress >= colorStages[i].percent && progress <= colorStages[i + 1].percent) {
      startStage = colorStages[i];
      endStage = colorStages[i + 1];
      break;
    }
  }
  
  // Use hex colors directly instead of hue interpolation
  return startStage.hex;
}

// Force updates on tab load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith("http")) {
    // Double check state before updating tab
    chrome.storage.sync.get(['enabled'], (result) => {
      if (result.enabled !== isEnabled) {
        isEnabled = result.enabled !== false;
      }
      updateTab(tabId);
    });
  }
});

// Timer logic with improved state checks
chrome.alarms.create('timer', { periodInMinutes: 1/60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timer') {
    // Double check enabled state before updating
    chrome.storage.sync.get(['enabled', 'isPaused'], (result) => {
      isEnabled = result.enabled !== false;
      isPaused = result.isPaused || false;
      
      if (isEnabled && isActive && !isPaused) {
        totalSeconds++;
        chrome.storage.local.set({ totalSeconds });
        updateAllTabs();
      }
    });
  }
});

// Activity detection with improved state management
chrome.idle.onStateChanged.addListener((state) => {
  const wasActive = isActive;
  isActive = state === "active";
  
  if (!wasActive && isActive) {
    // Coming back from idle, verify state
    loadState();
  } else if (wasActive && !isActive) {
    // Going idle, save current state
    chrome.storage.local.set({ totalSeconds });
  }
});

// Helper function to update all tabs with error handling
function updateAllTabs() {
  if (!isEnabled) {
    forceDisableAllTabs();
    return;
  }

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url?.startsWith("http")) {
        updateTab(tab.id);
      }
    });
  });
}

// New function to explicitly disable timer in all tabs
function forceDisableAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url?.startsWith("http")) {
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'forceDisable',
            seconds: 0 // Explicitly send 0 seconds to prevent 00:00 display
          }).catch(() => {});
        } catch (error) {
          console.debug("Tab update error:", tab.id);
        }
      }
    });
  });
}

// Helper function to update a single tab with improved messaging
function updateTab(tabId) {
  const message = {
    type: 'update',
    color: getColorFromTime(totalSeconds),
    seconds: totalSeconds,
    enabled: isEnabled,
    opacity: opacity,
    isPaused: isPaused,
    targetSeconds: targetSeconds // Add target seconds for opacity calculation
  };
  
  try {
    chrome.tabs.sendMessage(tabId, message)
      .catch((error) => {
        // If message fails, only try to inject content script if scripting API is available
        if (chrome.scripting) {
          // Check if content script is already injected
          chrome.tabs.sendMessage(tabId, { type: 'ping' })
            .catch(() => {
              // Only inject if the content script isn't already there
              chrome.scripting.executeScript({
                target: { tabId },
                files: ['/js/content-script.js']
              }).then(() => {
                // After injection succeeds, send the message again with a delay
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabId, message).catch(() => {});
                }, 200);
              }).catch(err => {
                console.debug("Script injection failed:", err);
              });
            });
        }
      });
  } catch (error) {
    console.debug("Tab update error:", tabId);
  }
}