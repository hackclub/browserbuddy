chrome.runtime.onInstalled.addListener(() => {
  console.log("MouseDrip is ready to make your cursor legendary! 🔥");
  
  // Set default settings
  chrome.storage.sync.set({
    defaultEmoji: "✨",
    trailSpeed: 650,
    customSites: {},
    isEnabled: true
  });
});

// Handle uninstall feedback
chrome.runtime.setUninstallURL("https://forms.gle/jLd4rBK5GJgCnYP46");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSettings") {
    // Send message to all tabs to update settings live
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          chrome.tabs.sendMessage(tab.id, { action: "refreshMouseDrip" });
        }
      });
    });
  }
});