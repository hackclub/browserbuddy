const authorizeButton = document.getElementById('authorize');
authorizeButton?.addEventListener('click', async () => {
    await chrome.storage.local.set({ authorized: true });
    await chrome.tabs.create({ url: chrome.runtime.getURL("src/settings.html") });
    window.close();
});