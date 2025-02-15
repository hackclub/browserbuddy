chrome.tabs.query({active:true,currentWindow:true},function(tab){
  if (!tab[0].url || !tab[0].url.includes("https://highseas.hackclub.com/"))
    window.open("https://highseas.hackclub.com/shop","_blank");
});


function loadHiddenItems() {
    chrome.storage.sync.get(["hiddenItems"], (result) => {
        /** @type {[string]} */
        const hiddenItems = result.hiddenItems || [];
        const itemsList = document.getElementById("hidden-items-list");

        itemsList.innerHTML = "";

        if (hiddenItems.length === 0) {
            const noItemsMessage = document.createElement("li");
            noItemsMessage.textContent = "No hidden items.";
            itemsList.appendChild(noItemsMessage);
        } else {
            hiddenItems.map((item) => {
                const indexOfDot = item.indexOf(".");
                
                return [item, Number.parseInt(item.slice(0, indexOfDot)), item.slice(indexOfDot+1).trim()]
            }).sort((a, b) => a[1] - b[1]).forEach(([item, index,  namee]) => {
                const listItem = document.createElement("li");
                listItem.textContent = namee;

                const unhideButton = document.createElement("button");
                unhideButton.textContent = "Unhide";
                unhideButton.addEventListener("click", () => {
                    unhideItem(item);
                });

                listItem.appendChild(unhideButton);
                itemsList.appendChild(listItem);
            });
        }
    });
}

function unhideItem(itemTitle) {
    chrome.storage.sync.get(["hiddenItems"], (result) => {
        /** @type {[string]} */
        const hiddenItems = result.hiddenItems || [];

        const updatedItems = hiddenItems.filter((item) => item !== itemTitle);

        chrome.storage.sync.set({hiddenItems: updatedItems}, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "unhideItem", itemTitle }, (response) => {
                    console.error(response?.status || "Failed to notify content script.");
                });
            });

            loadHiddenItems();
        });
    });
}

function unhideAllItems() {
    chrome.storage.sync.set({hiddenItems: []}, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "unhideAll" }, (response) => {
                console.error(response?.status || "Failed to notify content script.");
            });
        });

        loadHiddenItems();
    });
}


document.getElementById("unhide-all").addEventListener("click", unhideAllItems);

loadHiddenItems();
