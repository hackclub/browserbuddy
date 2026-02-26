// Content script for Cherry Tabs extension

// Listen for keyboard shortcut Ctrl+Shift+S to quick save
document.addEventListener('keydown', function(event) {
  // Check if Ctrl+Shift+S was pressed (Cmd+Shift+S on Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
    event.preventDefault(); // Prevent the browser's save dialog
    
    // Send message to background script to save the current page
    chrome.runtime.sendMessage({action: 'quickSave'}, function(response) {
      if (response && response.success) {
        // Show a temporary notification
        showNotification('Page saved to Cherry Tabs favorites!');
      } else if (response) {
        // Show error message
        showNotification(response.message);
      }
    });
  }
});

// Function to show a temporary notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#d32f2f';
  notification.style.color = 'white';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(function() {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    
    // Remove from DOM after fade out
    setTimeout(function() {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
