document.addEventListener('DOMContentLoaded', function() {
  // Load saved theme settings
  chrome.storage.sync.get(['theme'], function(result) {
    if (result.theme) {
      const theme = result.theme;
      document.getElementById('background-color').value = theme.backgroundColor || '#ffffff';
      document.getElementById('text-color').value = theme.textColor || '#000000';
      document.getElementById('link-color').value = theme.linkColor || '#0000ff';
      document.getElementById('font-family').value = theme.fontFamily || 'Arial, sans-serif';
      document.getElementById('font-size').value = theme.fontSize || 'medium';
    }
  });

  // Apply theme button
  document.getElementById('apply-theme').addEventListener('click', function() {
    const theme = {
      backgroundColor: document.getElementById('background-color').value,
      textColor: document.getElementById('text-color').value,
      linkColor: document.getElementById('link-color').value,
      fontFamily: document.getElementById('font-family').value,
      fontSize: document.getElementById('font-size').value
    };

    // Save theme to storage
    chrome.storage.sync.set({ theme: theme }, function() {
      console.log('Theme saved:', theme);
    });

    // Apply theme to current tab
    applyThemeToCurrentTab(theme);
  });

  // Reset theme button
  document.getElementById('reset-theme').addEventListener('click', function() {
    const defaultTheme = {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      linkColor: '#0000ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'medium'
    };

    // Update UI
    document.getElementById('background-color').value = defaultTheme.backgroundColor;
    document.getElementById('text-color').value = defaultTheme.textColor;
    document.getElementById('link-color').value = defaultTheme.linkColor;
    document.getElementById('font-family').value = defaultTheme.fontFamily;
    document.getElementById('font-size').value = defaultTheme.fontSize;

    // Save default theme
    chrome.storage.sync.set({ theme: defaultTheme }, function() {
      console.log('Theme reset to default');
    });

    // Apply default theme to current tab
    applyThemeToCurrentTab(defaultTheme);
  });

  function applyThemeToCurrentTab(theme) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'applyTheme', theme: theme });
    });
  }
});
