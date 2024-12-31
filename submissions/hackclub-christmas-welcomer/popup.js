import { cursorThemes } from './themes.js';

document.addEventListener("DOMContentLoaded", () => {
    let isSoundEnabled = false; // Default state
    let selectedTheme = "hackClubTheme";

    // Function to update the theme
    function updateTheme() {
        chrome.storage.local.get("selectedTheme", (result) => {
            if (result.selectedTheme) {
                selectedTheme = result.selectedTheme;
                console.log("Selected theme from storage:", selectedTheme);
                applyTheme();
            } else {
                chrome.storage.local.set({ selectedTheme }, () => {
                    applyTheme();
                    console.log("Theme set to default:", selectedTheme);
                });
            }
        });
    }

    // Function to apply the theme
    function applyTheme() {
        if (cursorThemes[selectedTheme]) {
            const pointerElements = document.querySelectorAll('button, a, [style*="cursor: pointer"]');

            pointerElements.forEach((element) => {
                element.style.cursor = `url(${cursorThemes[selectedTheme].cursor}), auto !important;`;
            });
            const style = document.createElement("style");
            style.textContent = `
        * {
            cursor: url(${cursorThemes[selectedTheme].cursor}), auto !important;
        }

        body:active, *:active {
            cursor: url(${cursorThemes[selectedTheme].click}), auto !important;
        }
    `;
            document.head.appendChild(style);
        } else {
            console.error("Invalid theme:", selectedTheme);
        }
    }

    // Event listeners for cursor buttons
    document.querySelectorAll('.cursor-button').forEach(button => {
        button.addEventListener("click", (event) => {
            const theme = event.currentTarget.getAttribute("data-theme");
            if (theme && cursorThemes[theme]) {
                selectedTheme = theme;
                chrome.storage.local.set({ selectedTheme });
                console.log(`Theme changed to: ${theme}`);
                applyTheme();
            }
        });
    });

    // Sound toggle button
    const toggleSoundButton = document.getElementById("toggleSound");

    function updateSoundButton() {
        isSoundEnabled = !isSoundEnabled;
        toggleSoundButton.innerText = isSoundEnabled ? "Disable Sound" : "Enable Sound";
        chrome.storage.local.set({ isSoundEnabled });
    }

    toggleSoundButton.addEventListener("click", updateSoundButton);

    chrome.storage.local.get(["isSoundEnabled"], (data) => {
        // Set sound state
        if (data.isSoundEnabled !== undefined) {
            isSoundEnabled = data.isSoundEnabled;
        }

        // Update sound toggle button text based on sound state
        toggleSoundButton.innerText = isSoundEnabled ? "Disable Sound" : "Enable Sound";

        // Set the theme
        /*
        if (data.selectedTheme) {
            selectedTheme = data.selectedTheme;
            console.log("Loaded theme:", selectedTheme);
            applyTheme(); // Apply the loaded theme
        } else {
            // If no theme is stored, set the default theme
            chrome.storage.local.set({ selectedTheme }, () => {
                console.log("Theme set to default:", selectedTheme);
                applyTheme(); // Apply the default theme immediately
            });
        }
        */
    });
});