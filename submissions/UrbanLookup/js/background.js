"use strict"; // perfect for ruining your day

const DEFAULT_SETTINGS = {
  darkMode: false,
  bubbleEnabled: true,
  cacheSize: 50,
};

const CONTEXT_MENU_ID = "lookupUrbanDictionary";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Look up "%s" on Urban Dictionary',
    contexts: ["selection"],
  });

  initializeStorage();
});

function initializeStorage() {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (result) => {
    const updates = {};
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      if (result[key] === undefined) {
        updates[key] = defaultValue;
      }
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates);
    }
  });

  chrome.storage.local.get(
    ["definitionCache", "cacheTimestamps"],
    (cacheData) => {
      const cacheUpdates = {};
      if (!cacheData.definitionCache) cacheUpdates.definitionCache = {};
      if (!cacheData.cacheTimestamps) cacheUpdates.cacheTimestamps = [];

      if (Object.keys(cacheUpdates).length > 0) {
        chrome.storage.local.set(cacheUpdates);
      }
    },
  );
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    const selectedText = info.selectionText;
    // please work I am literally sobbing right now
    const encodedTerm = encodeURIComponent(selectedText);
    chrome.tabs.create({
      url: `https://www.urbandictionary.com/define.php?term=${encodedTerm}`,
      active: true,
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    const relevantChanges = {};

    if (changes.darkMode) relevantChanges.darkMode = changes.darkMode.newValue;
    if (changes.bubbleEnabled)
      relevantChanges.bubbleEnabled = changes.bubbleEnabled.newValue;

    if (Object.keys(relevantChanges).length > 0) {
      broadcastSettingsToAllTabs(relevantChanges);
    }
  }
});

function broadcastSettingsToAllTabs(changes) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      try {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "settingsChanged",
            changes: changes,
          })
          .catch(() => {});
      } catch (e) {}
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) return false;

  switch (message.action) {
    case "getCachedDefinition":
      handleGetCachedDefinition(message, sendResponse);
      return true;

    case "cacheDefinition":
      handleCacheDefinition(message, sendResponse);
      return true;

    case "clearCache":
      handleClearCache(sendResponse);
      return true;

    case "getSettings":
      handleGetSettings(message, sendResponse);
      return true;

    case "checkContextValid":
      sendResponse({ valid: true });
      return true;

    default:
      return false;
  }
});

function handleGetCachedDefinition(message, sendResponse) {
  const termLower = message.term.toLowerCase();
  chrome.storage.local.get(["definitionCache"], (result) => {
    const definitionCache = result.definitionCache || {};
    sendResponse({ definitions: definitionCache[termLower] || null });
  });
}

function handleCacheDefinition(message, sendResponse) {
  const term = message.term.toLowerCase();
  chrome.storage.local.get(["definitionCache", "cacheTimestamps"], (result) => {
    const definitionCache = result.definitionCache || {};
    const cacheTimestamps = result.cacheTimestamps || [];

    definitionCache[term] = message.definitions;

    const existingIndex = cacheTimestamps.findIndex(
      (item) => item.term === term,
    );
    if (existingIndex !== -1) {
      cacheTimestamps.splice(existingIndex, 1);
    }

    cacheTimestamps.push({
      term: term,
      timestamp: Date.now(),
    });

    chrome.storage.sync.get(["cacheSize"], (settings) => {
      const cacheSize = settings.cacheSize || DEFAULT_SETTINGS.cacheSize;

      if (cacheTimestamps.length > cacheSize) {
        cacheTimestamps.sort((a, b) => a.timestamp - b.timestamp);

        const entriesToRemove = cacheTimestamps.length - cacheSize;
        const removedEntries = cacheTimestamps.splice(0, entriesToRemove);

        for (const entry of removedEntries) {
          delete definitionCache[entry.term];
        }
      }

      chrome.storage.local.set(
        {
          definitionCache,
          cacheTimestamps,
        },
        () => {
          sendResponse({ success: true });
        },
      );
    });
  });
}

function handleClearCache(sendResponse) {
  chrome.storage.local.set(
    {
      definitionCache: {},
      cacheTimestamps: [],
    },
    () => {
      sendResponse({ success: true });
    },
  );
}

function handleGetSettings(message, sendResponse) {
  chrome.storage.sync.get(message.keys || null, (settings) => {
    sendResponse(settings);
  });
}
