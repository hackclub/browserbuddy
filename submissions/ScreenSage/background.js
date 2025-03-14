let activeTab = { url: null, startTime: null };
let isChromeActive = true; 

function saveTime() {
    if (activeTab.url) {
        const timeSpent = Date.now() - activeTab.startTime;
        updateTime(activeTab.url, timeSpent);
    }
}

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        saveTime();
        activeTab = { url: null, startTime: null };
        saveActiveTab();
    }
});

chrome.storage.local.get('activeTab', (result) => {
    if (result.activeTab) {
        activeTab = result.activeTab;
        activeTab.startTime = parseInt(activeTab.startTime, 10);
        saveActiveTab();
    }
});

function saveActiveTab() {
    chrome.storage.local.set({ activeTab }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving active tab:', chrome.runtime.lastError);
        }
    });
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    saveTime();

    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith('http')) {
        activeTab = { url: new URL(tab.url).hostname, startTime: Date.now() };
    } else {
        activeTab = { url: null, startTime: null };
    }
    saveActiveTab();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && tab.url.startsWith('http')) {
        saveTime();
        activeTab = { url: new URL(tab.url).hostname, startTime: Date.now() };
        saveActiveTab();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getActiveTab') {
        if (activeTab.url) {
            const timeSpent = Math.floor((Date.now() - activeTab.startTime) / 1000); // Convert to seconds
            sendResponse({ url: activeTab.url, timeSpent });
        } else {
            sendResponse({ url: null, timeSpent: 0 });
        }
        return true; // Indicate that we will send a response asynchronously
    }
});

chrome.tabs.onRemoved.addListener(() => {
    saveTime();
    activeTab = { url: null, startTime: null };
    saveActiveTab();
});

function updateTime(url, timeSpent) {
    if (timeSpent < 1000) return;

    const today = new Date().toISOString().split('T')[0];
    const weekNumber = getWeekNumber(new Date());
    const weeklyKey = `week-${weekNumber}`;

    chrome.storage.local.get([today, weeklyKey], (result) => {
        // Update daily data
        const dailyData = result[today] || {};
        dailyData[url] = (dailyData[url] || 0) + timeSpent;
        chrome.storage.local.set({ [today]: dailyData });

        // Update weekly data
        const weeklyData = result[weeklyKey] || {};
        weeklyData[url] = (weeklyData[url] || 0) + timeSpent;
        chrome.storage.local.set({ [weeklyKey]: weeklyData });
    });
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}


