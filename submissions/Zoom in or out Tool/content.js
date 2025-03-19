let zoomLevel = 100;
let zoomStyle = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getZoom") {
    sendResponse({zoom: zoomLevel});
  } else if (request.action === "setZoom") {
    zoomLevel = request.zoom;
    applyZoom();
    sendResponse({success: true});
  } else if (request.action === "fitWidth") {
    fitToWidth();
    sendResponse({success: true});
  }
  return true;
});

// Apply zoom to the page
function applyZoom() {
  if (!zoomStyle) {
    zoomStyle = document.createElement('style');
    document.head.appendChild(zoomStyle);
  }
  
  zoomStyle.textContent = `
    html, body {
      zoom: ${zoomLevel}% !important;
      -moz-transform: scale(${zoomLevel/100}) !important;
      -moz-transform-origin: 0 0 !important;
    }
  `;
}

// Fit page to width
function fitToWidth() {
  const viewportWidth = window.innerWidth;
  const pageWidth = document.documentElement.scrollWidth;
  const ratio = viewportWidth / pageWidth;
  zoomLevel = Math.round(ratio * 100);
  zoomLevel = Math.max(25, Math.min(400, zoomLevel)); // Limit between 25% and 400%
  applyZoom();
  
  // Update popup if it's open
  chrome.runtime.sendMessage({action: "updateZoom", zoom: zoomLevel});
}

// Initialize zoom
// Check if we should use a saved zoom level
chrome.storage.sync.get(['rememberZoom'], function(result) {
  if (result.rememberZoom) {
    const hostname = window.location.hostname;
    chrome.storage.sync.get([hostname], function(data) {
      if (data[hostname]) {
        zoomLevel = data[hostname];
        applyZoom();
      }
    });
  }
});

// Listen for keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl + Plus: Zoom In
  if (e.ctrlKey && e.key === '+') {
    zoomLevel += 10;
    zoomLevel = Math.min(400, zoomLevel);
    applyZoom();
  }
  // Ctrl + Minus: Zoom Out
  else if (e.ctrlKey && e.key === '-') {
    zoomLevel -= 10;
    zoomLevel = Math.max(25, zoomLevel);
    applyZoom();
  }
  // Ctrl + 0: Reset Zoom
  else if (e.ctrlKey && e.key === '0') {
    zoomLevel = 100;
    applyZoom();
  }
});
