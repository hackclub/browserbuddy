chrome.runtime.onInstalled.addListener(() => {
  console.log("Study Tracker Extension Installed!");
});

// Keep background script running even when popup is closed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "logStudyTime") {
    console.log(`Logging study time: ${message.time} seconds`);
    sendResponse({ status: "Time logged successfully!" });
  }
});
