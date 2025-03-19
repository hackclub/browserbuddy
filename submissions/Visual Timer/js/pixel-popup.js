document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mainInterface = document.getElementById('main-interface');
  const settingsPanel = document.getElementById('settings-panel');
  const timerText = document.getElementById('timer-text');
  const progressBar = document.getElementById('progress-bar');
  const toggleBtn = document.getElementById('toggle-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const backBtn = document.getElementById('back-btn');
  const uiSwitcher = document.getElementById('ui-switcher');
  const tabs = document.querySelectorAll('.tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const hoursInput = document.getElementById('hours-input');
  const minutesInput = document.getElementById('minutes-input');
  const saveTimeBtn = document.getElementById('save-time-btn');
  const showTimeToggle = document.getElementById('show-time-toggle');
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityValue = document.getElementById('opacity-value');
  const opacityFill = document.getElementById('opacity-fill');
  const sliderKnob = document.getElementById('slider-knob');
  const colorStart = document.getElementById('color-start');
  const color33 = document.getElementById('color-33');
  const color66 = document.getElementById('color-66');
  const colorEnd = document.getElementById('color-end');
  const colorSegments = document.querySelectorAll('.color-segment');
  const resetColorsBtn = document.getElementById('reset-colors-btn');

  // State variables
  let isEnabled = true;
  let isPaused = false;
  let totalSeconds = 0;
  let targetSeconds = 7200; // Default: 2 hours
  let currentOpacity = 70;
  let currentColorStages = [
    { hue: 240, hex: '#3B82F6' }, // Blue
    { hue: 120, hex: '#10B981' }, // Green
    { hue: 270, hex: '#8B5CF6' }, // Purple
    { hue: 0, hex: '#EF4444' }    // Red
  ];
  let showTime = true;
  let defaultColors = [
    { hue: 240, hex: '#3B82F6' }, // Blue
    { hue: 120, hex: '#10B981' }, // Green
    { hue: 270, hex: '#8B5CF6' }, // Purple
    { hue: 0, hex: '#EF4444' }    // Red
  ];

  // Load state from Chrome storage
  function loadState() {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
      if (response) {
        totalSeconds = response.totalSeconds || 0;
        isEnabled = response.isEnabled !== false;
        isPaused = response.isPaused || false;
        targetSeconds = response.targetSeconds || 7200;
        currentOpacity = response.opacity || 70;

        if (response.colorStages && response.colorStages.length === 4) {
          currentColorStages = response.colorStages;
        }

        updateUI();
      }
    });

    chrome.storage.sync.get(['showTime'], (result) => {
      showTime = result.showTime !== false;
      updateShowTimeToggle();
      updateTimerVisibility();
    });
  }

  // Format seconds to MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update UI based on state
  function updateUI() {
    // Update timer text
    timerText.textContent = formatTime(totalSeconds);

    // Update progress bar
    const progressPercent = Math.min(100, (totalSeconds / targetSeconds) * 100);
    progressBar.style.width = `${progressPercent}%`;
    
    const currentProgress = totalSeconds / targetSeconds;
    if (currentProgress < 0.33) {
      progressBar.style.backgroundColor = currentColorStages[0].hex;
    } else if (currentProgress < 0.66) {
      progressBar.style.backgroundColor = currentColorStages[1].hex;
    } else {
      progressBar.style.backgroundColor = currentColorStages[2].hex;
    }

    // Update toggle button
    toggleBtn.className = isEnabled ? 'toggle-btn toggle-on' : 'toggle-btn toggle-off';
    
    // Update pause button
    pauseBtn.disabled = !isEnabled;
    if (isPaused) {
      pauseBtn.classList.remove('pause-btn');
      pauseBtn.classList.add('resume-btn');
      pauseBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>RESUME</span>
      `;
    } else {
      pauseBtn.classList.add('pause-btn');
      pauseBtn.classList.remove('resume-btn');
      pauseBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="16" x="6" y="4"></rect><rect width="4" height="16" x="14" y="4"></rect></svg>
        <span>PAUSE</span>
      `;
    }
    
    // Update reset button
    resetBtn.disabled = !isEnabled;
    
    // Update inputs
    const hours = Math.floor(targetSeconds / 3600);
    const minutes = Math.floor((targetSeconds % 3600) / 60);
    
    hoursInput.value = hours;
    minutesInput.value = minutes;
    
    // Update opacity slider
    opacitySlider.value = currentOpacity;
    opacityValue.textContent = currentOpacity;
    opacityFill.style.width = `${currentOpacity}%`;
    sliderKnob.style.left = `calc(${currentOpacity}% - 8px)`;
    
    // Update color inputs and preview
    colorStart.value = currentColorStages[0].hex;
    color33.value = currentColorStages[1].hex;
    color66.value = currentColorStages[2].hex;
    colorEnd.value = currentColorStages[3].hex;
    
    colorSegments[0].style.backgroundColor = currentColorStages[0].hex;
    colorSegments[1].style.backgroundColor = currentColorStages[1].hex;
    colorSegments[2].style.backgroundColor = currentColorStages[2].hex;
    colorSegments[3].style.backgroundColor = currentColorStages[3].hex;
  }

  function updateShowTimeToggle() {
    showTimeToggle.className = showTime ? 'toggle-btn toggle-on' : 'toggle-btn toggle-off';
  }
  
  function updateTimerVisibility() {
    // Only show timer if extension is enabled AND showTime is true
    timerText.style.opacity = (showTime && isEnabled) ? '1' : '0';
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

  // Event listeners
  settingsBtn.addEventListener('click', () => {
    mainInterface.classList.add('show-settings');
    settingsPanel.classList.add('show');
  });

  backBtn.addEventListener('click', () => {
    mainInterface.classList.remove('show-settings');
    settingsPanel.classList.remove('show');
  });

  // Toggle button for enabling/disabling the timer
  toggleBtn.addEventListener('click', () => {
    isEnabled = !isEnabled;
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
      chrome.runtime.sendMessage({
        type: 'settingsUpdated',
        data: { enabled: isEnabled }
      });
      updateUI();
      updateVisibility();
    });
  });

  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    chrome.storage.sync.set({ isPaused }, () => {
      chrome.runtime.sendMessage({
        type: 'togglePause',
        isPaused
      });
      updateUI();
    });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ totalSeconds: 0 }, () => {
      chrome.runtime.sendMessage({ type: 'resetTimer' });
      totalSeconds = 0;
      updateUI();
    });
  });

  // Tab navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and panes
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding pane
      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Save time button
  saveTimeBtn.addEventListener('click', () => {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const newTargetTime = { hours, minutes };
    
    chrome.storage.sync.set({ targetTime: newTargetTime }, () => {
      chrome.runtime.sendMessage({
        type: 'timeSettingsUpdated',
        targetTime: newTargetTime
      });
      
      targetSeconds = (hours * 3600) + (minutes * 60);
      updateUI();
    });
  });

  // Show time toggle
  showTimeToggle.addEventListener('click', () => {
    showTime = !showTime;
    chrome.storage.sync.set({ showTime }, () => {
      updateShowTimeToggle();
      updateTimerVisibility();
      updateVisibility();
    });
  });

  // Opacity slider
  opacitySlider.addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value);
    opacityFill.style.width = `${opacity}%`;
    sliderKnob.style.left = `calc(${opacity}% - 8px)`;
    opacityValue.textContent = opacity;
    
    currentOpacity = opacity;
    
    // Debounce the storage update
    clearTimeout(opacitySlider.timeout);
    opacitySlider.timeout = setTimeout(() => {
      chrome.storage.sync.set({ opacity }, () => {
        chrome.runtime.sendMessage({
          type: 'opacityUpdated',
          opacity
        });
      });
    }, 100);
  });

  // Color pickers
  [colorStart, color33, color66, colorEnd].forEach((picker, index) => {
    picker.addEventListener('input', (e) => {
      const hex = e.target.value;
      currentColorStages[index].hex = hex;
      currentColorStages[index].hue = hexToHue(hex);
      colorSegments[index].style.backgroundColor = hex;
      
      // Update the colors in Chrome storage
      updateColors();
    });
  });

  // Reset colors button
  resetColorsBtn.addEventListener('click', () => {
    currentColorStages = JSON.parse(JSON.stringify(defaultColors));
    updateColors();
    updateUI();
  });

  // Update colors in storage
  function updateColors() {
    chrome.storage.sync.set({ colorStages: currentColorStages }, () => {
      chrome.runtime.sendMessage({
        type: 'colorStagesUpdated',
        colorStages: currentColorStages
      });
    });
  }

  // Switch UI mode
  uiSwitcher.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'switchUI',
      uiMode: 'classic'
    }, () => {
      window.location.href = '/html/popup.html';
    });
  });

  // Helper function to update visibility across all tabs
  function updateVisibility() {
    // Query for all tabs and update visibility state
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url?.startsWith("http")) {
          try {
            // If timer is disabled, we'll explicitly hide everything regardless of showTime setting
            if (!isEnabled) {
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
  }

  // Listen for timer updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'update') {
      totalSeconds = message.seconds;
      isEnabled = message.enabled;
      isPaused = message.isPaused;
      targetSeconds = message.targetSeconds;
      currentOpacity = message.opacity;
      
      updateUI();
    }
    return false;
  });

  // Initial load
  loadState();
});