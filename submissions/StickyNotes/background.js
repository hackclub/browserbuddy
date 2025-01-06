// Polyfill for Firefox compatibility
if (typeof browser === "undefined") {
    var browser = chrome;
}

// Handle installation event
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        browser.tabs.create({ url: "onboarding.html" });
    }
});
