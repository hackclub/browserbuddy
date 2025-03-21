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
    const maxTabAge = 15 * 60 * 1000; // 15 minutes in milliseconds

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

function assignRandomNeed() {
    chrome.storage.local.get(["sleeping", "tabagotchiNeed"], ({ sleeping, tabagotchiNeed }) => {
        if (sleeping || tabagotchiNeed) return;

        const needs = ["food", "play"];
        const randomNeed = needs[Math.floor(Math.random() * needs.length)];

        if (Math.random() < 0.3) {
            chrome.storage.local.set({ tabagotchiNeed: randomNeed }, () => {
                updateTabagotchiUI();
                sendNotification(
                    randomNeed === "food"
                        ? "Tabagotchi is hungry! Feed it."
                        : "Tabagotchi wants to play!"
                );
            });
        }
    });
}



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

        chrome.tabs.query({}, (tabs) => {
            const filteredTabs = tabs.filter(tab =>
                !excludedWebsites?.some(site => tab.url.includes(site))
            );

            const tooManyTabs = filteredTabs.length > maxTabs;
            let anyTabTooOld = false;

            filteredTabs.forEach((tab) => {
                if (!tabAges[tab.id]) {
                    tabAges[tab.id] = now;
                } else {
                    const tabAge = now - tabAges[tab.id];
                    if (tabAge > maxTabAge) {
                        anyTabTooOld = true;
                    }
                }
            });

            chrome.storage.local.set({ tabAges });

            if (tooManyTabs || anyTabTooOld) {
                makeGrumpy(tooManyTabs ? "Too many tabs are open!" : "A tab has been open for too long!");
            } else {
                makeHappy();
            }
        });
    });
}

function makeHappy() {
    chrome.storage.local.set({ mood: "happy" }, updateTabagotchiUI);
}

function makeGrumpy(reason) {
    chrome.storage.local.set({ mood: "grumpy" }, () => {
        updateTabagotchiUI();
        sendNotification(reason);
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

    foodButton.addEventListener("click", () => {
        chrome.storage.local.get(["tabagotchiNeed", "sleeping"], ({ tabagotchiNeed, sleeping }) => {
            if (sleeping) {
                alert("Tabagotchi is sleeping and doesn't need food right now.");
                return;
            }
            if (tabagotchiNeed === "food") {
                chrome.storage.local.set({ tabagotchiNeed: null, mood: "happy" }, () => {
                    updateTabagotchiUI();
                    sendNotification("You fed the Tabagotchi! It's happy now.");
                });
            } else {
                alert("Tabagotchi doesn't need food right now.");
            }
        });
    });

    playButton.addEventListener("click", () => {
        chrome.storage.local.get(["tabagotchiNeed", "sleeping"], ({ tabagotchiNeed, sleeping }) => {
            if (sleeping) {
                alert("Tabagotchi is sleeping and doesn't want to play right now.");
                return;
            }
            if (tabagotchiNeed === "play") {
                chrome.storage.local.set({ tabagotchiNeed: null, mood: "happy" }, () => {
                    updateTabagotchiUI();
                    sendNotification("You played with the Tabagotchi! It's happy now.");
                });
            } else {
                alert("Tabagotchi doesn't want to play right now.");
            }
        });
    });

document.getElementById("infoButton").addEventListener("click", function() {
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("actionButtons").style.display = "none";

  document.getElementById("infoContent").style.display = "block";
});

document.getElementById("backButton").addEventListener("click", function() {
  document.getElementById("infoContent").style.display = "none";

  document.getElementById("mainContent").style.display = "block";
  document.getElementById("actionButtons").style.display = "flex";
});


    sleepButton.addEventListener("click", () => {
        chrome.storage.local.get("sleeping", ({ sleeping }) => {
            const newState = !sleeping;
            chrome.storage.local.set({ sleeping: newState, tabagotchiNeed: null, mood: "happy" }, () => {
                updateTabagotchiUI();
                alert(newState ? "Tabagotchi is now sleeping..." : "Tabagotchi woke up!");
            });
        });
    });

    updateTabagotchiUI();
    renderExcludedWebsites();

    setInterval(checkTabsAndNotify, 10000);
    assignRandomNeed();
});
