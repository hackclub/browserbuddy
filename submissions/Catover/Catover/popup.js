document.addEventListener('DOMContentLoaded', function() {
    const adsBlockedElement = document.getElementById('adsBlocked');
    const toggleBlockingCheckbox = document.getElementById('toggleBlocking');
    const toggleCatReplacementCheckbox = document.getElementById('toggleCatReplacement');
    const togglePositivityBubbleCheckbox = document.getElementById('togglePositivityBubble');

    // Check if we're on a CATAAS site
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        if (currentUrl.includes('cataas.com')) {
            // Disable all toggles and show message
            toggleBlockingCheckbox.disabled = true;
            toggleCatReplacementCheckbox.disabled = true;
            togglePositivityBubbleCheckbox.disabled = true;
            
            // Add message to popup
            const messageDiv = document.createElement('div');
            messageDiv.style.color = 'red';
            messageDiv.style.padding = '10px';
            messageDiv.style.textAlign = 'center';
            messageDiv.textContent = 'Extension disabled on CATAAS sites';
            document.body.insertBefore(messageDiv, document.body.firstChild);
            
            return; // Don't proceed with normal initialization
        }

        // Normal initialization for non-CATAAS sites
        chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
            adsBlockedElement.textContent = `Ads Blocked: ${response.adsBlocked}`;
            toggleBlockingCheckbox.checked = response.blockingEnabled;
            toggleCatReplacementCheckbox.checked = response.catReplacementEnabled;
            togglePositivityBubbleCheckbox.checked = response.positivityBubbleEnabled;
        });

        // Add event listeners for all toggles
        toggleBlockingCheckbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({
                action: 'toggleBlocking',
                enabled: this.checked
            });
        });

        toggleCatReplacementCheckbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({
                action: 'toggleCatReplacement',
                enabled: this.checked
            });
        });

        togglePositivityBubbleCheckbox.addEventListener('change', function() {
            chrome.runtime.sendMessage({
                action: 'togglePositivityBubble',
                enabled: this.checked
            });
            // Save to storage
            chrome.storage.local.set({ positivityBubbleEnabled: this.checked });
        });
    });
});