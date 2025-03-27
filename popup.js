const CONFIG = {
    STATUS_UPDATE_DELAY: 2000,
    DEFAULT_ENABLED: true,
    ANIMATION_DURATION: 300,
    // Feature names exactly matching content.js CONFIG.FEATURE_FILES keys
    FEATURES: [
        "vid",
        "shorts2long",
        "subsComment",
        "sblock",
        "subsbutton"
    ]
};

// Set current year in footer
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    const toggle = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');
    const container = document.querySelector('.container');
    const settingsIcon = document.getElementById('openSettings');
    const settingsPanel = document.getElementById('settings');

    // Initially hide the settings panel
    settingsPanel.style.display = 'none';

    let isProcessingAction = false;

    // Settings icon click handler - toggle settings panel visibility
    settingsIcon.addEventListener('click', () => {
        if (settingsPanel.style.display === 'none') {
            // Show settings panel
            settingsPanel.style.display = 'block';
            // Load feature states when settings are opened
            loadFeatureStates();
        } else {
            // Hide settings panel
            settingsPanel.style.display = 'none';
        }
    });

    // Function to load feature states from storage
    function loadFeatureStates() {
        // Get all feature keys
        chrome.storage.sync.get(CONFIG.FEATURES, (result) => {
            // Update each toggle based on stored state - use the exact same names as content.js
            CONFIG.FEATURES.forEach(feature => {
                const toggle = document.querySelector(`.feature-toggle[data-feature="${feature}"]`);
                if (toggle) {
                    // Default to true if not explicitly set to false
                    toggle.checked = result[feature] !== false;
                    console.log(`Loading ${feature} state:`, toggle.checked);
                }
            });
        });
    }

    // Add event listeners to feature toggles
    document.querySelectorAll('.feature-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const feature = e.target.dataset.feature;
            const isEnabled = e.target.checked;

            console.log(`Toggle ${feature}:`, isEnabled);

            // Save feature state to storage
            const storageUpdate = {};
            storageUpdate[feature] = isEnabled;
            chrome.storage.sync.set(storageUpdate, () => {
                console.log(`Saved ${feature} state:`, isEnabled);
            });

            // Notify content script about feature change
            chrome.tabs.query({ url: '*://*.youtube.com/*' }, function(tabs) {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleFeature',
                        feature: feature,
                        enabled: isEnabled
                    });
                });
            });

            // Visual feedback
            const featureName = document.querySelector(`.feature-card.${feature} .feature-title`)?.textContent || feature;
            updateStatus(
                statusText,
                `${featureName} ${isEnabled ? 'enabled' : 'disabled'}`,
                'success'
            );

            // Reset status after delay
            setTimeout(() => {
                updateStatus(
                    statusText,
                    isExtensionEnabled ? 'Extension is Active 🟢' : 'Extension is Inactive 🔴',
                    isExtensionEnabled ? 'active' : 'inactive'
                );
            }, CONFIG.STATUS_UPDATE_DELAY);
        });
    });

    // Check if current tab is YouTube
    checkYouTubeTab()
        .then(isYouTube => {
            if (!isYouTube) {
                disableControls(toggle);
                updateStatus(statusText, 'Open YouTube to use this extension', 'warning');
                return;
            }

            // Initialize extension state from storage
            initializeExtensionState(toggle, statusText);
        })
        .catch(error => {
            console.error('Tab access error:', error);
            disableControls(toggle);
            updateStatus(statusText, 'Error accessing tab information', 'error');
        });

    // Handle messages from runtime
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "updateToggle") {
            toggle.checked = request.enabled;
            updateStatus(
                statusText,
                request.enabled ? 'Extension is Active 🟢' : 'Extension is Inactive 🔴',
                request.enabled ? 'active' : 'inactive'
            );
        }
    });

    // Toggle event listener
    toggle.addEventListener('change', () => {
        if (isProcessingAction) return;
        isProcessingAction = true;

        const isEnabled = toggle.checked;
        applyPulseAnimation(container);

        // Save to storage
        chrome.storage.sync.set({ extensionEnabled: isEnabled }, () => {
            updateStatus(
                statusText,
                isEnabled ? 'Extension is Active 🟢' : 'Extension is Inactive 🔴',
                isEnabled ? 'active' : 'inactive'
            );

            // Notify content script to enable/disable features
            chrome.tabs.query({ url: '*://*.youtube.com/*' }, function(tabs) {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension', enabled: isEnabled });
                });
            });

            isProcessingAction = false;
        });
    });
});

// Track global extension state
let isExtensionEnabled = true;

async function checkYouTubeTab() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        return !!tab?.url?.match(/^https?:\/\/(www\.)?youtube\.com/);
    } catch (error) {
        console.error('Tab check error:', error);
        return false;
    }
}

function initializeExtensionState(toggle, statusText) {
    toggle.disabled = false;

    // Get extension state from storage
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
        isExtensionEnabled = result.extensionEnabled !== false;
        toggle.checked = isExtensionEnabled;
        updateStatus(
            statusText,
            isExtensionEnabled ? 'Extension is Active 🟢' : 'Extension is Inactive 🔴',
            isExtensionEnabled ? 'active' : 'inactive'
        );
    });
}

function updateStatus(statusElement, message, type) {
    statusElement.classList.remove('status-active', 'status-inactive', 'status-warning', 'status-error', 'status-success', 'status-processing');
    statusElement.classList.add(`status-${type}`);
    statusElement.style.opacity = '0';
    setTimeout(() => {
        statusElement.textContent = message;
        statusElement.style.opacity = '1';
    }, 150);
}

function disableControls(toggle) {
    toggle.disabled = true;
    toggle.classList.add('disabled');
}

function applyPulseAnimation(element) {
    element.classList.add('pulse');
    setTimeout(() => {
        element.classList.remove('pulse');
    }, CONFIG.ANIMATION_DURATION);
}