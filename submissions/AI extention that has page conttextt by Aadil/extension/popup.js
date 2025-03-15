document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('sendPageContent').addEventListener('click', function() {
    // Send a message to the content script to get the page HTML
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        showStatus("No active tab found", "error");
        return;
      }
      
      showStatus("Retrieving page content...", "info");
      
      chrome.tabs.sendMessage(tabs[0].id, {action: "getPageContent"}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus("Error: " + chrome.runtime.lastError.message, "error");
          return;
        }
        
        if (response && response.html) {
          showStatus("Sending content to Browser Buddy...", "info");
          
          // Send the HTML to the local server
          fetch('http://localhost:9222/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: tabs[0].url,
              html: response.html
            })
          })
          .then(response => {
            if (response.ok) {
              showStatus("Content successfully sent to Browser Buddy!", "success");
            } else {
              showStatus("Error sending content to Browser Buddy", "error");
            }
          })
          .catch(error => {
            showStatus("Connection error. Is Browser Buddy running?", "error");
            console.error('Error:', error);
          });
        } else {
          showStatus("Could not retrieve page content", "error");
        }
      });
    });
  });
});

function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = 'status ' + type;
  statusElement.style.display = 'block';
  
  // Hide success and info messages after 3 seconds, keep error messages
  if (type !== "error") {
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}
