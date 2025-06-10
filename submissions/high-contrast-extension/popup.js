document.addEventListener('DOMContentLoaded', function() {
  const contrastToggle = document.getElementById('contrast-toggle');
  const themeSelect = document.getElementById('theme-select');

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'theme'], function(data) {
    contrastToggle.checked = data.enabled || false;
    if (data.theme) {
      themeSelect.value = data.theme;
    }
  });

  // Toggle high contrast mode
  contrastToggle.addEventListener('change', function() {
    const enabled = contrastToggle.checked;
    
    // Save user preference
    chrome.storage.sync.set({ enabled: enabled });
    
    // Apply to current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'toggleContrast',
        enabled: enabled,
        theme: themeSelect.value
      });
    });
  });

  // Handle theme changes
  themeSelect.addEventListener('change', function() {
    const theme = themeSelect.value;
    
    // Save user preference
    chrome.storage.sync.set({ theme: theme });
    
    // Only apply if high contrast is enabled
    if (contrastToggle.checked) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateTheme',
          theme: theme
        });
      });
    }
  });
});
