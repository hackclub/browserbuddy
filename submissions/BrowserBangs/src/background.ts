// Manually generated typings from https://duckduckgo.com/bang.js
type Bang = {
  c: string;
  d: string;
  r: number;
  s: string;
  sc: string;
  t: string;
  u: string;
};

// Fetch bangs from DuckDuckGo
let bangs: Bang[] = [];

fetchBangs();

async function fetchBangs() {
  try {
    console.log("Fetching bangs...");

    const response = await fetch("https://duckduckgo.com/bang.js");
    if (!response.ok) throw new Error(`An error occurred while fetching bangs`);

    const data = await response.json();
    bangs = data;

    chrome.storage.local.set({ bangs: JSON.stringify(bangs) });
  } catch (error) {
    console.error("Failed to fetch bangs:", error);
  }
}

// Support for omnibox using !
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const bang = text.trim();
  const bangsMatch = bangs.find((b) => b.t === bang);
  if (!bangsMatch) return;

  const url = bangsMatch.u.replace(/{{{s}}}/g, encodeURIComponent(bang));

  if (disposition === "newForegroundTab" || disposition === "newBackgroundTab")
    chrome.tabs.create({ url });
  else chrome.tabs.update({ url });
});

// Support for popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "refresh") return;

  fetchBangs().then(() => {
    sendResponse({ bangs });
  });
});
