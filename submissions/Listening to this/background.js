chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ listenedItems: [] });
});

function addItem(item) {
  chrome.storage.sync.get(['listenedItems'], (result) => {
    const items = result.listenedItems || [];
    items.push(item);
    chrome.storage.sync.set({ listenedItems: items });
  });
}

function removeItem(index) {
  chrome.storage.sync.get(['listenedItems'], (result) => {
    const items = result.listenedItems || [];
    items.splice(index, 1);
    chrome.storage.sync.set({ listenedItems: items });
  });
}

function getListenedItems(callback) {
  chrome.storage.sync.get(['listenedItems'], (result) => {
    callback(result.listenedItems || []);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addItem') {
    addItem(request.item);
  } else if (request.action === 'removeItem') {
    removeItem(request.index);
  } else if (request.action === 'getListenedItems') {
    getListenedItems(sendResponse);
    return true; // Keep the message channel open for sendResponse
  }
});
