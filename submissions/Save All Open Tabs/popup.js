document.addEventListener('DOMContentLoaded', function() {
  // Load saved lists when popup opens
  loadSavedLists();
  
  // Save all tabs button
  document.getElementById('saveTabs').addEventListener('click', function() {
    saveAllTabs();
  });
  
  // Save current window tabs button
  document.getElementById('saveCurrentWindow').addEventListener('click', function() {
    saveCurrentWindowTabs();
  });
  
  // Export tabs button
  document.getElementById('exportTabs').addEventListener('click', function() {
    exportTabsAsFile();
  });
});

// Save all tabs from all windows
function saveAllTabs() {
  chrome.tabs.query({}, function(tabs) {
    saveTabs(tabs, 'All Tabs');
  });
}

// Save tabs from the current window only
function saveCurrentWindowTabs() {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    saveTabs(tabs, 'Current Window');
  });
}

// Common function to save tabs
function saveTabs(tabs, listName) {
  const timestamp = new Date().toLocaleString();
  const listId = 'list_' + Date.now();
  const tabData = tabs.map(tab => ({
    url: tab.url,
    title: tab.title
  }));
  
  const savedList = {
    id: listId,
    name: listName + ' - ' + timestamp,
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
    
    chrome.storage.local.set({savedTabLists: savedTabLists}, function() {
      loadSavedLists();
    });
  });
}

// Export tabs as a text file
function exportTabsAsFile() {
  chrome.tabs.query({}, function(tabs) {
    let content = '';
    tabs.forEach(tab => {
      content += tab.title + '\n' + tab.url + '\n\n';
    });
    
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    chrome.downloads.download({
      url: url,
      filename: 'tabs_' + timestamp + '.txt',
      saveAs: true
    });
  });
}

// Load and display saved lists
function loadSavedLists() {
  const savedListsElement = document.getElementById('savedLists');
  savedListsElement.innerHTML = '';
  
  chrome.storage.local.get(['savedTabLists'], function(result) {
    const savedTabLists = result.savedTabLists || [];
    
    if (savedTabLists.length === 0) {
      savedListsElement.innerHTML = '<p>No saved lists yet.</p>';
      return;
    }
    
    savedTabLists.forEach(list => {
      const listElement = document.createElement('div');
      listElement.className = 'list-item';
      
      const listHeader = document.createElement('div');
      listHeader.innerHTML = `<strong>${list.name}</strong> (${list.tabs.length} tabs)`;
      
      const actions = document.createElement('div');
      actions.style.marginTop = '3px';
      
      // Create button to restore tabs
      const restoreButton = document.createElement('button');
      restoreButton.textContent = 'Restore';
      restoreButton.style.padding = '2px 5px';
      restoreButton.style.marginRight = '5px';
      restoreButton.style.width = 'auto';
      restoreButton.addEventListener('click', function() {
        list.tabs.forEach(tab => {
          chrome.tabs.create({url: tab.url, active: false});
        });
      });
      
      // Create button to delete list
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.style.padding = '2px 5px';
      deleteButton.style.backgroundColor = '#f44336';
      deleteButton.style.width = 'auto';
      deleteButton.addEventListener('click', function() {
        chrome.storage.local.get(['savedTabLists'], function(result) {
          let savedTabLists = result.savedTabLists || [];
          savedTabLists = savedTabLists.filter(item => item.id !== list.id);
          chrome.storage.local.set({savedTabLists: savedTabLists}, function() {
            loadSavedLists();
          });
        });
      });
      
      actions.appendChild(restoreButton);
      actions.appendChild(deleteButton);
      
      listElement.appendChild(listHeader);
      listElement.appendChild(actions);
      savedListsElement.appendChild(listElement);
    });
  });
}
