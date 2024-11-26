document.addEventListener("DOMContentLoaded", () => {
    const strengthSlider = document.getElementById("strength");
    const strengthValue = document.getElementById("strengthValue");

    chrome.storage.sync.get("strength", ({ strength = 0 }) => {
      strengthSlider.value = strength;
      strengthValue.textContent = `${strength}%`;
    });

    strengthSlider.addEventListener("input", () => {
      const strength = parseInt(strengthSlider.value, 10);
      strengthValue.textContent = `${strength}%`;
      chrome.storage.sync.set({ strength });
    });
  });