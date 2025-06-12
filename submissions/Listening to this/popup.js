document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const listenedList = document.getElementById('listenedList');

    function loadListened() {
        chrome.storage.local.get(['listenedItems'], function (result) {
            listenedList.innerHTML = '';
            const items = result.listenedItems || [];
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.textContent = item;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.addEventListener('click', () => {
                    removeItem(index);
                });
                li.appendChild(deleteButton);
                listenedList.appendChild(li);
            });
        });
    }

    function removeItem(index) {
        chrome.storage.local.get(['listenedItems'], function (result) {
            const items = result.listenedItems || [];
            items.splice(index, 1);
            chrome.storage.local.set({ listenedItems: items }, loadListened);
        });
    }

    saveButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            chrome.storage.local.get(['listenedItems'], function (result) {
                const items = result.listenedItems || [];
                if (!items.includes(currentTab.title)) {
                    items.push(currentTab.title);
                    chrome.storage.local.set({ listenedItems: items }, loadListened);
                }
            });
        });
    });

    loadListened();
});
