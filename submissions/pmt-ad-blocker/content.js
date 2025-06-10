// Check if extension is enabled before running
chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled) {
      // Function to remove sidebar
      const removeSidebar = () => {
        const sidebar = document.querySelector(".pdf-sidebar");
        if (sidebar) {
          sidebar.remove();
          // Increment block count
          chrome.storage.local.get(["blockCount"], (result) => {
            const newCount = (result.blockCount || 0) + 1;
            chrome.storage.local.set({ blockCount: newCount });
          });
          return true;
        }
        return false;
      };
  
      // Try removing sidebar immediately if it exists
      let removed = removeSidebar();
  
      // If not successful, wait for DOM to be fully loaded
      if (!removed) {
        // Set up a mutation observer to catch elements that might be loaded dynamically
        const observer = new MutationObserver((mutations) => {
          if (removeSidebar()) {
            observer.disconnect();
          }
        });
  
        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
  
        // Set a timeout to stop observing after 10 seconds
        setTimeout(() => {
          observer.disconnect();
        }, 10000);
      }
    }
  });
  