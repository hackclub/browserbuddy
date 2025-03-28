document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const cursorEnabledToggle = document.getElementById('cursor-enabled');
  const cursorTypeSelect = document.getElementById('cursor-type');
  const cursorColorPicker = document.getElementById('cursor-color');
  const cursorSizeSlider = document.getElementById('cursor-size');
  const sizeValueDisplay = document.getElementById('size-value');
  
  // Load saved settings
  chrome.storage.local.get(
    ['cursorEnabled', 'cursorType', 'cursorColor', 'cursorSize'],
    (result) => {
      cursorEnabledToggle.checked = result.cursorEnabled;
      cursorTypeSelect.value = result.cursorType;
      cursorColorPicker.value = result.cursorColor;
      cursorSizeSlider.value = result.cursorSize;
      sizeValueDisplay.textContent = `${result.cursorSize}px`;
    }
  );
  
  // Save settings when changed
  cursorEnabledToggle.addEventListener('change', () => {
    chrome.storage.local.set({ cursorEnabled: cursorEnabledToggle.checked });
  });
  
  cursorTypeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ cursorType: cursorTypeSelect.value });
  });
  
  cursorColorPicker.addEventListener('change', () => {
    chrome.storage.local.set({ cursorColor: cursorColorPicker.value });
  });
  
  cursorSizeSlider.addEventListener('input', () => {
    const size = cursorSizeSlider.value;
    sizeValueDisplay.textContent = `${size}px`;
    chrome.storage.local.set({ cursorSize: parseInt(size) });
  });
  
  // Apply settings to current tab
  function applyToCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateCursorSettings' })
          .catch(error => console.log("Tab might not be fully loaded yet"));
      }
    });
  }
  
  // Apply settings when popup opens
  applyToCurrentTab();
});
