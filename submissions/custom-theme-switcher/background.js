// Initialize default theme if not set
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['theme'], function(result) {
    if (!result.theme) {
      const defaultTheme = {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        linkColor: '#0000ff',
        fontFamily: 'Arial, sans-serif',
        fontSize: 'medium'
      };
      
      chrome.storage.sync.set({ theme: defaultTheme }, function() {
        console.log('Default theme initialized');
      });
    }
  });
});

// Apply theme when a new tab is created or updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.startsWith('http')) {
    chrome.storage.sync.get(['theme'], function(result) {
      if (result.theme) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: injectTheme,
          args: [result.theme]
        })
        .catch(error => console.error('Error injecting theme script:', error));
      }
    });
  }
});

// Function to be injected into tabs
function injectTheme(theme) {
  // Create a style element if it doesn't exist
  let themeStyle = document.getElementById('custom-theme-style');
  if (!themeStyle) {
    themeStyle = document.createElement('style');
    themeStyle.id = 'custom-theme-style';
    document.head.appendChild(themeStyle);
  }

  // Create CSS rules based on theme settings
  const css = `
    body {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
      font-family: ${theme.fontFamily} !important;
      font-size: ${theme.fontSize} !important;
    }
    
    a, a:visited, a:hover, a:active {
      color: ${theme.linkColor} !important;
    }
    
    /* Additional selectors to override common elements */
    p, span, div, h1, h2, h3, h4, h5, h6, li, td, th {
      color: ${theme.textColor} !important;
      font-family: ${theme.fontFamily} !important;
    }
  `;

  // Apply the CSS
  themeStyle.textContent = css;
  
  console.log('Theme applied via background script:', theme);
}
