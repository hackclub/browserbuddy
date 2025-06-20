chrome.runtime.onInstalled.addListener(() => {
  console.log('🌌 Starlapse v2.0 - Interstellar Edition has been installed!');
  
  chrome.storage.local.set({
    firstLaunch: true,
    totalActivations: 0
  });
  
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Starlapse Interstellar Edition! 🌌',
      message: 'Experience reading like never before with cinematic galaxy themes!'
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🚀 Galactic portal accessed from:', tab.url);
  
  const data = await chrome.storage.local.get(['totalActivations']);
  await chrome.storage.local.set({ totalActivations: (data.totalActivations || 0) + 1 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('🔍 Scanning for cosmic compatibility:', tab.url);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cosmicTelemetry') {
    console.log('📊 Cosmic telemetry received:', request.data);
    sendResponse({ success: true });
  }
});

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('🔄 Cosmic update available! Enhanced galactic features incoming!');
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['totalLaunches']);
  await chrome.storage.local.set({ totalLaunches: (data.totalLaunches || 0) + 1 });
  console.log('🌟 Cosmic journey continues! Launch #' + ((data.totalLaunches || 0) + 1));
});
