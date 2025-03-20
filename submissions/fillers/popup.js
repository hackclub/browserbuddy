document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('save-btn');
  const toggleBtn = document.getElementById('toggle-btn');
  const itemInput = document.getElementById('item-input');
  const savedItemsContainer = document.getElementById('saved-items');
  const extensionStatus = document.getElementById('extension-status');
  
  // Load saved items and extension status when popup opens
  loadSavedItems();
  checkExtensionStatus();
  
  // Save a new item
  saveBtn.addEventListener('click', function() {
    const text = itemInput.value.trim();
    if (text) {
      chrome.storage.local.get(['savedItems'], function(result) {
        const savedItems = result.savedItems || [];
        savedItems.push(text);
        
        chrome.storage.local.set({savedItems: savedItems}, function() {
          itemInput.value = '';
          loadSavedItems();
        });
      });
    }
  });
  
  // Toggle extension active state
  toggleBtn.addEventListener('click', function() {
    chrome.storage.local.get(['isActive'], function(result) {
      const newState = !result.isActive;
      chrome.storage.local.set({isActive: newState}, function() {
        updateStatusDisplay(newState);
        
        // Send message to background script to update active state
        chrome.runtime.sendMessage({action: 'toggleActive', isActive: newState});
      });
    });
  });
  
  // Load and display saved items
  function loadSavedItems() {
    chrome.storage.local.get(['savedItems'], function(result) {
      const savedItems = result.savedItems || [];
      savedItemsContainer.innerHTML = '';
      
      if (savedItems.length === 0) {
        savedItemsContainer.innerHTML = '<p>No saved items yet.</p>';
        return;
      }
      
      savedItems.forEach(function(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = item;
        textSpan.style.overflowWrap = 'break-word';
        textSpan.style.maxWidth = '200px';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
          deleteItem(index);
        });
        
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use';
        useBtn.addEventListener('click', function() {
          setCurrentItem(item);
        });
        
        itemElement.appendChild(textSpan);
        itemElement.appendChild(useBtn);
        itemElement.appendChild(deleteBtn);
        
        savedItemsContainer.appendChild(itemElement);
      });
    });
  }
  
  // Delete a saved item
  function deleteItem(index) {
    chrome.storage.local.get(['savedItems'], function(result) {
      const savedItems = result.savedItems || [];
      savedItems.splice(index, 1);
      
      chrome.storage.local.set({savedItems: savedItems}, function() {
        loadSavedItems();
      });
    });
  }
  
  // Set currently selected item for filling forms
  function setCurrentItem(text) {
    chrome.storage.local.set({currentItem: text}, function() {
      const statusElement = document.createElement('div');
      statusElement.textContent = 'Ready to use: "' + text + '"';
      statusElement.style.color = 'green';
      statusElement.style.marginTop = '10px';
      
      const existingStatus = document.querySelector('.current-status');
      if (existingStatus) {
        existingStatus.remove();
      }
      
      statusElement.className = 'current-status';
      document.body.appendChild(statusElement);
      
      // Send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'setCurrentItem', text: text});
      });
    });
  }
  
  // Check and display extension status
  function checkExtensionStatus() {
    chrome.storage.local.get(['isActive'], function(result) {
      const isActive = result.isActive || false;
      updateStatusDisplay(isActive);
    });
  }
  
  // Update status display
  function updateStatusDisplay(isActive) {
    extensionStatus.textContent = isActive ? 'Active' : 'Inactive';
    extensionStatus.className = isActive ? 'active' : 'inactive';
    toggleBtn.textContent = isActive ? 'Deactivate Extension' : 'Activate Extension';
  }
});
