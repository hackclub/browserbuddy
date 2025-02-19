document.addEventListener('DOMContentLoaded', async function() {
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
        (async function() {
            try {
                const settings = await chrome.storage.local.get([
                    'blockingEnabled',
                    'catReplacementEnabled',
                    'positivityBubbleEnabled',
                    'adsBlocked'
                ]);

                toggleBlockingCheckbox.checked = settings.blockingEnabled ?? true;
                toggleCatReplacementCheckbox.checked = settings.catReplacementEnabled ?? true;
                togglePositivityBubbleCheckbox.checked = settings.positivityBubbleEnabled ?? true;
                adsBlockedElement.textContent = `Ads Blocked: ${settings.adsBlocked || 0}`;
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        })();

        // Add event listeners for all toggles
        toggleBlockingCheckbox.addEventListener('change', async function() {
            try {
                await Promise.all([
                    chrome.storage.local.set({ blockingEnabled: this.checked }),
                    chrome.runtime.sendMessage({
                        action: 'toggleBlocking',
                        enabled: this.checked
                    })
                ]);
            } catch (error) {
                console.error('Failed to save blocking setting:', error);
                this.checked = !this.checked; // Revert on error
            }
        });

        toggleCatReplacementCheckbox.addEventListener('change', async function() {
            try {
                await Promise.all([
                    chrome.storage.local.set({ catReplacementEnabled: this.checked }),
                    chrome.runtime.sendMessage({
                        action: 'toggleCatReplacement',
                        enabled: this.checked
                    })
                ]);
            } catch (error) {
                console.error('Failed to save cat replacement setting:', error);
                this.checked = !this.checked;
            }
        });

        togglePositivityBubbleCheckbox.addEventListener('change', async function() {
            try {
                await Promise.all([
                    chrome.storage.local.set({ positivityBubbleEnabled: this.checked }),
                    chrome.runtime.sendMessage({
                        action: 'togglePositivityBubble',
                        enabled: this.checked
                    })
                ]);
            } catch (error) {
                console.error('Failed to save positivity bubble setting:', error);
                this.checked = !this.checked;
            }
        });
    });
});