
document.addEventListener('DOMContentLoaded', () => {
  const obituaryList = document.getElementById('obituary-list');
  const emptyState = document.getElementById('empty-state');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const popupToggle = document.getElementById('popup-toggle');
  const obituaryTemplate = document.getElementById('obituary-template');

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

  const renderObituaries = async () => {
    const data = await chrome.storage.local.get('obituaryLog');
    const obituaries = data.obituaryLog || [];
    obituaryList.innerHTML = '';

    if (obituaries.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    obituaries.forEach(obituary => {
      const obituaryNode = obituaryTemplate.content.cloneNode(true);
      
      obituaryNode.querySelector('.obituary-title').textContent = obituary.tabTitle || obituary.title;
      obituaryNode.querySelector('.obituary-date').textContent = formatDate(obituary.deathTime);
      obituaryNode.querySelector('.obituary-message').textContent = obituary.message;
      
      if (obituary.url) {
        const reopenButton = obituaryNode.querySelector('.reopen-tab');
        
        reopenButton.addEventListener('click', () => {
          chrome.tabs.create({ url: obituary.url });
        });
      }
      
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
      
      headerEl.addEventListener('click', (e) => {
        if (e.target !== toggleBtn) {
          toggleDetails();
        }
      });
      
      toggleBtn.addEventListener('click', toggleDetails);

      obituaryList.appendChild(obituaryNode);
    });

    const cards = obituaryList.querySelectorAll('.obituary-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  };

  clearAllBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all obituaries?')) {
      await chrome.storage.local.set({ obituaryLog: [] });
      renderObituaries();
      
      chrome.runtime.sendMessage({ action: 'resetBadgeCount' });
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.obituaryLog) {
      renderObituaries();
    }
  });

  const loadSettings = async () => {
    const data = await chrome.storage.local.get(['soundEnabled', 'popupEnabled']);
    
    if (data.hasOwnProperty('soundEnabled')) {
      soundToggle.checked = data.soundEnabled;
    } else {
      soundToggle.checked = true;
      await chrome.storage.local.set({ soundEnabled: true });
    }
    
    if (data.hasOwnProperty('popupEnabled')) {
      popupToggle.checked = data.popupEnabled;
    } else {
      popupToggle.checked = true;
      await chrome.storage.local.set({ popupEnabled: true });
    }
  };
  
  soundToggle.addEventListener('change', async () => {
    const isEnabled = soundToggle.checked;
    
    await chrome.storage.local.set({ soundEnabled: isEnabled });
    
    chrome.runtime.sendMessage({ 
      action: 'updateSoundSettings', 
      enabled: isEnabled 
    }, response => {
      if (isEnabled) {
        chrome.runtime.sendMessage({ action: 'testSound' });
      }
    });
  });
  
  popupToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ popupEnabled: popupToggle.checked });
    chrome.runtime.sendMessage({ action: 'updatePopupSettings', enabled: popupToggle.checked });
  });
  
  renderObituaries();
  loadSettings();
}); 