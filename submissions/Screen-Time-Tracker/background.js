let currentUrl = '';
let startTime = null;
let todayData = {};
let isTracking = false;

chrome.runtime.onInstalled.addListener(() => {
  const today = new Date().toLocaleDateString();
  chrome.storage.local.get([today], (result) => {
    todayData = result[today] || {};
  });
  
  chrome.alarms.create('saveData', { periodInMinutes: 1 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateCurrentTab(tab);
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, updateCurrentTab);
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    saveCurrentSession();
    isTracking = false;
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs.length > 0) {
        updateCurrentTab(tabs[0]);
      }
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveData') {
    saveCurrentSession();
    saveTodayData();
  }
});

function updateCurrentTab(tab) {
  if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
    return;
  }
  
  saveCurrentSession();
  
  currentUrl = new URL(tab.url).hostname;
  startTime = Date.now();
  isTracking = true;
}

function saveCurrentSession() {
  if (!isTracking || !currentUrl || !startTime) {
    return;
  }
  
  const now = Date.now();
  const duration = now - startTime;
  
  if (duration > 1000) {
    if (!todayData[currentUrl]) {
      todayData[currentUrl] = 0;
    }
    todayData[currentUrl] += duration;
  }
  
  startTime = now;
}

function saveTodayData() {
  const today = new Date().toLocaleDateString();
  chrome.storage.local.set({ [today]: todayData });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    saveCurrentSession();
    
    const today = new Date().toLocaleDateString();
    chrome.storage.local.get([today], (result) => {
      sendResponse({ todayData: result[today] || {} });
    });
    return true;
  } else if (request.action === 'getHistory') {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());
    }
    
    chrome.storage.local.get(dates, (result) => {
      sendResponse({ historyData: result });
    });
    return true;
  }
});
