"use strict";

import { sanitizeHtml, sendRuntimeMessage } from "./utils.js";

class UrbanDictionaryPopup {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.resultsDiv = document.getElementById("results");
    this.darkModeToggle = document.getElementById("darkModeToggle");
    this.optionsBtn = document.getElementById("optionsBtn");
    this.currentFetch = null;

    this.initializeEventListeners();
    this.checkPendingLookup();
    this.initializeDarkMode();

    this.searchInput.focus();
  }

  async checkPendingLookup() {
    try {
      const { pendingLookup } = await chrome.storage.local.get([
        "pendingLookup",
      ]);
      if (pendingLookup) {
        this.searchInput.value = pendingLookup;
        this.performSearch();
        await chrome.storage.local.remove("pendingLookup");
      }
    } catch (error) {
      console.error("Error checking for pending lookup:", error);
    }
  }

  async initializeDarkMode() {
    try {
      const { darkMode } = await chrome.storage.sync.get(["darkMode"]);
      if (darkMode) {
        document.body.classList.add("dark-mode");
        this.darkModeToggle.checked = true;
      }
    } catch (error) {
      console.error("Error initializing dark mode:", error);
    }
  }

  initializeEventListeners() {
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
    this.darkModeToggle.addEventListener(
      "change",
      this.handleDarkModeToggle.bind(this),
    );
    this.searchBtn.addEventListener("click", this.performSearch.bind(this));
    this.searchInput.addEventListener(
      "keypress",
      this.handleSearchKeypress.bind(this),
    );
    this.optionsBtn.addEventListener("click", () =>
      chrome.runtime.openOptionsPage(),
    );
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.cleanup();
      }
    });
  }

  handleStorageChange(changes) {
    if (changes.darkMode) {
      const isDarkMode = changes.darkMode.newValue;
      if (isDarkMode) {
        document.body.classList.add("dark-mode");
        this.darkModeToggle.checked = true;
      } else {
        document.body.classList.remove("dark-mode");
        this.darkModeToggle.checked = false;
      }
    }
  }

  handleDarkModeToggle() {
    const isDarkMode = this.darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDarkMode);
    chrome.storage.sync.set({ darkMode: isDarkMode });
  }

  handleSearchKeypress(e) {
    if (e.key === "Enter") {
      this.performSearch();
    }
  }

  handleMessage(message) {
    if (message.action === "lookupWord") {
      this.searchInput.value = message.word;
      this.performSearch();
      return true;
    }
  }

  async performSearch() {
    const term = this.searchInput.value.trim();
    if (!term) return;

    this.setLoadingState(true);

    if (this.currentFetch && this.currentFetch.abort) {
      this.currentFetch.abort();
    }

    try {
      const cachedData = await this.checkCacheForDefinition(term);
      if (cachedData) {
        this.displayResults({ list: cachedData });
        this.setLoadingState(false);
        return;
      }

      await this.fetchFromApi(term);
    } catch (error) {
      if (error.name !== "AbortError") {
        this.resultsDiv.innerHTML = `
          <div class="placeholder error">
            <p>Error: ${error.message}</p>
            <p>Please try again later.</p>
          </div>
        `;
        console.error("Urban lookup error:", error);
      }
    } finally {
      this.setLoadingState(false);
    }
  }

  async fetchFromApi(term) {
    const controller = new AbortController();
    const signal = controller.signal;
    this.currentFetch = controller;

    try {
      const response = await fetch(
        `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`,
        { signal },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.list && data.list.length > 0) {
        try {
          await chrome.runtime.sendMessage({
            action: "cacheDefinition",
            term: term,
            definitions: data.list,
          });
        } catch (cacheError) {
          console.error("Cache error:", cacheError);
        }
      }

      this.displayResults(data);
    } finally {
      this.currentFetch = null;
    }
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.resultsDiv.innerHTML = '<div class="placeholder">Loading...</div>';
      this.searchBtn.disabled = true;
      this.searchBtn.classList.add("loading");
      this.searchBtn.textContent = "";
    } else {
      this.searchBtn.disabled = false;
      this.searchBtn.classList.remove("loading");
      this.searchBtn.textContent = "Search";
    }
  }

  async checkCacheForDefinition(term) {
    try {
      const response = await sendRuntimeMessage({
        action: "getCachedDefinition",
        term: term,
      });

      return response?.definitions || null;
    } catch (error) {
      console.error("Cache lookup error:", error);
      return null;
    }
  }

  displayResults(data) {
    if (!data.list || data.list.length === 0) {
      this.resultsDiv.innerHTML =
        '<div class="placeholder">No definitions found</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    data.list.slice(0, 3).forEach((item) => {
      const card = this.createDefinitionCard(item);
      fragment.appendChild(card);
    });

    const moreLink = this.createMoreResultsLink();
    fragment.appendChild(moreLink);

    this.resultsDiv.innerHTML = "";
    this.resultsDiv.appendChild(fragment);
  }

  createDefinitionCard(item) {
    const card = document.createElement("div");
    card.className = "definition-card";

    const definition = item.definition.replace(/\[|\]/g, "");
    const example = item.example.replace(/\[|\]/g, "");

    card.innerHTML = `
      <div class="word">
        ${this.sanitizeHtml(item.word)}
      </div>
      <div class="definition">${this.sanitizeHtml(definition)}</div>
      ${example ? `<div class="example">${this.sanitizeHtml(example)}</div>` : ""}
      <div class="votes">👍 ${item.thumbs_up} 👎 ${item.thumbs_down}</div>
    `;

    return card;
  }

  createMoreResultsLink() {
    const moreLink = document.createElement("div");
    moreLink.className = "more-results";

    const encodedTerm = encodeURIComponent(this.searchInput.value.trim());
    moreLink.innerHTML = `
      <a href="https://www.urbandictionary.com/define.php?term=${encodedTerm}" 
         target="_blank" rel="noopener noreferrer">
        See more results on urbandictionary.com
      </a>
    `;

    return moreLink;
  }

  sanitizeHtml(str) {
    return sanitizeHtml(str);
  }

  cleanup() {
    chrome.storage.onChanged.removeListener(this.handleStorageChange);
    if (this.currentFetch && this.currentFetch.abort) {
      this.currentFetch.abort();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UrbanDictionaryPopup();
});
