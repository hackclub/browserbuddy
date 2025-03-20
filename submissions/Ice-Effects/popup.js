document.addEventListener('DOMContentLoaded', function() {
  const enableEffectsCheckbox = document.getElementById('enableEffects');
  const intervalSlider = document.getElementById('interval');
  const intervalValue = document.getElementById('intervalValue');
  const sizeSlider = document.getElementById('size');
  const sizeValue = document.getElementById('sizeValue');
  const densitySlider = document.getElementById('density');
  const densityValue = document.getElementById('densityValue');
  const saveButton = document.getElementById('saveSettings');

  // Load saved settings
  chrome.storage.sync.get({
    enabled: true,
    interval: 3,
    size: 2,
    density: 3
  }, function(items) {
    enableEffectsCheckbox.checked = items.enabled;
    intervalSlider.value = items.interval;
    intervalValue.textContent = items.interval + ' seconds';
    sizeSlider.value = items.size;
    sizeValue.textContent = items.size + 'x';
    densitySlider.value = items.density;
    densityValue.textContent = items.density + ' drops';
  });

  // Update displayed values as sliders change
  intervalSlider.addEventListener('input', function() {
    intervalValue.textContent = this.value + ' seconds';
  });

  sizeSlider.addEventListener('input', function() {
    sizeValue.textContent = this.value + 'x';
  });

  densitySlider.addEventListener('input', function() {
    densityValue.textContent = this.value + ' drops';
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const settings = {
      enabled: enableEffectsCheckbox.checked,
      interval: parseFloat(intervalSlider.value),
      size: parseFloat(sizeSlider.value),
      density: parseInt(densitySlider.value)
    };
    
    chrome.storage.sync.set(settings, function() {
      // Notify content script about updated settings
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: settings
          });
        }
      });
      
      // Visual feedback
      saveButton.textContent = 'Saved!';
      setTimeout(function() {
        saveButton.textContent = 'Save Settings';
      }, 1500);
    });
  });
});
