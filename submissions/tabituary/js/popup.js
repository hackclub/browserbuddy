// ==============================
// Tabituary - Popup Script
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  const obituaryList = document.getElementById('obituary-list');
  const emptyState = document.getElementById('empty-state');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const popupToggle = document.getElementById('popup-toggle');
  const obituaryTemplate = document.getElementById('obituary-template');

  // Format date helper function
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Render obituaries
  const renderObituaries = async () => {
    // Get obituaries from storage
    const data = await chrome.storage.local.get('obituaryLog');
    const obituaries = data.obituaryLog || [];

    // Clear loading state
    obituaryList.innerHTML = '';

    if (obituaries.length === 0) {
      // Show empty state
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    // Render each obituary
    obituaries.forEach(obituary => {
      const obituaryNode = obituaryTemplate.content.cloneNode(true);
      
      // Set obituary content - use original tab title for the header
      obituaryNode.querySelector('.obituary-title').textContent = obituary.tabTitle || obituary.title;
      obituaryNode.querySelector('.obituary-date').textContent = formatDate(obituary.deathTime);
      obituaryNode.querySelector('.obituary-message').textContent = obituary.message;
      
      // Add resurrection button functionality
      if (obituary.url) {
        const reopenButton = obituaryNode.querySelector('.reopen-tab');
        
        reopenButton.addEventListener('click', () => {
          chrome.tabs.create({ url: obituary.url });
        });
      }
      
      // Add toggle functionality
      const headerEl = obituaryNode.querySelector('.obituary-header');
      const toggleBtn = obituaryNode.querySelector('.toggle-details');
      const detailsEl = obituaryNode.querySelector('.obituary-details');
      
      const toggleDetails = () => {
        const isExpanded = detailsEl.classList.contains('expanded');
        
        if (isExpanded) {
          detailsEl.classList.remove('expanded');
          toggleBtn.classList.remove('expanded');
          toggleBtn.textContent = '▼';
        } else {
          detailsEl.classList.add('expanded');
          toggleBtn.classList.add('expanded');
          toggleBtn.textContent = '▲';
        }
      };
      
      // Toggle on header click
      headerEl.addEventListener('click', (e) => {
        // Don't toggle if clicking the button directly
        if (e.target !== toggleBtn) {
          toggleDetails();
        }
      });
      
      // Toggle on button click
      toggleBtn.addEventListener('click', toggleDetails);

      obituaryList.appendChild(obituaryNode);
    });

    // Add fade-in animation delay to each card
    const cards = obituaryList.querySelectorAll('.obituary-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  };

  // Clear all obituaries
  clearAllBtn.addEventListener('click', async () => {
    // Confirm before clearing
    if (confirm('Are you sure you want to clear all obituaries?')) {
      await chrome.storage.local.set({ obituaryLog: [] });
      renderObituaries();
      
      // Reset badge count
      chrome.runtime.sendMessage({ action: 'resetBadgeCount' });
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.obituaryLog) {
      renderObituaries();
    }
  });

  // Load settings
  const loadSettings = async () => {
    const data = await chrome.storage.local.get(['soundEnabled', 'popupEnabled']);
    
    // Set sound toggle state
    if (data.hasOwnProperty('soundEnabled')) {
      soundToggle.checked = data.soundEnabled;
    } else {
      // Default to enabled if not set
      soundToggle.checked = true;
      await chrome.storage.local.set({ soundEnabled: true });
    }
    
    // Set popup toggle state
    if (data.hasOwnProperty('popupEnabled')) {
      popupToggle.checked = data.popupEnabled;
    } else {
      // Default to enabled if not set
      popupToggle.checked = true;
      await chrome.storage.local.set({ popupEnabled: true });
    }
  };
  
  // Handle sound toggle
  soundToggle.addEventListener('change', async () => {
    const isEnabled = soundToggle.checked;
    
    // Save to storage
    await chrome.storage.local.set({ soundEnabled: isEnabled });
    
    // Notify the background script of the change
    chrome.runtime.sendMessage({ 
      action: 'updateSoundSettings', 
      enabled: isEnabled 
    }, response => {
      // Play a test sound if sound was enabled
      if (isEnabled) {
        chrome.runtime.sendMessage({ action: 'testSound' });
      }
    });
  });
  
  // Handle popup toggle
  popupToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ popupEnabled: popupToggle.checked });
    // Notify the background script of the change
    chrome.runtime.sendMessage({ action: 'updatePopupSettings', enabled: popupToggle.checked });
  });
  
  // Initial render and load settings
  renderObituaries();
  loadSettings();
}); 