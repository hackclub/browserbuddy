chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addAnnotation",
    title: "Create new annotation",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addAnnotation" && info.selectionText && info.selectionText.trim().length > 0) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tab.id, {
        action: "addAnnotation",
        selectedText: info.selectionText
      });
    });
  }
});