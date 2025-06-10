let openTabs = new Map();
let duplicateCount = 0;

function updateBadge() {
  chrome.action.setBadgeText({ text: duplicateCount > 0 ? duplicateCount.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
}

function countDuplicates() {
  const urlCounts = new Map();
  for (const url of openTabs.values()) {
    urlCounts.set(url, (urlCounts.get(url) || 0) + 1);
  }
  
  duplicateCount = Array.from(urlCounts.values())
    .reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  
  updateBadge();
}

function isDuplicate(url, tabId) {
  for (let [id, tabUrl] of openTabs.entries()) {
    if (tabUrl === url && id !== tabId) {
      return id;
    }
  }
  return null;
}

let settings = { autoClose: false };
chrome.storage.local.get(['settings'], (result) => {
    settings = result.settings || settings;
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
        settings = changes.settings.newValue;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const duplicateTabId = isDuplicate(changeInfo.url, tabId);

    if (duplicateTabId !== null) {
      if (settings.autoClose) {
        chrome.tabs.remove(tabId);
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "Duplicate Tab Detected",
          message: `A duplicate tab for "${tab.title}" was found.`,
          buttons: [{ title: "Close Duplicate" }, { title: "Ignore" }]
        });

        chrome.notifications.onButtonClicked.addListener((notifId, buttonIndex) => {
          if (buttonIndex === 0) {
            chrome.tabs.remove(tabId);
          }
          chrome.notifications.clear(notifId);
        });
      }
    }

    openTabs.set(tabId, changeInfo.url);
    countDuplicates();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  openTabs.delete(tabId);
  countDuplicates();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "close_all_duplicates") {
    chrome.tabs.query({}, (tabs) => {
      const seen = new Map();
      const toClose = [];
      
      tabs.forEach(tab => {
        if (seen.has(tab.url)) {
          toClose.push(tab.id);
        } else {
          seen.set(tab.url, tab.id);
        }
      });

      if (toClose.length > 0) {
        chrome.tabs.remove(toClose);
      }
    });
  }
});
