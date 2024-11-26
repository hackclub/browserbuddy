chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ strength: 0 }, () => {
      console.log("Default filter strength set to 0%.");
    });
  });
