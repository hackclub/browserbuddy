document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup script loaded");

    function loadContexts() {
        chrome.storage.local.get(null, function(result) {
            const buttonContainer = document.getElementById('context-buttons');
            const groupSelect = document.getElementById('group-selection');
            buttonContainer.innerHTML = ''; // Clear previous buttons
            groupSelect.innerHTML = ''; // Clear previous dropdown options

            for (let contextName in result) {
                // Create button for each context
                const button = document.createElement('button');
                button.className = 'button';
                button.textContent = contextName;
                button.addEventListener('click', () => switchContext(contextName));
                buttonContainer.appendChild(button);

                // Add context to dropdown menu
                const option = document.createElement('option');
                option.value = contextName;
                option.textContent = contextName;
                groupSelect.appendChild(option);
            }
        });
    }

    function switchContext(contextName) {
        chrome.runtime.sendMessage({ type: "switchContext", context: contextName }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError.message);
            } else {
                console.log("Switched to context:", response);
            }
        });
    }

    // Add URLs to the selected group, ensuring each URL has a valid protocol
    document.getElementById('save-custom-urls').addEventListener('click', () => {
        const selectedGroup = document.getElementById('group-selection').value;
        const customUrls = document.getElementById('custom-urls').value
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0)
            .map(url => {
                // Add "https://" if URL doesn't already have a protocol
                if (!/^https?:\/\//i.test(url)) {
                    return `https://${url}`;
                }
                return url;
            });

        if (!selectedGroup) {
            alert("Please select a group first.");
            return;
        }
        
        if (customUrls.length > 0) {
            chrome.storage.local.get([selectedGroup], (result) => {
                const existingUrls = result[selectedGroup] || [];
                const updatedUrls = [...new Set([...existingUrls, ...customUrls])];
                chrome.storage.local.set({ [selectedGroup]: updatedUrls }, () => {
                    console.log(`Saved URLs for ${selectedGroup}:`, updatedUrls);
                    alert(`URLs added to the "${selectedGroup}" group successfully!`);
                });
            });
        } else {
            alert("Please enter at least one valid URL.");
        }
    });

    loadContexts(); // Load context buttons and dropdown options on initialization
});
