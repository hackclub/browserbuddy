document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
    ["enableIconClick", "enableHotkey", "sciHubDomain", "darkMode"],
    (settings) => {
        // Set initial states from saved settings
        document.getElementById("enable-icon-click").checked = settings.enableIconClick || false;
        document.getElementById("enable-hotkey").checked = settings.enableHotkey || false;
        document.getElementById("scihub-domain").value = settings.sciHubDomain || "";

        
        if (settings.darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("dark-mode-toggle").checked = true;
        } else {
        document.body.classList.add("light-mode");
        }
    }
    );

    
    document.getElementById("enable-icon-click").addEventListener("change", (e) => {
    chrome.storage.sync.set({ enableIconClick: e.target.checked });
    });

    
    document.getElementById("enable-hotkey").addEventListener("change", (e) => {
    chrome.storage.sync.set({ enableHotkey: e.target.checked });
    });

    
    document.getElementById("scihub-domain").addEventListener("change", (e) => {
    chrome.storage.sync.set({ sciHubDomain: e.target.value });
    });

    
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    darkModeToggle.addEventListener("change", (e) => {
    const isEnabled = e.target.checked;
    document.body.classList.toggle("dark-mode", isEnabled);
    document.body.classList.toggle("light-mode", !isEnabled);
    chrome.storage.sync.set({ darkMode: isEnabled });
    });
});
