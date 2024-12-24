browser.action.onClicked.addListener((tab) => {
    browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
    });
});

browser.runtime.connect().onDisconnect.addListener(() => {
    console.log("Disconnected");
});