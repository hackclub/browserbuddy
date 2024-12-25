const defaultSettings = {
    enableIconClick: true,
    enableHotkey: true,
    sciHubDomain: "https://www.sci-hub.wf/"
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set(defaultSettings);

    chrome.contextMenus.create({
        id: "open-in-scihub",
        title: "Open in Sci-Hub",
        contexts: ["link", "page", "selection"], 
    });

    
    chrome.contextMenus.create({
        id: "options",
        title: "Options",
        contexts: ["action"] 
    });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-in-scihub") {
        
        let urlToOpen = info.selectionText || info.linkUrl || tab.url;

        
        chrome.storage.sync.get(["sciHubDomain"], (settings) => {
            const sciHubUrl = settings.sciHubDomain + urlToOpen;
            chrome.tabs.create({ url: sciHubUrl });
        });
    }

    
    if (info.menuItemId === "options") {
        chrome.runtime.openOptionsPage();
    }
});


chrome.commands.onCommand.addListener((command) => {
    if (command === "open-in-scihub") {
        chrome.storage.sync.get(["enableHotkey", "sciHubDomain"], (settings) => {
            if (settings.enableHotkey) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0].url;
                    const sciHubUrl = settings.sciHubDomain + currentUrl;
                    chrome.tabs.create({ url: sciHubUrl });
                });
            }
        });
    }
});


chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(["enableIconClick", "sciHubDomain"], (settings) => {
        if (settings.enableIconClick) {
            const currentUrl = tab.url;
            const sciHubUrl = settings.sciHubDomain + currentUrl;
            chrome.tabs.create({ url: sciHubUrl });
        }
    });
});
