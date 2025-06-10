// Initialize contrast state
let contrastEnabled = false;
let currentTheme = 'white-on-black';

// Apply saved settings when page loads
chrome.storage.sync.get(['enabled', 'theme'], function(data) {
  contrastEnabled = data.enabled || false;
  currentTheme = data.theme || 'white-on-black';
  
  if (contrastEnabled) {
    applyContrast(currentTheme);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleContrast') {
    contrastEnabled = request.enabled;
    currentTheme = request.theme;
    
    if (contrastEnabled) {
      applyContrast(currentTheme);
    } else {
      removeContrast();
    }
  } else if (request.action === 'updateTheme') {
    currentTheme = request.theme;
    
    if (contrastEnabled) {
      applyContrast(currentTheme);
    }
  }
  
  sendResponse({ success: true });
  return true;
});

// Apply high contrast theme
function applyContrast(theme) {
  // First remove any existing contrast
  removeContrast();
  
  // Then apply the new theme
  document.documentElement.classList.add('high-contrast');
  document.documentElement.classList.add(theme);
  
  // For dynamic content, we need a mutation observer
  setupMutationObserver();
}

// Remove high contrast theme
function removeContrast() {
  document.documentElement.classList.remove('high-contrast');
  document.documentElement.classList.remove('white-on-black');
  document.documentElement.classList.remove('black-on-white');
  document.documentElement.classList.remove('yellow-on-black');
  document.documentElement.classList.remove('blue-on-white');
  
  // Remove the mutation observer
  if (window.contrastObserver) {
    window.contrastObserver.disconnect();
    window.contrastObserver = null;
  }
}

// Set up mutation observer to handle dynamic content
function setupMutationObserver() {
  // Remove existing observer if any
  if (window.contrastObserver) {
    window.contrastObserver.disconnect();
  }
  
  // Create a new observer
  window.contrastObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Force reapplication of styles to new elements
        if (contrastEnabled) {
          forceReflow();
        }
      }
    });
  });
  
  // Start observing the document with configured parameters
  window.contrastObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Force reflow to ensure styles are applied to new elements
function forceReflow() {
  // This is a hack to force a reflow
  const temp = document.body.offsetHeight;
}
