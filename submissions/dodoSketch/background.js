chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'createFloatingWindow') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'createFloatingWindow' });
            }
        });
    }
});