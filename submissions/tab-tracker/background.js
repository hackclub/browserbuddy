let userId = null;

// Load userId from chrome storage when the background script starts
chrome.storage.local.get(['userId'], (result) => {
    if (result.userId) {
        userId = result.userId;
        startTrackingTabs();
    }
});

// Listener for the login event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'login') {
        userId = request.userId;

        // Store userId in chrome.storage
        chrome.storage.local.set({ userId: userId }, () => {
            console.log('User ID saved in background script.');
        });

        startTrackingTabs();
        sendResponse({ status: 'Tracking started' });
    }
});

// Function to start tracking tabs indefinitely
function startTrackingTabs() {
    setInterval(async () => {
        if (!userId) return; // Stop tracking if user is not logged in

        const tabs = await chrome.tabs.query({});
        tabs.forEach(async (tab) => {
            const tabVisited = tab.url; // URL of the visited tab
            await trackActivity(userId, tabVisited);
        });
    }, 10000); // Check every 10 seconds
}

// Function to log activity to your server
async function trackActivity(userId, tabVisited) {
    if (tabVisited) {
        await fetch('https://d1af270f-5b2a-4e81-97ef-1383b66ba676-00-1an6e8o4o3ogo.worf.replit.dev/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, tabVisited })
        });
    }
}

async function loadRules() {
    const response = await fetch(chrome.runtime.getURL('rules.json'));
    const rules = await response.json();

    // Remove existing rules before adding new ones
    const ruleIds = rules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: rules
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error loading rules:", chrome.runtime.lastError);
        } else {
            console.log("Rules loaded successfully");
        }
    });
}

// Call the function to load the rules
loadRules();
