const canvas = new OffscreenCanvas(128, 128);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, 128, 128);
ctx.font = 'bold 80px Arial';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('UD', 64, 64);

// Convert canvas to blob and create icon
canvas.convertToBlob().then(blob => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const iconData = reader.result;
    // Save icon data to extension storage
    chrome.storage.local.set({ iconData });
  };
  reader.readAsDataURL(blob);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "urbanDictLookup",
    title: "Look up '%s' on Urban Dictionary",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "urbanDictLookup") {
    lookupWord(info.selectionText, tab.id);
  }
});

async function lookupWord(word, tabId) {
  try {
    const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
    const data = await response.json();
    
    if (data.list && data.list.length > 0) {
      const definition = {
        word: word,
        meaning: data.list[0].definition,
        example: data.list[0].example
      };
      chrome.tabs.sendMessage(tabId, {
        type: "showDefinition",
        definition: definition
      });
    }
  } catch (error) {
    console.error("Error fetching definition:", error);
  }
}