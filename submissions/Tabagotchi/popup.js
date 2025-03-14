document.addEventListener("DOMContentLoaded", () => {
    const reloadButton = document.getElementById("reloadExtension");
    const toggleButton = document.getElementById("toggleButton");
    const addWebsiteButton = document.getElementById("addWebsiteButton");
    const websiteInput = document.getElementById("websiteInput");
    const excludedWebsitesList = document.getElementById("excludedWebsitesList");
    const moodText = document.getElementById("mood");
    const moodGif = document.getElementById("moodGif");
    const sleepButton = document.getElementById("sleepButton");
    const foodButton = document.getElementById("foodButton");
    const playButton = document.getElementById("playButton");
    const needMessage = document.getElementById("needMessage");

    const maxTabs = 15;
    const maxTabAge = 15 * 60 * 1000;

    reloadButton.addEventListener("click", () => {
        chrome.runtime.reload();
    });

    toggleButton.addEventListener("click", () => {
        const excludeMenu = document.getElementById("excludeMenu");
        excludeMenu.style.display = excludeMenu.style.display === "none" ? "block" : "none";
    });

    addWebsiteButton.addEventListener("click", () => {
        const website = websiteInput.value.trim();
        if (website) {
            chrome.storage.local.get("excludedWebsites", ({ excludedWebsites }) => {
                excludedWebsites = excludedWebsites || [];
                if (!excludedWebsites.includes(website)) {
                    excludedWebsites.push(website);
                    chrome.storage.local.set({ excludedWebsites }, () => {
                        renderExcludedWebsites();
                        websiteInput.value = "";
                        reEvaluateTabagotchiState();
                    });
                } else {
                    alert("This website is already excluded!");
                }
            });
        } else {
            alert("Please enter a valid website.");
        }
    });

    function renderExcludedWebsites() {
        chrome.storage.local.get("excludedWebsites", ({ excludedWebsites }) => {
            excludedWebsitesList.innerHTML = "";
            excludedWebsites = excludedWebsites || [];
            excludedWebsites.forEach((website) => {
                const listItem = document.createElement("li");
                listItem.textContent = website;

                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.style.marginLeft = "10px";
                removeButton.addEventListener("click", () => {
                    excludedWebsites = excludedWebsites.filter((w) => w !== website);
                    chrome.storage.local.set({ excludedWebsites }, () => {
                        renderExcludedWebsites();
                        reEvaluateTabagotchiState(); 
                    });
                });

                listItem.appendChild(removeButton);
                excludedWebsitesList.appendChild(listItem);
            });
        });
    }

    function updateTabagotchiUI() {
        chrome.storage.local.get(["mood", "tabagotchiNeed", "sleeping"], ({ mood, tabagotchiNeed, sleeping }) => {
            if (sleeping) {
                moodText.textContent = "Tabagotchi is sleeping...";
                moodGif.src = "sleep.png"; 
                moodGif.style.display = "block";
                needMessage.textContent = "";
                return;
            }

            if (tabagotchiNeed === "food") {
                moodGif.src = "food.png"; 
                needMessage.textContent = "Tabagotchi is hungry!";
                needMessage.style.color = "red";
            } else if (tabagotchiNeed === "play") {
                moodGif.src = "play.png"; 
                needMessage.textContent = "Tabagotchi wants to play!";
                needMessage.style.color = "red";
            } else {
                moodGif.src = mood === "grumpy" ? "grumpy.png" : "happy.png";
                needMessage.textContent = "";
            }

            moodText.textContent = `Tabagotchi is feeling ${mood || "happy"}!`;
            moodGif.style.display = "block";
        });
    }

function checkTabsAndNotify() {
    chrome.storage.local.get(["tabAges", "excludedWebsites"], ({ tabAges, excludedWebsites }) => {
        const now = Date.now();
        tabAges = tabAges || {};
        console.log("Debug: Tab ages before update:", tabAges);

        chrome.tabs.query({}, (tabs) => {
            const filteredTabs = tabs.filter(tab =>
                !excludedWebsites?.some(site => tab.url.includes(site))
            );
            console.log("Debug: Filtered tabs:", filteredTabs);

            const tooManyTabs = filteredTabs.length > maxTabs;
            let anyTabTooOld = false;

            filteredTabs.forEach((tab) => {
                if (!tabAges[tab.id]) {
                    tabAges[tab.id] = now;
                } else {
                    const tabAge = now - tabAges[tab.id];
                    console.log(`Debug: Tab ${tab.id} age: ${tabAge}ms`);
                    if (tabAge > maxTabAge) {
                        anyTabTooOld = true;
                    }
                }
            });

            chrome.storage.local.set({ tabAges });

                if (tooManyTabs) {
                    sendNotification("Too many tabs are open! Please close some.");
                    makeGrumpy("Too many tabs are open!");
                } else if (anyTabTooOld) {
                    sendNotification("A tab has been open for too long! Consider closing it.");
                    makeGrumpy("A tab has been open for too long!");
                } else {
                    makeHappy();
                }
            });
        });
    }

    function sendNotification(message) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Tabagotchi Alert!",
            message
        });
    }

    function makeHappy() {
        chrome.storage.local.set({ mood: "happy" }, updateTabagotchiUI);
    }

    function makeGrumpy(reason) {
        chrome.storage.local.set({ mood: "grumpy" }, updateTabagotchiUI);
    }

    updateTabagotchiUI();
    renderExcludedWebsites();

    setInterval(checkTabsAndNotify, 1000);
});
