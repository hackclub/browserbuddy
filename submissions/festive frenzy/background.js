chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'enable' || message.action === 'disable') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found!");
        sendResponse({ success: false, error: "No active tab found" });
        return;
      }

      console.log("Sending message to tab:", tabs[0].id);

      chrome.tabs.sendMessage(tabs[0].id, { action: message.action }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Content script error:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log("Content script response:", response);
          sendResponse({ success: true, response });
        }
      });
    });

    return true;
  }
});