// Function to list all open tabs
function listTabs(tabs) {
  const tabsList = document.getElementById('tabs-list');
  tabsList.innerHTML = '';  // Clear the list

  tabs.forEach(tab => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" data-tab-id="${tab.id}" />
      <span>${tab.title}</span>
      <button class="pin-btn" data-tab-id="${tab.id}">
        ${tab.pinned ? 'Unpin' : 'Pin'}
      </button>
      <button class="mute-btn" data-tab-id="${tab.id}">
        ${tab.mutedInfo.muted ? 'Unmute' : 'Mute'}
      </button>
    `;
    tabsList.appendChild(li);

    // Add event listener for pin/unpin button
    const pinButton = li.querySelector('.pin-btn');
    pinButton.addEventListener('click', (event) => {
      const tabId = event.target.getAttribute('data-tab-id');
      togglePinTab(parseInt(tabId));
    });

    // Add event listener for mute/unmute button
    const muteButton = li.querySelector('.mute-btn');
    muteButton.addEventListener('click', (event) => {
      const tabId = event.target.getAttribute('data-tab-id');
      toggleMuteTab(parseInt(tabId));
    });
  });
}

// Function to toggle pin/unpin on a tab
function togglePinTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const isPinned = tab.pinned;
    chrome.tabs.update(tabId, { pinned: !isPinned });
  });
}

// Function to toggle mute/unmute on a tab
function toggleMuteTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const isMuted = tab.mutedInfo.muted;
    chrome.tabs.update(tabId, { muted: !isMuted });
  });
}

// Function to sort tabs alphabetically by title
function sortTabsAlphabetically(tabs) {
  return tabs.sort((a, b) => a.title.localeCompare(b.title));
}

// Function to close all tabs except the current one
function closeAllExceptCurrent() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const currentTabId = tabs.find(tab => tab.active).id;
    tabs.forEach(tab => {
      if (tab.id !== currentTabId) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

// Function to close selected tabs
function closeSelectedTabs() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    const tabId = parseInt(checkbox.getAttribute('data-tab-id'));
    chrome.tabs.remove(tabId);
  });
}

// Function to mute selected tabs
function muteSelectedTabs() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    const tabId = parseInt(checkbox.getAttribute('data-tab-id'));
    toggleMuteTab(tabId);  // Mute or unmute based on current state
  });
}

// Event listeners for buttons
document.getElementById('sort-tabs').addEventListener('click', () => {
  chrome.tabs.query({}, (tabs) => {
    const sortedTabs = sortTabsAlphabetically(tabs);
    listTabs(sortedTabs); // Re-render the tabs after sorting
  });
});
document.getElementById('close-all-except').addEventListener('click', closeAllExceptCurrent);
document.getElementById('close-selected').addEventListener('click', closeSelectedTabs);
document.getElementById('mute-selected').addEventListener('click', muteSelectedTabs);

// Listen for search input to filter tabs
document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const tabsList = document.getElementById('tabs-list');
  const tabs = tabsList.getElementsByTagName('li');
  
  Array.from(tabs).forEach(li => {
    const title = li.textContent.toLowerCase();
    li.style.display = title.includes(query) ? '' : 'none';
  });
});

// Initial tab list render
chrome.tabs.query({}, (tabs) => {
  listTabs(tabs);
});
// Function to list all open tabs
function listTabs(tabs) {
  const tabsList = document.getElementById('tabs-list');
  tabsList.innerHTML = '';  // Clear the list

  tabs.forEach(tab => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" data-tab-id="${tab.id}" />
      <span>${tab.title}</span>
      <button class="pin-btn" data-tab-id="${tab.id}">
        ${tab.pinned ? 'Unpin' : 'Pin'}
      </button>
      <button class="mute-btn" data-tab-id="${tab.id}">
        ${tab.mutedInfo.muted ? 'Unmute' : 'Mute'}
      </button>
    `;
    tabsList.appendChild(li);

    // Add event listener for pin/unpin button
    const pinButton = li.querySelector('.pin-btn');
    pinButton.addEventListener('click', (event) => {
      const tabId = event.target.getAttribute('data-tab-id');
      togglePinTab(parseInt(tabId));
    });

    // Add event listener for mute/unmute button
    const muteButton = li.querySelector('.mute-btn');
    muteButton.addEventListener('click', (event) => {
      const tabId = event.target.getAttribute('data-tab-id');
      toggleMuteTab(parseInt(tabId));
    });
  });
}

// Function to toggle pin/unpin on a tab
function togglePinTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const isPinned = tab.pinned;
    chrome.tabs.update(tabId, { pinned: !isPinned });
  });
}

// Function to toggle mute/unmute on a tab
function toggleMuteTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const isMuted = tab.mutedInfo.muted;
    chrome.tabs.update(tabId, { muted: !isMuted });
  });
}

// Function to sort tabs alphabetically by title
function sortTabsAlphabetically(tabs) {
  return tabs.sort((a, b) => a.title.localeCompare(b.title));
}

// Function to close all tabs except the current one
function closeAllExceptCurrent() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const currentTabId = tabs.find(tab => tab.active).id;
    tabs.forEach(tab => {
      if (tab.id !== currentTabId) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

// Function to close selected tabs
function closeSelectedTabs() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    const tabId = parseInt(checkbox.getAttribute('data-tab-id'));
    chrome.tabs.remove(tabId);
  });
}

// Function to mute selected tabs
function muteSelectedTabs() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    const tabId = parseInt(checkbox.getAttribute('data-tab-id'));
    toggleMuteTab(tabId);  // Mute or unmute based on current state
  });
}

// Event listeners for buttons
document.getElementById('sort-tabs').addEventListener('click', () => {
  chrome.tabs.query({}, (tabs) => {
    const sortedTabs = sortTabsAlphabetically(tabs);
    listTabs(sortedTabs); // Re-render the tabs after sorting
  });
});
document.getElementById('close-all-except').addEventListener('click', closeAllExceptCurrent);
document.getElementById('close-selected').addEventListener('click', closeSelectedTabs);
document.getElementById('mute-selected').addEventListener('click', muteSelectedTabs);

// Listen for search input to filter tabs
document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const tabsList = document.getElementById('tabs-list');
  const tabs = tabsList.getElementsByTagName('li');
  
  Array.from(tabs).forEach(li => {
    const title = li.textContent.toLowerCase();
    li.style.display = title.includes(query) ? '' : 'none';
  });
});

// Initial tab list render
chrome.tabs.query({}, (tabs) => {
  listTabs(tabs);
});
