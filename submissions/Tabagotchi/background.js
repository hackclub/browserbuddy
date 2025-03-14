function assignRandomNeed() {
    const needs = ["sleep", "food", "play"];
    const randomNeed = needs[Math.floor(Math.random() * needs.length)];

    chrome.storage.local.get("tabagotchiDisabledUntil", (data) => {
        const now = Date.now();
        if (data.tabagotchiDisabledUntil && now < data.tabagotchiDisabledUntil) {
            return;
        }

        chrome.storage.local.set({ tabagotchiNeed: randomNeed }, () => {
            sendNotification(randomNeed);
        });
    });
}

function sendNotification(need) {
    chrome.storage.local.get("tabagotchiDisabledUntil", (data) => {
        if (data.tabagotchiDisabledUntil && Date.now() < data.tabagotchiDisabledUntil) {
            return;
        }

        let titles = {
            "sleep": "Tabagotchi is Sleepy!",
            "food": "Tabagotchi is Hungry!",
            "play": "Tabagotchi Wants to Play!"
        };

        let messages = {
            "sleep": "Put it to sleep now!",
            "food": "Feed it before it gets grumpy!",
            "play": "Give it a toy or it might throw a tantrum!"
        };

        let icons = {
            "sleep": "sleep.png",
            "food": "food.png",
            "play": "play.png"
        };

        chrome.notifications.create({
            type: "basic",
            iconUrl: icons[need],
            title: titles[need],
            message: messages[need]
        });

        if (need === "play") {
            setTimeout(() => {
                chrome.storage.local.get("tabagotchiNeed", (data) => {
                    if (data.tabagotchiNeed === "play") {
                        triggerTantrum(); // this wont work rn :3
                    }
                });
            }, 10000);
        }

        scheduleNextNeed();
    });
}

function triggerTantrum() {
    chrome.storage.local.set({ mood: "tantrum" }, () => {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "tantrum.png",
            title: "Tabagotchi Tantrum!",
            message: "You ignored it! Now it's grumpy!"
        });
    });
}

function scheduleNextNeed() {
    const randomTime = Math.floor(Math.random() * (120000 - 30000)) + 30000;
    setTimeout(assignRandomNeed, randomTime);
}

chrome.runtime.onInstalled.addListener(scheduleNextNeed);
chrome.runtime.onStartup.addListener(scheduleNextNeed);
