document.addEventListener('DOMContentLoaded', function() {
  const activateBtn = document.getElementById('activate-btn');
  const deactivateBtn = document.getElementById('deactivate-btn');
  const status = document.getElementById('status');
  
  const statusMessages = {
    ready: "Ready to explore the cosmos...",
    activating: "Initializing galactic coordinates...",
    active: "🌌 Galactic mode active",
    deactivating: "Returning to Earth...",
    error: "⚠️ Cosmic interference detected"
  };
  
  function updateStatus(message, type = 'normal') {
    status.textContent = message;
    status.className = `status ${type}`;
  }
  
  function checkCurrentState() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'checkState'}, function(response) {
        if (chrome.runtime.lastError) {
          updateStatus(statusMessages.ready);
          activateBtn.style.display = 'block';
          deactivateBtn.style.display = 'none';
        } else if (response && response.isActive) {
          updateStatus(statusMessages.active, 'active');
          activateBtn.style.display = 'none';
          deactivateBtn.style.display = 'block';
        } else {
          updateStatus(statusMessages.ready);
          activateBtn.style.display = 'block';
          deactivateBtn.style.display = 'none';
        }
      });
    });
  }
  
  activateBtn.addEventListener('click', function() {
    updateStatus(statusMessages.activating, 'loading');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'activateGalacticMode'}, function(response) {
        if (chrome.runtime.lastError) {
          updateStatus(statusMessages.error, 'error');
          setTimeout(() => updateStatus(statusMessages.ready), 2000);
        } else {
          updateStatus(statusMessages.active, 'active');
          activateBtn.style.display = 'none';
          deactivateBtn.style.display = 'block';
          
          triggerCosmicActivation();
        }
      });
    });
  });
  
  deactivateBtn.addEventListener('click', function() {
    updateStatus(statusMessages.deactivating, 'loading');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'deactivateGalacticMode'}, function(response) {
        updateStatus(statusMessages.ready);
        activateBtn.style.display = 'block';
        deactivateBtn.style.display = 'none';
      });
    });
  });
  
  function triggerCosmicActivation() {
    const container = document.querySelector('.container');
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
      animation: cosmic-pulse 1.5s ease-out forwards;
      pointer-events: none;
      border-radius: 15px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cosmic-pulse {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
      style.remove();
    }, 1500);
  }
  
  checkCurrentState();
  
  const blackHole = document.querySelector('.black-hole');
  if (blackHole) {
    blackHole.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'triggerCosmicEvent', event: 'supernova'});
      });
    });
  }
});
