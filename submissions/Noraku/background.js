// ✅ Ensure Offscreen Document Exists
async function ensureOffscreen() {
    const hasDocument = await chrome.offscreen.hasDocument();

    if (!hasDocument) {
        try {
            await chrome.offscreen.createDocument({
                url: "offscreen.html",
                reasons: ["AUDIO_PLAYBACK"],
                justification: "Play sound effects in the background."
            });
        } catch (err) {
        }
    }
}

// ✅ Function to Play Sound with Volume Control
async function playSound(action) {
    await ensureOffscreen(); 

    chrome.storage.local.get(["volumes"], (data) => {
        const volumes = data.volumes || {};
        const volume = volumes[action] !== undefined ? volumes[action] / 100 : 0.5; 

        chrome.runtime.sendMessage({
            action: "playSoundOffscreen",
            sound: action,
            volume: volume
        });
    });
}

// ✅ Handle Tab Open/Close Events
chrome.tabs.onCreated.addListener(() => playSound("tab_open"));
chrome.tabs.onRemoved.addListener(() => playSound("tab_close"));

// ✅ Handle Tab Dragging Events
chrome.tabs.onMoved.addListener(() => playSound("tab_dragging"));

// ✅ Handle Download Start/Complete Events
chrome.downloads.onCreated.addListener(() => playSound("download_start"));
chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state?.current === "complete") playSound("download_complete");
    if (delta.state?.current === "interrupted") playSound("download_failed");
});

// ✅ Handle Bookmark Events
chrome.bookmarks.onCreated.addListener(() => playSound("bookmark_added"));

// ✅ Handle Tab Mute/Unmute Events
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.mutedInfo) {
        const soundName = changeInfo.mutedInfo.muted ? "tab_muted" : "tab_unmuted";
        playSound(soundName);
    }
});

// ✅ Inject `content.js` into all active tabs on install & startup
chrome.runtime.onInstalled.addListener(() => injectContentScripts());
chrome.runtime.onStartup.addListener(() => injectContentScripts());

// ✅ Function to Inject `content.js`
function injectContentScripts() {
    chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
        for (let tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            })
        }
    });
}

// ✅ Inject `content.js` when YouTube pages load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        })
    }
});

// ✅ Listen for Messages from Popup & Forward to Offscreen
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "updateVolume") {
        chrome.storage.local.set({ volumes: message.volumes }, () => {
            console.log("🔊 Updated volumes:", message.volumes);
        });
    }

    if (message.action === "playSound") {
        await playSound(message.sound); 
    }
});
