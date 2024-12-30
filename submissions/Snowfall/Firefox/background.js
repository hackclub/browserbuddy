chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ christmasify: false });
});
  
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.sync.get(['christmasify'], ({ christmasify }) => {
            if (christmasify) {
                chrome.tabs.sendMessage(tabId, { action: 'applyChristmasify' });
            }
        });
    }
});
  
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleChristmasify') {
        chrome.storage.sync.get(['christmasify'], ({ christmasify }) => {
            const newState = !christmasify;
            chrome.storage.sync.set({ christmasify: newState });
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, {
                    action: newState ? 'applyChristmasify' : 'removeChristmasify',
                    });
                });
            });
            sendResponse({ state: newState });
        });
        return true;
    }
});
  

// let audio;

// // Initialize audio when music is toggled
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log('Message received:', message.action);

//     if (message.action === 'playMusic') {
//         if (!audio) {
//             audio = new Audio(chrome.runtime.getURL('music/traditional.mp3'));
//             audio.loop = true;
//         }
//         audio
//             .play()
//             .then(() => sendResponse({ status: 'playing' }))
//             .catch(err => console.error('Failed to play music:', err));
//         return true; // Required to keep sendResponse available for async actions.
//     } else if (message.action === 'stopMusic') {
//         if (audio) {
//             audio.pause();
//             audio.currentTime = 0;
//         }
//         sendResponse({ status: 'stopped' });
//     }
// });