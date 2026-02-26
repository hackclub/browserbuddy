document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  
  // Check current status
  chrome.runtime.sendMessage({action: "getStatus"}, function(response) {
    if (response && response.isActive) {
      statusDiv.textContent = "Status: Active";
    } else {
      statusDiv.textContent = "Status: Inactive";
    }
  });
  
  // Start quotes
  startBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "startQuotes"}, function(response) {
      if (response && response.status === "success") {
        statusDiv.textContent = "Status: Active";
      }
    });
  });
  
  // Stop quotes
  stopBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "stopQuotes"}, function(response) {
      if (response && response.status === "success") {
        statusDiv.textContent = "Status: Inactive";
      }
    });
  });
});
