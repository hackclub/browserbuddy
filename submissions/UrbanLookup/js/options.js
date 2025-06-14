"use strict";

import { showNotification } from "./utils.js";

class OptionsManager {
  constructor() {
    this.darkModeToggle = document.getElementById("darkModeToggle");
    this.bubbleToggle = document.getElementById("bubbleToggle");
    this.cacheSizeSlider = document.getElementById("cacheSizeSlider");
    this.cacheSizeValue = document.getElementById("cacheSizeValue");
    this.clearCacheBtn = document.getElementById("clearCacheBtn");
    this.saveBtn = document.getElementById("saveBtn");

    this.initializeSettings();
    this.setupEventListeners();
  }
  // please work please work please work
  async initializeSettings() {
    try {
      const { darkMode, bubbleEnabled, cacheSize } =
        await chrome.storage.sync.get([
          "darkMode",
          "bubbleEnabled",
          "cacheSize",
        ]);

      if (darkMode) {
        document.body.classList.add("dark-mode");
        this.darkModeToggle.checked = true;
      }

      if (bubbleEnabled !== false) {
        this.bubbleToggle.checked = true;
      }

      const cacheSizeValue = cacheSize || 50;
      this.cacheSizeSlider.value = cacheSizeValue;
      this.cacheSizeValue.textContent = cacheSizeValue;
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  setupEventListeners() {
    this.darkModeToggle.addEventListener(
      "change",
      this.handleDarkModeToggle.bind(this),
    );
    this.cacheSizeSlider.addEventListener(
      "input",
      this.handleSliderChange.bind(this),
    );
    this.clearCacheBtn.addEventListener(
      "click",
      this.handleClearCache.bind(this),
    );
    this.saveBtn.addEventListener("click", this.handleSave.bind(this));
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }

  handleDarkModeToggle() {
    const isDarkMode = this.darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    chrome.storage.sync.set({ darkMode: isDarkMode });
  }

  handleSliderChange() {
    this.cacheSizeValue.textContent = this.cacheSizeSlider.value;
  }

  async handleClearCache() {
    try {
      await chrome.runtime.sendMessage({ action: "clearCache" });
      showNotification("Cache cleared!", "var(--accent-red)");
    } catch (error) {
      console.error("Error clearing cache:", error);
      showNotification("Failed to clear cache", "var(--accent-red)");
    }
  }

  async handleSave() {
    try {
      await chrome.storage.sync.set({
        bubbleEnabled: this.bubbleToggle.checked,
        cacheSize: parseInt(this.cacheSizeSlider.value, 10),
      });
      showNotification("Settings saved!", "var(--accent-blue)");
    } catch (error) {
      console.error("Error saving settings:", error);
      showNotification("Failed to save settings", "var(--accent-red)");
    }
  }

  handleStorageChange(changes) {
    if (changes.darkMode) {
      const isDarkMode = changes.darkMode.newValue;
      document.body.classList.toggle("dark-mode", isDarkMode);
      this.darkModeToggle.checked = isDarkMode;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new OptionsManager();
});
