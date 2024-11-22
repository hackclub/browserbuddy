chrome.runtime.onInstalled.addListener(function (object) {
    let internalUrl = chrome.runtime.getURL("views/onboarding.html");

    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: internalUrl });
    }
});