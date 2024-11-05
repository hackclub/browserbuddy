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
        const apiUrl = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.list && data.list.length > 0) {
                    
                    chrome.storage.local.set({ lookupResult: data.list[0].definition }, () => {
                        chrome.windows.create({
                            url: "lookup.html",
                            type: "popup",
                            width: 600,
                            height: 400
                        });
                    });
                } else {
                    
                    chrome.storage.local.set({ lookupResult: "No definitions found." }, () => {
                        chrome.windows.create({
                            url: "lookup.html",
                            type: "popup",
                            width: 600,
                            height: 400
                        });
                    });
                }
            })
            .catch(error => {
                
                chrome.storage.local.set({ lookupResult: `Error fetching the slang meaning: ${error.message}` }, () => {
                    chrome.windows.create({
                        url: "lookup.html",
                        type: "popup",
                        width: 600,
                        height: 400
                    });
                });
            });
    }
});
