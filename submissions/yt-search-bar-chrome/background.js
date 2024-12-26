const searchUrls = {
  youtube: "https://www.youtube.com/results?search_query=",
  github: "https://github.com/search?q=",
  reddit: "https://www.reddit.com/search/?q=",
  duckduckgo: "https://duckduckgo.com/?q="
};

// Store the last selected site here
let currentSite = "youtube";

// Listen for keyboard shortcuts idk
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "search_youtube":
      currentSite = "youtube";
      break;
    case "search_github":
      currentSite = "github";
      break;
    case "search_reddit":
      currentSite = "reddit";
      break;
    case "search_duckduckgo":
      currentSite = "duckduckgo";
      break;
  }

  // Open the popup
  chrome.action.openPopup();
});

// Handle requests from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getSite") {
    sendResponse({ site: currentSite });
  }
});


// Create the context menu for selected text to search on YouTube
chrome.contextMenus.create({
  id: "search-on-youtube",  // Unique ID for the menu item
  title: "Search '%s' on YouTube",  // '%s' will be replaced with selected text
  contexts: ["selection"],  // This only shows when text is selected
});

// Handle the context menu item click to search selected text on YouTube
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-on-youtube") {
    const searchQuery = info.selectionText;  // Get the selected text
    if (searchQuery) {
      const youtubeSearchUrl = searchUrls.youtube + encodeURIComponent(searchQuery);  // Build the YouTube search URL
      chrome.tabs.create({ url: youtubeSearchUrl });  // Open the search URL in a new tab
    }
  }
});