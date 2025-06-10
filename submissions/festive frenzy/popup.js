document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
  
    if (!toggleButton) {
      console.error('Error: toggleButton not found!');
      return;
    }
  
    chrome.storage.sync.get('snowfallEnabled', (data) => {
      if (data.snowfallEnabled === undefined) {
        chrome.storage.sync.set({ snowfallEnabled: true });
        toggleButton.textContent = 'DISABLE';
        chrome.runtime.sendMessage({ action: 'enable' });
      } else {
        if (data.snowfallEnabled) {
          toggleButton.textContent = 'DISABLE';
        } else {
          toggleButton.textContent = 'ENABLE';
        }
      }
    });
  
    toggleButton.addEventListener('click', () => {
      chrome.storage.sync.get('snowfallEnabled', (data) => {
        const newState = !data.snowfallEnabled;
        chrome.storage.sync.set({ snowfallEnabled: newState }, () => {
          if (newState) {
            toggleButton.textContent = 'DISABLE';
            chrome.runtime.sendMessage({ action: 'enable' });
          } else {
            toggleButton.textContent = 'ENABLE';
            chrome.runtime.sendMessage({ action: 'disable' });
          }
        });
      });
    });
  });