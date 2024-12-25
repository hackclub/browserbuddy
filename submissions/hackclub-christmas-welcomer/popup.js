document.addEventListener("DOMContentLoaded", () => {
    // Initialize state variable
    let isSoundEnabled = true; // Default state

    // Get the button element
    const toggleSoundButton = document.getElementById("toggleSound");

    // Function to update button text
    function updateSoundButton() {
        isSoundEnabled = !isSoundEnabled; // Toggle state
        toggleSoundButton.innerText = isSoundEnabled ? "Disable Sound" : "Enable Sound";

        // You can use chrome storage here to save the state
        chrome.storage.local.set({ isSoundEnabled });
    }

    // Event listener for button click
    toggleSoundButton.addEventListener("click", updateSoundButton);

    // Set the button text on page load based on the current state
    chrome.storage.local.get("isSoundEnabled", function (data) {
        if (data.isSoundEnabled !== undefined) {
            isSoundEnabled = data.isSoundEnabled; // Use saved state
        }
        toggleSoundButton.innerText = isSoundEnabled ? "Disable Sound" : "Enable Sound";
    });
});
