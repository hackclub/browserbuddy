chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "runScript") {
    console.log("Content script triggered");
    // Your content script logic here
    sendResponse({ status: "success" });
  }
});