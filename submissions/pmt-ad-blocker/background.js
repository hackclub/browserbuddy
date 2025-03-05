// Initialize default state if not already set
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["enabled", "blockCount"], (result) => {
      if (result.enabled === undefined) {
        chrome.storage.local.set({ enabled: true });
      }
      if (result.blockCount === undefined) {
        chrome.storage.local.set({ blockCount: 0 });
      }
    });
  });
  