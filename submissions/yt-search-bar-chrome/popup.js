const searchUrls = {
  youtube: "https://www.youtube.com/results?search_query=",
  github: "https://github.com/search?q=",
  reddit: "https://www.reddit.com/search/?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
};

const siteLogos = {
  youtube:
    "/icons/logo/youtube.png",
  github:
    "/icons/logo/github.png",
  reddit:
    "/icons/logo/reddit.png",
  duckduckgo:
    "/icons/logo/duckduckgo.png",
};

let currentSite = "youtube"; // Default to YouTube

// Request the current site from the background script
chrome.runtime.sendMessage({ type: "getSite" }, (response) => {
  if (response?.site) {
    currentSite = response.site;
    document.getElementById(
      "search-input"
    ).placeholder = `Search on ${currentSite}`;

    if (currentSite && siteLogos[currentSite]) {
      document.getElementById("site-logo").src = siteLogos[currentSite];
    }
  }
});

// Handle Enter key press
document.getElementById("search-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const query = event.target.value.trim();
    if (query) {
      const searchUrl = searchUrls[currentSite] + encodeURIComponent(query);
      chrome.tabs.create({ url: searchUrl });
      window.close();
    }
  }
});
