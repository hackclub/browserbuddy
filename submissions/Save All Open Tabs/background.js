chrome.commands.onCommand.addListener(function(command) {
  if (command === "save-tabs") {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      const timestamp = new Date().toLocaleString();
      const listId = 'list_' + Date.now();
      const tabData = tabs.map(tab => ({
        url: tab.url,
        title: tab.title
      }));
      
      const savedList = {
        id: listId,
        name: 'Quick Save - ' + timestamp,
        tabs: tabData
      };
      
      // Save to storage
      chrome.storage.local.get(['savedTabLists'], function(result) {
        let savedTabLists = result.savedTabLists || [];
        savedTabLists.unshift(savedList);
        
        // Limit to 10 saved lists
        if (savedTabLists.length > 10) {
          savedTabLists = savedTabLists.slice(0, 10);
        }
        
        chrome.storage.local.set({savedTabLists: savedTabLists});
      });
    });
  }
});
