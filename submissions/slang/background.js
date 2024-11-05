chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "lookupSlang",
        title: "Look Up Slang: '%s'",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lookupSlang" && info.selectionText) {
        const word = info.selectionText.trim();
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    
                    chrome.storage.local.set({ lookupResult: data }, () => {
                        
                        chrome.windows.create({
                            url: "lookup.html",
                            type: "popup",
                            width: 600,
                            height: 400
                        });
                    });
                } else {
                    console.error("No definitions found.");
                }
            })
            .catch(error => {
                console.error("Error fetching the slang meaning:", error.message);
            });
    }
});
