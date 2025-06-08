function openGUI() {
  // Open the custom extension webpage in a new window
  chrome.windows.create({
    url: chrome.runtime.getURL("web/index.html"),
    type: "normal",
  });
}

function moveTabToNewWindow() {
  // Move the current tab to a new window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.windows.create({ tabId: tab.id });
  });
}

function duplicateTab() {
  // Duplicate the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.duplicate(tab.id);
  });
}

function duplicateTabToNewWindow() {
  // Duplicate the current tab into a new window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.duplicate(tab.id, (duplicatedTab) => {
      chrome.windows.create({ tabId: duplicatedTab.id });
    });
  });
}

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "open-gui":
      openGUI();
      break;

    case "move-tab-to-new-window":
      moveTabToNewWindow();
      break;

    case "duplicate-tab":
      duplicateTab();
      break;

    case "duplicate-tab-to-new-window":
      duplicateTabToNewWindow();
      break;

    default:
      console.error('Tabflow: "', message.action, '" command not implemented.');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "open-gui":
      openGUI();
      break;

    case "move-tab-to-new-window":
      moveTabToNewWindow();
      break;

    case "duplicate-tab":
      duplicateTab();
      break;

    case "duplicate-tab-to-new-window":
      duplicateTabToNewWindow();
      break;

    default:
      console.error('Tabflow: "', message.action, '" action not implemented.');
  }
});
