console.log("Background script running...");

let currentContext = null;

// Predefined groups and sites
const predefinedContexts = {
    "work": [
        "https://mail.google.com",
        "https://docs.google.com",
        "https://slack.com",
        "https://github.com",
        "https://calendar.google.com"
    ],
    "personal": [
        "https://www.youtube.com",
        "https://www.netflix.com",
        "https://reddit.com",
        "https://facebook.com",
        "https://twitter.com"
    ],
    "research": [
        "https://scholar.google.com",
        "https://www.wikipedia.org",
        "https://arxiv.org",
        "https://researchgate.net",
        "https://sciencedirect.com"
    ],
    "entertainment": [
        "https://www.spotify.com",
        "https://www.twitch.tv",
        "https://www.hulu.com",
        "https://disneyplus.com",
        "https://primevideo.com"
    ]
};

// Initialize groups and sites on extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Setting up predefined contexts...");

    // Set predefined contexts if not already set
    chrome.storage.local.get(null, (items) => {
        const existingKeys = Object.keys(items);
        for (let contextName in predefinedContexts) {
            if (!existingKeys.includes(contextName)) {
                chrome.storage.local.set({ [contextName]: predefinedContexts[contextName] }, () => {
                    console.log(`Context "${contextName}" initialized with URLs:`, predefinedContexts[contextName]);
                });
            }
        }
    });
});

// Listen for context switch messages and open the associated URLs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "switchContext") {
        currentContext = message.context;
        chrome.storage.local.get([currentContext], (result) => {
            const tabsToOpen = result[currentContext] || [];
            console.log("Switching context to:", currentContext, "Opening tabs:", tabsToOpen);
            chrome.windows.create({ url: tabsToOpen, focused: true });
            sendResponse({ success: true });
        });
        return true; // Keeps the message channel open for async response
    }
});
