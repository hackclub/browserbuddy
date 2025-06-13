chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('reminder', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'reminder') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Skill Reminder',
            message: 'Time to stimulate your skills! Open the extension to practice.'
        });
    }
});
