const defaultSettings = {
    enableIconClick: true,
    enableHotkey: true,
    sciHubDomain: "https://www.sci-hub.wf/",
    arxivDomain: "https://arxiv.org/pdf/"
};


chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set(defaultSettings);

    chrome.contextMenus.create({
        id: "Open-in-Sci-Hub",
        title: "Open-in-Sci-Hub",
        contexts: ["page", "link", "selection"]
    });
});

function arxividentifier(urlToOpen) {
    const arxivMatch = urlToOpen.split("arxiv.org/abs/")[1];
    if (arxivMatch) {
        return "https://arxiv.org/pdf/" + arxivMatch;
    }
    return null;
}

function isArxivUrl(url) {
    return url.includes("arxiv.org");
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let urlToOpen = info.selectionText || info.linkUrl || tab.url;

    chrome.storage.sync.get(["sciHubDomain", "arxivDomain"], (settings) => {
        if (isArxivUrl(urlToOpen)) {
            const arxivUrl = arxividentifier(urlToOpen);
            if (arxivUrl) {
                const arxivResearchUrl = settings.arxivDomain + arxivUrl.split("https://arxiv.org/pdf/")[1];
                chrome.tabs.create({ url: arxivResearchUrl });
            }
        } else {
            const sciHubUrl = settings.sciHubDomain + urlToOpen;
            chrome.tabs.create({ url: sciHubUrl });
        }
    });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "open-in-scihub") {
        chrome.storage.sync.get(["enableHotkey", "sciHubDomain", "arxivDomain"], (settings) => {
            if (settings.enableHotkey) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0].url;

                    if (isArxivUrl(currentUrl)) {
                        const arxivUrl = arxividentifier(currentUrl);
                        if (arxivUrl) {
                            const arxivResearchUrl = settings.arxivDomain + arxivUrl.split("https://arxiv.org/pdf/")[1];
                            chrome.tabs.create({ url: arxivResearchUrl });
                        }
                    } else {
                        const sciHubUrl = settings.sciHubDomain + currentUrl;
                        chrome.tabs.create({ url: sciHubUrl });
                    }
                });
            }
        });
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(["enableIconClick", "sciHubDomain", "arxivDomain"], (settings) => {
        if (settings.enableIconClick) {
            const currentUrl = tab.url;

            if (isArxivUrl(currentUrl)) {
                const arxivUrl = arxividentifier(currentUrl);
                if (arxivUrl) {
                    const arxivResearchUrl = settings.arxivDomain + arxivUrl.split("https://arxiv.org/pdf/")[1];
                    chrome.tabs.create({ url: arxivResearchUrl });
                }
            } else {
                const sciHubUrl = settings.sciHubDomain + currentUrl;
                chrome.tabs.create({ url: sciHubUrl });
            }
        }
    });
});
