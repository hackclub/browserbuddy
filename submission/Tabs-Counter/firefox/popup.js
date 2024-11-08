const browserApi = chrome || browser;
document.addEventListener('DOMContentLoaded', function () {
    browserApi.tabs.query({}, function (tabs) {
        const tabCount = tabs.length;
        document.getElementById('tab-count').textContent = `Tabs open: ${tabCount}`;
    });
});
