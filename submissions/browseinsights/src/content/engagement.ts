/**
 * BrowseInsight - Content Engagement Tracker
 * 
 * Monitors user engagement with the current page
 */

// Initialize the engagement tracker
(function() {
  let scrollDepth = 0;
  let interactions = 0;
  let pageHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  
  // Track scroll depth
  document.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const currentScrollDepth = Math.min(100, Math.round((scrollPosition / pageHeight) * 100));
    
    if (currentScrollDepth > scrollDepth) {
      scrollDepth = currentScrollDepth;
      
      // Only send updates for significant changes to reduce overhead
      if (scrollDepth % 25 === 0) {
        sendEngagementUpdate();
      }
    }
  });
  
  // Track clicks
  document.addEventListener('click', () => {
    interactions++;
    
    // Send update after every 5 interactions
    if (interactions % 5 === 0) {
      sendEngagementUpdate();
    }
  });
  
  // Track key presses (for form interactions)
  document.addEventListener('keydown', () => {
    interactions++;
    
    // Send update after every 10 key presses
    if (interactions % 10 === 0) {
      sendEngagementUpdate();
    }
  });
  
  // Calculate engagement score
  function calculateEngagementScore(): number {
    // Simple formula: 50% scroll depth + 50% interactions (capped at 10)
    const scrollFactor = scrollDepth / 100;
    const interactionFactor = Math.min(interactions / 10, 1);
    
    return (scrollFactor * 0.5) + (interactionFactor * 0.5);
  }
  
  // Send engagement updates to background script
  function sendEngagementUpdate() {
    chrome.runtime.sendMessage({
      type: 'engagementUpdate',
      data: {
        scrollDepth,
        interactions,
        engagementScore: calculateEngagementScore()
      }
    });
  }
  
  // Send initial update
  setTimeout(() => {
    sendEngagementUpdate();
  }, 2000);
  
  // Send final update before page unload
  window.addEventListener('beforeunload', () => {
    sendEngagementUpdate();
  });
})();