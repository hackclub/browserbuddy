document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({}, function (tabs) {
        const tabCount = tabs.length;
        document.getElementById('tab-count').textContent = `Tabs open: ${tabCount}`;
    });
});
