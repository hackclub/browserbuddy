// Listen for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Direct Search Extension Installed!');

  // Create a context menu item for selected text
  chrome.contextMenus.create({
    id: "search-on-youtube",  // Unique ID for the menu item
    title: "Search '%s' on YouTube",  // '%s' will be replaced with selected text
    contexts: ["selection"]  // This only shows when text is selected
  });
});

// When the context menu item is clicked, open YouTube search in a new tab
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-on-youtube") {
    const searchQuery = info.selectionText;
    if (searchQuery) {
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      chrome.tabs.create({ url: youtubeSearchUrl });
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'activate-spotlight') {
    chrome.action.openPopup(); // Open the popup when the shortcut is triggered
  }
});