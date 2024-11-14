chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "setReminder") {
        const timeInMinutes = message.time;
        const timeInMilliseconds = timeInMinutes * 60 * 1000;

        chrome.alarms.create("breakReminder", { when: Date.now() + timeInMilliseconds });
    }

    if (message.action === "snooze") {
        chrome.alarms.create("breakReminder", { when: Date.now() + 5 * 60 * 1000 });
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "breakReminder") {
        console.log("Break reminder triggered!");
        chrome.notifications.create({
            type: "basic",
            iconUrl: "logo.png",
            title: "Time for a break!",
            message: "Reminder to take a break.",
            priority: 2,
            buttons: [{ title: "Snooze" }]
        }, (notificationId) => {
            console.log("Notification created: " + notificationId);
        });
        
    }
});
