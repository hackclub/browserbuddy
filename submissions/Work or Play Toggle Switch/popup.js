document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('modeToggle');
  const currentModeElement = document.getElementById('currentMode');
  const timeSpentElement = document.getElementById('timeSpent');
  
  // Get current mode
  chrome.runtime.sendMessage({ action: 'getMode' }, (response) => {
    currentModeElement.textContent = capitalizeFirstLetter(response.mode);
    modeToggle.checked = response.mode === 'play';
  });
  
  // Toggle mode
  modeToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'toggleMode' }, (response) => {
      currentModeElement.textContent = capitalizeFirstLetter(response.mode);
      loadAnalytics();
    });
  });
  
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Show selected tab content
      const tabId = button.getAttribute('data-tab') + 'Stats';
      document.getElementById(tabId).style.display = 'block';
    });
  });
  
  // Load analytics on popup open
  loadAnalytics();
  
  // Helper function to format time
  function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Load analytics data
  function loadAnalytics() {
    chrome.runtime.sendMessage({ action: 'getAnalytics' }, (response) => {
      const analytics = response.analytics;
      
      // Update work stats
      document.getElementById('workTotalTime').textContent = formatTime(analytics.work.totalTime);
      document.getElementById('workSessions').textContent = analytics.work.sessions;
      
      // Update play stats
      document.getElementById('playTotalTime').textContent = formatTime(analytics.play.totalTime);
      document.getElementById('playSessions').textContent = analytics.play.sessions;
      
      // Get current mode for time spent
      chrome.runtime.sendMessage({ action: 'getMode' }, (modeResponse) => {
        const currentMode = modeResponse.mode;
        const sessionStartTime = Date.now() - (Date.now() % 60000); // Round to nearest minute
        const timeSpent = analytics[currentMode].totalTime + (Date.now() - sessionStartTime);
        timeSpentElement.textContent = formatTime(timeSpent);
      });
      
      // Update top sites lists
      updateTopSitesList('workTopSites', analytics.work.topSites);
      updateTopSitesList('playTopSites', analytics.play.topSites);
    });
  }
  
  // Update top sites list
  function updateTopSitesList(elementId, topSites) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = '';
    
    // Convert object to array for sorting
    const sitesArray = Object.entries(topSites).map(([domain, time]) => ({
      domain,
      time
    }));
    
    // Sort by time (descending)
    sitesArray.sort((a, b) => b.time - a.time);
    
    // Create list items for top 5 sites
    sitesArray.slice(0, 5).forEach(site => {
      const li = document.createElement('li');
      li.textContent = `${site.domain}: ${formatTime(site.time)}`;
      listElement.appendChild(li);
    });
    
    // If no sites, show message
    if (sitesArray.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No data yet';
      listElement.appendChild(li);
    }
  }
});
