let currentMode = 'work'; // Default mode
let sessionStartTime = Date.now();
let analytics = {
  work: {
    totalTime: 0,
    sessions: 0,
    topSites: {}
  },
  play: {
    totalTime: 0,
    sessions: 0,
    topSites: {}
  }
};

// Load saved state
chrome.storage.local.get(['mode', 'analytics', 'sessionStartTime'], (result) => {
  if (result.mode) currentMode = result.mode;
  if (result.analytics) analytics = result.analytics;
  if (result.sessionStartTime) sessionStartTime = result.sessionStartTime;
  else sessionStartTime = Date.now();
});

// Update analytics every minute
chrome.alarms.create('updateAnalytics', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateAnalytics') {
    updateAnalytics();
  }
});

// Toggle mode
function toggleMode() {
  // Update analytics for the current session before switching
  updateAnalytics();
  
  // Switch mode
  currentMode = currentMode === 'work' ? 'play' : 'work';
  
  // Reset session start time
  sessionStartTime = Date.now();
  
  // Increment session count
  analytics[currentMode].sessions++;
  
  // Save state
  chrome.storage.local.set({
    mode: currentMode,
    analytics: analytics,
    sessionStartTime: sessionStartTime
  });
  
  return currentMode;
}

// Update analytics
function updateAnalytics() {
  const now = Date.now();
  const sessionDuration = now - sessionStartTime;
  
  // Add time to total
  analytics[currentMode].totalTime += sessionDuration;
  
  // Track current site
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      
      if (!analytics[currentMode].topSites[domain]) {
        analytics[currentMode].topSites[domain] = 0;
      }
      
      analytics[currentMode].topSites[domain] += sessionDuration;
    }
    
    // Save updated analytics
    chrome.storage.local.set({
      analytics: analytics,
      sessionStartTime: now
    });
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMode') {
    sendResponse({ mode: currentMode });
  } else if (request.action === 'toggleMode') {
    const newMode = toggleMode();
    sendResponse({ mode: newMode });
  } else if (request.action === 'getAnalytics') {
    // Update analytics before sending
    updateAnalytics();
    sendResponse({ analytics: analytics });
  }
  return true;
});
