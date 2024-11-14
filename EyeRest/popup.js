function setTheme(theme) {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);

    const container = document.querySelector('.container');
    if (container) {
        container.classList.remove('dark', 'light');
        container.classList.add(theme);
    }

    const input = document.querySelector('input[type="number"]');
    if (input) {
        input.classList.remove('dark', 'light');
        input.classList.add(theme);
    }

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.remove('dark', 'light');
        button.classList.add(theme);
    });

    chrome.storage.sync.set({ theme: theme });
}

chrome.storage.sync.get('theme', (data) => {
    const theme = data.theme || 'dark';
    setTheme(theme);
});

document.getElementById('themeToggle').addEventListener('click', () => {
    chrome.storage.sync.get('theme', (data) => {
        const currentTheme = data.theme || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('reminderTime', (data) => {
        if (data.reminderTime) {
            document.getElementById("reminderTime").value = data.reminderTime;
        }
    });
});

document.getElementById("setReminder").addEventListener("click", () => {
    const time = parseInt(document.getElementById("reminderTime").value, 10);
    if (time > 0) {
        chrome.storage.local.set({ reminderTime: time });
        chrome.runtime.sendMessage({ action: "setReminder", time: time });
    }
});

document.getElementById("snoozeButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "snooze" });
});