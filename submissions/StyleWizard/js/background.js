chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "style",
    title: "Activate Styling",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "style") {
    styling = true;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["js/content.js"]
    });
  }
  
});
