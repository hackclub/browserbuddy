document.addEventListener("DOMContentLoaded", () => {
    const toggleExtension = document.getElementById("toggleExtension");
    const calendarIdInput = document.getElementById("calendarId");
    const saveCalendarIdButton = document.getElementById("saveCalendarId");

    chrome.storage.sync.get(["isExtensionActive", "calendarId"], (data) => {
        toggleExtension.checked = data.isExtensionActive || false;
        calendarIdInput.value = data.calendarId || "";
    });

    toggleExtension.addEventListener("change", () => {
        const isExtensionActive = toggleExtension.checked;

        chrome.storage.sync.set({ isExtensionActive }, () => {
            chrome.runtime.sendMessage({ action: "toggleExtensionState", active: isExtensionActive });
        });
    });

    saveCalendarIdButton.addEventListener("click", () => {
        const calendarId = calendarIdInput.value;

        if (!calendarId) {
            alert("Please enter a valid Calendar ID.");
            return;
        }

        chrome.storage.sync.set({ calendarId }, () => {
            chrome.runtime.sendMessage({ action: "updateCalendarId", calendarId });
            alert("Calendar ID saved.");
        });
    });
});
