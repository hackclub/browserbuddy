const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup script loaded");

    // Load all available groups into the buttons and dropdown for customization
    function loadContexts() {
        extensionAPI.storage.local.get(null, function(result) {
            const buttonContainer = document.getElementById('context-buttons');
            const groupSelect = document.getElementById('group-selection');
            buttonContainer.innerHTML = ''; // Clear previous buttons
            groupSelect.innerHTML = ''; // Clear previous options

            for (let contextName in result) {
                // Create a button for quick access to each group
                const button = document.createElement('button');
                button.className = 'group-button';
                button.textContent = contextName;
                button.addEventListener('click', () => switchContext(contextName));
                buttonContainer.appendChild(button);

                // Add context to dropdown menu for customization
                const option = document.createElement('option');
                option.value = contextName;
                option.textContent = contextName;
                groupSelect.appendChild(option);
            }
            loadGroupUrls(); // Load URLs for the initially selected group
        });
    }

    // Load URLs in the selected group
    function loadGroupUrls() {
        const selectedGroup = document.getElementById('group-selection').value;
        extensionAPI.storage.local.get([selectedGroup], (result) => {
            const urlList = document.getElementById('url-list');
            urlList.innerHTML = ''; // Clear previous URLs
            const urls = result[selectedGroup] || [];

            urls.forEach((url, index) => {
                const urlItem = document.createElement('div');
                urlItem.className = 'url-item';

                const urlText = document.createElement('span');
                urlText.className = 'url-text';
                urlText.textContent = url;

                const urlActions = document.createElement('div');
                urlActions.className = 'url-actions';

                // Edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editUrl(selectedGroup, index, url));

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteUrl(selectedGroup, index));

                urlActions.appendChild(editButton);
                urlActions.appendChild(deleteButton);
                urlItem.appendChild(urlText);
                urlItem.appendChild(urlActions);
                urlList.appendChild(urlItem);
            });
        });
    }

    // Switch context to open all URLs in a new window
    function switchContext(contextName) {
        extensionAPI.runtime.sendMessage({ type: "switchContext", context: contextName }, (response) => {
            if (extensionAPI.runtime.lastError) {
                console.error("Runtime error:", extensionAPI.runtime.lastError.message);
            } else {
                console.log("Switched to context:", response);
            }
        });
    }

    // Add URL to the selected group with protocol validation
    document.getElementById('add-url').addEventListener('click', () => {
        const selectedGroup = document.getElementById('group-selection').value;
        let newUrl = document.getElementById('custom-urls').value.trim();

        if (!newUrl) {
            alert("Please enter a valid URL.");
            return;
        }

        // Ensure the URL has a protocol
        if (!/^https?:\/\//i.test(newUrl)) {
            newUrl = `https://${newUrl}`;
        }

        extensionAPI.storage.local.get([selectedGroup], (result) => {
            const urls = result[selectedGroup] || [];
            urls.push(newUrl);
            extensionAPI.storage.local.set({ [selectedGroup]: urls }, () => {
                console.log(`Added URL "${newUrl}" to group "${selectedGroup}"`);
                document.getElementById('custom-urls').value = '';
                loadGroupUrls(); // Refresh URL list
            });
        });
    });

    // Delete URL from the selected group
    function deleteUrl(group, index) {
        extensionAPI.storage.local.get([group], (result) => {
            const urls = result[group];
            urls.splice(index, 1); // Remove URL at the specified index
            extensionAPI.storage.local.set({ [group]: urls }, () => {
                console.log(`Deleted URL at index ${index} from group "${group}"`);
                loadGroupUrls(); // Refresh URL list
            });
        });
    }

    function editUrl(group, index, oldUrl) {
        let newUrl = prompt("Edit URL:", oldUrl);
        if (newUrl && newUrl.trim()) {
            newUrl = newUrl.trim();
            
            if (!/^https?:\/\//i.test(newUrl)) {
                newUrl = `https://${newUrl}`;
            }

            extensionAPI.storage.local.get([group], (result) => {
                const urls = result[group];
                urls[index] = newUrl;
                extensionAPI.storage.local.set({ [group]: urls }, () => {
                    console.log(`Updated URL to "${newUrl}" in group "${group}"`);
                    loadGroupUrls(); // Refresh URL list
                });
            });
        }
    }

    // Event listener for group selection change in customization dropdown
    document.getElementById('group-selection').addEventListener('change', loadGroupUrls);

    loadContexts(); // Load context groups and URLs initially
});
