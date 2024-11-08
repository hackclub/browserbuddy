const browserApi = chrome || browser;

browserApi.tabs.onCreated.addListener(updateTabCount);
browserApi.tabs.onRemoved.addListener(updateTabCount);


function updateTabCount() {
    browserApi.tabs.query({}, function (tabs) {
        const tabCount = tabs.length;
        browserApi.browserAction.setBadgeText({ text: tabCount.toString() });
        browserApi.browserAction.setBadgeBackgroundColor({ color: [255, 255, 255, 255] });
    });
}

updateTabCount();