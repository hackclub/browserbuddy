// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // First check if we need to redirect to pixel UI
  chrome.storage.sync.get(['uiMode'], (result) => {
    if (result.uiMode === 'pixel') {
      window.location.href = '/html/pixel-popup.html';
      return;
    }

    // Continue with classic UI initialization
    initClassicUI();
  });
});

function initClassicUI() {
  // Load saved settings after DOM is fully loaded
  chrome.storage.sync.get(['enabled', 'showTime', 'isPaused', 'targetTime', 'opacity'], (result) => {
    document.getElementById('toggleEnabled').checked = result.enabled !== false;
    document.getElementById('showTime').checked = result.showTime !== false;
    
    // Set time inputs
    const targetTime = result.targetTime || { hours: 2, minutes: 0 };
    document.getElementById('hoursInput').value = targetTime.hours;
    document.getElementById('minutesInput').value = targetTime.minutes;

    // Set opacity
    const opacity = result.opacity || 70;
    document.getElementById('opacityControl').value = opacity;
    document.getElementById('opacityValue').textContent = `${opacity}%`;
    
    updatePauseButtonText(result.isPaused || false);
    updatePauseButtonState(result.enabled !== false);
  });

  // Load color settings
  chrome.storage.sync.get(['colorStages'], (result) => {
    const defaultColors = [
      { hue: 240, hex: '#0000FF' }, // Blue
      { hue: 120, hex: '#00FF00' }, // Green
      { hue: 270, hex: '#8A2BE2' }, // Purple
      { hue: 0, hex: '#FF0000' }    // Red
    ];
    
    const colors = result.colorStages || defaultColors;
    colors.forEach((color, index) => {
      document.getElementById(`color${index + 1}`).value = color.hex;
    });
  });

  // Add UI mode switcher
  const header = document.querySelector('h3');
  const uiSwitcher = document.createElement('div');
  uiSwitcher.className = 'ui-switcher';
  uiSwitcher.innerHTML = `
    <button id="pixelUiToggle" class="btn btn-secondary btn-small" title="Switch to Minecraft UI">
      Pixel UI
    </button>
  `;
  
  // Insert after the header
  header.parentNode.insertBefore(uiSwitcher, header.nextSibling);
  
  // Add event listener to the UI toggle button
  document.getElementById('pixelUiToggle').addEventListener('click', () => {
    // Switch to pixel UI
    chrome.runtime.sendMessage({ 
      type: 'switchUI',
      uiMode: 'pixel'
    }, () => {
      window.location.href = '/html/pixel-popup.html';
    });
  });

  // Save settings
  document.getElementById('toggleEnabled').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.sync.set({ enabled }, () => {
      chrome.runtime.sendMessage({ 
        type: 'settingsUpdated',
        data: { enabled }
      });
      updatePauseButtonState(enabled);
      updateTabsVisibility();
    });
  });

  document.getElementById('showTime').addEventListener('change', (e) => {
    const showTime = e.target.checked;
    const enabled = document.getElementById('toggleEnabled').checked;
    chrome.storage.sync.set({ showTime }, () => {
      updateTabsVisibility();
    });
  });

  // Opacity control
  document.getElementById('opacityControl').addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value);
    document.getElementById('opacityValue').textContent = `${opacity}%`;
    chrome.storage.sync.set({ opacity }, () => {
      chrome.runtime.sendMessage({ 
        type: 'opacityUpdated',
        opacity: opacity
      });
    });
  });

  // Time input controls
  document.getElementById('hoursInput').addEventListener('change', updateTargetTime);
  document.getElementById('minutesInput').addEventListener('change', updateTargetTime);

  // Timer controls
  document.getElementById('resetTimer').addEventListener('click', () => {
    chrome.storage.local.set({ totalSeconds: 0 }, () => {
      chrome.runtime.sendMessage({ type: 'resetTimer' });
    });
  });

  document.getElementById('pauseTimer').addEventListener('click', () => {
    chrome.storage.sync.get(['isPaused'], (result) => {
      const newPausedState = !result.isPaused;
      chrome.storage.sync.set({ isPaused: newPausedState }, () => {
        chrome.runtime.sendMessage({ 
          type: 'togglePause', 
          isPaused: newPausedState 
        });
        updatePauseButtonText(newPausedState);
      });
    });
  });

  // Color picker event listeners
  ['color1', 'color2', 'color3', 'color4'].forEach((id, index) => {
    document.getElementById(id).addEventListener('change', (e) => {
      updateColors();
    });
  });

  // Reset colors button
  document.getElementById('resetColors').addEventListener('click', () => {
    const defaultColors = [
      { hue: 240, hex: '#0000FF' }, // Blue
      { hue: 120, hex: '#00FF00' }, // Green
      { hue: 270, hex: '#8A2BE2' }, // Purple
      { hue: 0, hex: '#FF0000' }    // Red
    ];
    
    defaultColors.forEach((color, index) => {
      document.getElementById(`color${index + 1}`).value = color.hex;
    });
    
    updateColors();
  });
}

// Helper function to safely update tab visibility
function updateTabsVisibility() {
  const enabled = document.getElementById('toggleEnabled').checked;
  const showTime = document.getElementById('showTime').checked;
  
  // First, update storage to ensure consistent state
  chrome.storage.sync.set({ enabled, showTime }, () => {
    // Then update all tabs with the new visibility state
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url?.startsWith("http")) {
          try {
            // If timer is disabled, we'll explicitly hide everything
            if (!enabled) {
              chrome.tabs.sendMessage(tab.id, {
                type: 'forceDisable',
                seconds: 0 // Send 0 to prevent 00:00 display
              }).catch(() => {}); // Silently handle rejected promises
            } else {
              // Otherwise, update visibility based on showTime setting
              chrome.tabs.sendMessage(tab.id, {
                type: 'updateVisibility',
                showTime: showTime
              }).catch(() => {}); // Silently handle rejected promises
            }
          } catch (error) {
            console.debug('Tab not ready:', tab.id);
          }
        }
      });
    });
  });
}

// Time input controls
function updateTargetTime() {
  const hours = parseInt(document.getElementById('hoursInput').value) || 0;
  const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
  const targetTime = { hours, minutes };
  
  chrome.storage.sync.set({ targetTime }, () => {
    chrome.runtime.sendMessage({ 
      type: 'timeSettingsUpdated',
      targetTime
    });
  });
}

// Helper functions
function updatePauseButtonText(isPaused) {
  const pauseButton = document.getElementById('pauseTimer');
  if (pauseButton) {
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    pauseButton.classList.toggle('btn-primary', isPaused);
    pauseButton.classList.toggle('btn-secondary', !isPaused);
  }
}

function updatePauseButtonState(enabled) {
  const pauseButton = document.getElementById('pauseTimer');
  if (pauseButton) {
    pauseButton.disabled = !enabled;
    pauseButton.style.opacity = enabled ? '1' : '0.5';
  }
}

// Helper function to convert hex to HSL hue
function hexToHue(hex) {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h;
  if (max === min) {
    h = 0;
  } else {
    const d = max - min;
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }
  
  return h < 0 ? h + 360 : h;
}

// Function to update color settings
function updateColors() {
  const colorStages = [1, 2, 3, 4].map(num => {
    const hex = document.getElementById(`color${num}`).value;
    return {
      hex: hex,
      hue: hexToHue(hex)
    };
  });

  chrome.storage.sync.set({ colorStages }, () => {
    chrome.runtime.sendMessage({ 
      type: 'colorStagesUpdated',
      colorStages
    });
  });
}