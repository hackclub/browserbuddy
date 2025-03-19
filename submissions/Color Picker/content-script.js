// This script will be injected into web pages
// It will create a color picker overlay when activated

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'activate') {
    startColorPicker();
  }
});

function startColorPicker() {
  // Create an overlay div that covers the entire page
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '10000';
  overlay.style.cursor = 'crosshair';
  
  // Create color display element
  const colorDisplay = document.createElement('div');
  colorDisplay.style.position = 'fixed';
  colorDisplay.style.bottom = '20px';
  colorDisplay.style.left = '50%';
  colorDisplay.style.transform = 'translateX(-50%)';
  colorDisplay.style.padding = '10px';
  colorDisplay.style.backgroundColor = 'black';
  colorDisplay.style.color = 'white';
  colorDisplay.style.borderRadius = '5px';
  colorDisplay.style.zIndex = '10001';
  colorDisplay.textContent = 'Move cursor to pick a color';
  
  document.body.appendChild(overlay);
  document.body.appendChild(colorDisplay);
  
  // Handle mouse movement to get color
  overlay.addEventListener('mousemove', function(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    // Get the element under the cursor (ignoring our overlay)
    overlay.style.pointerEvents = 'none';
    const element = document.elementFromPoint(x, y);
    overlay.style.pointerEvents = 'auto';
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.backgroundColor;
      
      // Update color display
      colorDisplay.textContent = `Color: ${color}`;
      colorDisplay.style.backgroundColor = color;
      
      // Use contrasting text color for better visibility
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const brightness = (parseInt(rgbValues[0]) * 299 + 
                           parseInt(rgbValues[1]) * 587 + 
                           parseInt(rgbValues[2]) * 114) / 1000;
        colorDisplay.style.color = brightness > 128 ? 'black' : 'white';
      }
    }
  });
  
  // Handle click to select color
  overlay.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get the element under the cursor
    const x = e.clientX;
    const y = e.clientY;
    
    overlay.style.pointerEvents = 'none';
    const element = document.elementFromPoint(x, y);
    overlay.style.pointerEvents = 'auto';
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.backgroundColor;
      
      // Send color back to the popup
      chrome.runtime.sendMessage({color: color});
      
      // Cleanup
      document.body.removeChild(overlay);
      document.body.removeChild(colorDisplay);
    }
  });
  
  // Handle ESC key to cancel
  document.addEventListener('keydown', function onKeyDown(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.body.removeChild(colorDisplay);
      document.removeEventListener('keydown', onKeyDown);
    }
  });
}
