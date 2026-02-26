// Function to format time in a human-readable format
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Update the popup with current stats
function updateStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
    if (!response) return;
    
    // Update tab count
    document.getElementById('tab-count').textContent = response.tabCount || 0;
    
    // Update code file count
    document.getElementById('code-count').textContent = response.codeFileCount || 0;
    
    // Update average time
    document.getElementById('avg-time').textContent = formatTime(response.avgTimeOpen || 0);
    
    // Update longest tab info
    if (response.longestTabInfo) {
      const title = response.longestTabInfo.title || 'Untitled';
      document.getElementById('longest-tab-info').textContent = title;
      document.getElementById('longest-tab-time').textContent = 
        `Open for ${formatTime(response.longestTime)}`;
    } else {
      document.getElementById('longest-tab-info').textContent = 'No tabs';
      document.getElementById('longest-tab-time').textContent = '';
    }
  });
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  
  // Refresh stats every second while popup is open
  const statsInterval = setInterval(updateStats, 1000);
  
  // Clear interval when popup closes
  window.addEventListener('unload', () => {
    clearInterval(statsInterval);
  });
});
