function setupHideButtons(items) {
    Array.from(items).forEach((item, index) => {
        const title =  index + ". " + item.querySelector(".tracking-tight").textContent.trim();
 
        item.style.position = "relative";

        const hideButton = document.createElement("button");
        hideButton.textContent = "Hide";
        hideButton.style.padding = "0 5px";
        hideButton.style.backgroundColor = "#f00";
        hideButton.style.borderRadius = "20px";
        hideButton.style.cursor = "pointer";
        hideButton.style.position = "absolute";
        hideButton.style.top = "5px";
        hideButton.style.right = "5px";

        hideButton.addEventListener("click", () => {
            browser.storage.sync.get(["hiddenItems"], (result) => {
                if (!result) {
                    browser.storage.sync.set({hiddenItems: [title]}, () => {
                        item.style.display = "none";
                    });

                    return;
                }

                /** @type {[string]} */
                const hiddenItems = result.hiddenItems || [];

                if (!hiddenItems.includes(title)) {
                    hiddenItems.push(title);

                    browser.storage.sync.set({hiddenItems}, () => {
                        item.style.display = "none";
                    });
                }
            });
        });

        item.appendChild(hideButton);
    });
}

function checkForShopPage() {
    const CURRENT_URL = window.location.href;

    if (CURRENT_URL.includes("/shop")) {
        const items = document.querySelector("#region-select").parentElement.querySelector(".grid").children;
        setupHideButtons(items);

        browser.storage.sync.get(["hiddenItems"], (result) => {
            if (!result) {
                browser.storage.sync.set({hiddenItems: []}, () => {
                    console.log("No hidden items found. Creating new list.");
                });

                return;
            }

            const hiddenItems = result.hiddenItems || [];

            Array.from(items).forEach((item, index) => {
                const title =  index + ". " + item.querySelector(".tracking-tight").textContent.trim();

                if (hiddenItems.includes(title)) {
                    item.style.display = "none";
                }
            });
        });
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "unhideItem") {
        const items = document.querySelector("#region-select").parentElement.querySelector(".grid").children;

        Array.from(items).forEach((item, index) => {
            const title =  index + ". " + item.querySelector(".tracking-tight").textContent.trim();

            if (title === message.itemTitle) {
                item.style.display = "";
                console.log(`Item "${title}" unhidden on the page.`);
            }
        });

        sendResponse({status: "success"});
    }

    if (message.action === "unhideAll") {
        const items = document.querySelector("#region-select").parentElement.querySelector(".grid").children;

        Array.from(items).forEach((item) => {
            item.style.display = "";
        });

        console.log("All items unhidden on the page.");
        sendResponse({status: "success"});
    }
});

let previousUrl = window.location.href;

const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;

    if (currentUrl !== previousUrl) {
        previousUrl = currentUrl;
        checkForShopPage();
    }
});

observer.observe(document.body, {childList: true, subtree: true});

checkForShopPage();