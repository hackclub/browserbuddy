chrome.commands.onCommand.addListener((command) => {
  if (command === "startTyping") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      }, () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startTyping" });
      });
    });
  } else if (command === "stopTyping") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopTyping" });
    });
  }
});
