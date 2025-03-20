// Function to toggle features based on the checkbox state
function toggleFeature(feature, isEnabled) {
    chrome.storage.sync.set({ [feature]: isEnabled }, () => {
        console.log(`${feature} is now ${isEnabled ? 'enabled' : 'disabled'}`);
        // Send a message to the background script to relay to content scripts
        chrome.runtime.sendMessage({ 
            action: 'toggleFeature', 
            feature, 
            enabled: isEnabled 
        });
    });
}

// This function will only run in popup.html context, not in the background
function initFeatureHandlers() {
    // Add event listeners to feature toggles
    document.querySelectorAll('.feature-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const feature = this.getAttribute('data-feature');
            const isEnabled = this.checked;
            toggleFeature(feature, isEnabled);
        });
    });
}

// Run the init function only if we're in a browser context with a DOM
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeatureHandlers);
} else if (typeof document !== 'undefined') {
    initFeatureHandlers();
}