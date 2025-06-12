// content.js

// Listen for messages from the webpage
window.addEventListener('message', function (event) {
    if (event.source === window && event.data.from === 'your_website') {
      // Send a message to the background script (Service Worker)
      console.log(event.data.user)
      chrome.runtime.sendMessage({ redirect: event.data.user }, function (response) {
        // This callback function is optional, you can handle the response if needed.
        if (response && response.success) {
          console.log('Redirection successful!');
        }
      });
    }
    if (event.source === window && event.data.from === 'replauth') {
      // Send a message to the background script (Service Worker)
      console.log(event.data.user)
      chrome.runtime.sendMessage({ replit: JSON.stringify(event.data.info) }, function (response) {
        // This callback function is optional, you can handle the response if needed.
        if (response && response.success) {
          console.log('Redirection successful!');
        }
      });
    }
  });
  