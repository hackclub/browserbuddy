document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("toggleSwitch");
    const blockCountElement = document.getElementById("blockCount");
    const statusIcon = document.getElementById("statusIcon");
    const statusText = document.getElementById("statusText");
  
    // Load saved state
    chrome.storage.local.get(["enabled", "blockCount"], function (result) {
      toggleSwitch.checked = result.enabled !== false;
      blockCountElement.textContent = result.blockCount || 0;
      updateStatusMessage(result.enabled !== false);
    });
  
    // Update status when toggle is clicked
    toggleSwitch.addEventListener("change", function () {
      const enabled = toggleSwitch.checked;
      chrome.storage.local.set({ enabled: enabled });
      updateStatusMessage(enabled);
    });
  
    // Update status message based on enabled state
    function updateStatusMessage(enabled) {
      if (enabled) {
        statusIcon.textContent = "✓";
        statusIcon.style.color = "#4CAF50";
        statusText.textContent = "Blocking enabled";
      } else {
        statusIcon.textContent = "✕";
        statusIcon.style.color = "#F44336";
        statusText.textContent = "Blocking disabled";
      }
    }
  
    // Listen for updates to the block count
    chrome.storage.onChanged.addListener(function (changes) {
      if (changes.blockCount) {
        blockCountElement.textContent = changes.blockCount.newValue;
      }
    });
  });
  