// Apply saved theme on page load
chrome.storage.sync.get(['theme'], function(result) {
  if (result.theme) {
    applyTheme(result.theme);
  }
});

// Listen for theme changes from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'applyTheme') {
    applyTheme(request.theme);
    sendResponse({status: 'Theme applied successfully'});
  }
  return true;
});

// Function to apply theme to the page
function applyTheme(theme) {
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
  
  console.log('Theme applied:', theme);
}
