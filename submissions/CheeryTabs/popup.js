document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('save-button');
  const openAllButton = document.getElementById('open-all-button');
  const favoritesList = document.getElementById('favorites-list');
  const noFavoritesMessage = document.getElementById('no-favorites');
  
  // Load saved favorites when popup opens
  loadFavorites();
  
  // Add event listeners
  saveButton.addEventListener('click', saveCurrentTab);
  openAllButton.addEventListener('click', openAllFavorites);
  
  // Function to save current tab
  function saveCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Get existing favorites from storage
      chrome.storage.sync.get(['favorites'], function(result) {
        let favorites = result.favorites || [];
        
        // Check if URL already exists in favorites
        const urlExists = favorites.some(favorite => favorite.url === currentTab.url);
        
        if (!urlExists) {
          // Add new favorite
          favorites.push({
            title: currentTab.title,
            url: currentTab.url,
            timestamp: Date.now()
          });
          
          // Save updated favorites list
          chrome.storage.sync.set({favorites: favorites}, function() {
            loadFavorites();
          });
        } else {
          alert('This website is already in your favorites!');
        }
      });
    });
  }
  
  // Function to load and display favorites
  function loadFavorites() {
    chrome.storage.sync.get(['favorites'], function(result) {
      const favorites = result.favorites || [];
      
      // Clear the list
      favoritesList.innerHTML = '';
      
      // Show message if no favorites
      if (favorites.length === 0) {
        noFavoritesMessage.style.display = 'block';
        return;
      } else {
        noFavoritesMessage.style.display = 'none';
      }
      
      // Add each favorite to the list
      favorites.forEach(function(favorite, index) {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        
        const favoriteTitle = document.createElement('div');
        favoriteTitle.className = 'favorite-title';
        favoriteTitle.textContent = favorite.title;
        favoriteTitle.addEventListener('click', function() {
          openFavorite(favorite.url);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', function(event) {
          event.stopPropagation();
          deleteFavorite(index);
        });
        
        favoriteItem.appendChild(favoriteTitle);
        favoriteItem.appendChild(deleteButton);
        favoritesList.appendChild(favoriteItem);
      });
    });
  }
  
  // Function to open a favorite
  function openFavorite(url) {
    chrome.tabs.create({url: url});
  }
  
  // Function to delete a favorite
  function deleteFavorite(index) {
    chrome.storage.sync.get(['favorites'], function(result) {
      let favorites = result.favorites || [];
      
      // Remove the favorite at the specified index
      favorites.splice(index, 1);
      
      // Save updated favorites list
      chrome.storage.sync.set({favorites: favorites}, function() {
        loadFavorites();
      });
    });
  }
  
  // Function to open all favorites in new tabs
  function openAllFavorites() {
    chrome.storage.sync.get(['favorites'], function(result) {
      const favorites = result.favorites || [];
      
      if (favorites.length === 0) {
        alert('No favorites to open!');
        return;
      }
      
      // Open each favorite in a new tab
      favorites.forEach(function(favorite) {
        chrome.tabs.create({url: favorite.url});
      });
    });
  }
});
