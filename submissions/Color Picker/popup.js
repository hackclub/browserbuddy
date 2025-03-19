document.addEventListener('DOMContentLoaded', function() {
  const activateButton = document.getElementById('activate');
  const colorPreview = document.getElementById('color-preview');
  const colorValue = document.getElementById('color-value');
  
  activateButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: pickColor
      });
    });
  });
  
  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.color) {
      // Update the color preview
      colorPreview.style.backgroundColor = request.color;
      // Display the color value
      colorValue.textContent = request.color;
    }
  });
});

// Function to be injected into the page
function pickColor() {
  // Track if the eyedropper is active
  let isActive = true;
  
  // Show notification to the user
  const notification = document.createElement('div');
  notification.textContent = 'Click anywhere to pick a color. Press ESC to cancel.';
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '10px';
  notification.style.backgroundColor = 'black';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  document.body.appendChild(notification);
  
  // Function to clean up event listeners
  function cleanup() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeyDown);
    document.body.removeChild(notification);
    isActive = false;
  }
  
  // Handle ESC key to cancel
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }
  
  // Handle mouse movement to track color
  function onMouseMove(e) {
    if (!isActive) return;
    
    // Create a canvas to get the pixel color
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const x = e.clientX;
    const y = e.clientY;
    
    // Take a small screenshot around the cursor position
    canvas.width = 1;
    canvas.height = 1;
    
    // Draw the pixel at the cursor position to the canvas
    context.drawWindow(window, x, y, 1, 1, 'rgb(255,255,255)');
    
    // Get the pixel data
    try {
      const pixelData = context.getImageData(0, 0, 1, 1).data;
      const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
      
      // Update the notification with the current color
      notification.textContent = `Color: ${color}. Click to select. Press ESC to cancel.`;
      notification.style.backgroundColor = color;
      
      // Use contrasting text color
      const brightness = (pixelData[0] * 299 + pixelData[1] * 587 + pixelData[2] * 114) / 1000;
      notification.style.color = brightness > 128 ? 'black' : 'white';
    } catch (error) {
      // Handle security exceptions when trying to get colors from certain elements
      notification.textContent = 'Cannot access color from this element. Try elsewhere.';
    }
  }
  
  // Handle click to select the color
  function onClick(e) {
    e.preventDefault();
    
    // Use getComputedStyle to get the element's background color
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    
    // Send the color back to the popup
    chrome.runtime.sendMessage({color: bgColor});
    
    cleanup();
  }
  
  // Add event listeners
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeyDown);
}
