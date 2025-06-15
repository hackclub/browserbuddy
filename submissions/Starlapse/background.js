chrome.runtime.onInstalled.addListener(() => {
  console.log('Starlapse extension installed! 🌌');
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('Black hole portal opened!');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated, checking for lingering dark matter...');
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'backgroundTask') {
    console.log('Background task received:', request);
    sendResponse({ success: true });
  }
});