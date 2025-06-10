"use strict"; // overengineering at its peak

class DefinitionBubble {
  constructor() {
    this.element = null;
    this.currentRequest = null;
    this.isDarkMode = false;
    this.isEnabled = true;
    this.localCache = new Map();
    this.contextValid = true;
    this.contextCheckTimestamp = 0;

    this.initializeBubble();
  }

  async initializeBubble() {
    await this.loadSettings();
    this.createBubbleElement();
    this.setupEventListeners();
  }

  async loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.sync.get(["darkMode", "bubbleEnabled"], resolve);
      });

      this.isDarkMode = result.darkMode || false;
      this.isEnabled = result.bubbleEnabled !== false;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  createBubbleElement() {
    if (!this.element) {
      this.element = document.createElement("div");
      this.element.className = "urban-dict-bubble";
      this.element.innerHTML = `
        <div class="urban-bubble-close">×</div>
        <div class="urban-bubble-content"></div>
      `;

      document.body.appendChild(this.element);

      const closeButton = this.element.querySelector(".urban-bubble-close");
      closeButton.addEventListener("click", () => this.hide());

      this.updateTheme();
    }
  }

  updateTheme() {
    if (this.element) {
      this.element.classList.toggle("urban-dark", this.isDarkMode);
    }
  }

  setupEventListeners() {
    document.addEventListener("dblclick", this.handleDoubleClick.bind(this));

    document.addEventListener("click", (e) => {
      if (
        this.isVisible() &&
        this.element &&
        !this.element.contains(e.target)
      ) {
        this.hide();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible()) {
        this.hide();
      }
    });

    window.addEventListener("urban-settings-changed", (e) => {
      const changes = e.detail;
      if (changes.darkMode !== undefined) {
        this.isDarkMode = changes.darkMode;
        this.updateTheme();
      }

      if (changes.bubbleEnabled !== undefined) {
        this.isEnabled = changes.bubbleEnabled;
        if (!this.isEnabled && this.isVisible()) {
          this.hide();
        }
      }
    });

    window.addEventListener("urbandict-lookup", (e) => {
      this.show(e.detail.word);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "showBubble" && message.word) {
        this.show(message.word);
        sendResponse({ success: true });
        return true;
      } else if (message.action === "settingsChanged") {
        if (message.changes) {
          if (message.changes.darkMode !== undefined) {
            this.isDarkMode = message.changes.darkMode;
            this.updateTheme();
          }

          if (message.changes.bubbleEnabled !== undefined) {
            this.isEnabled = message.changes.bubbleEnabled;
            if (!this.isEnabled && this.isVisible()) {
              this.hide();
            }
          }
        }
        sendResponse({ success: true });
        return true;
      }
    });
  }

  handleDoubleClick(e) {
    if (!this.isEnabled) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const x = rect.left + window.scrollX;
      const y = rect.bottom + window.scrollY;

      this.show(text, x, y);
    }
  }

  async fetchDefinition(term) {
    const contentElement = this.element.querySelector(".urban-bubble-content");
    const termLowercase = term.toLowerCase();

    try {
      // just work please
      const localCachedDefinition = this.localCache.get(termLowercase);
      if (localCachedDefinition && localCachedDefinition.length > 0) {
        this.displayDefinition(localCachedDefinition[0], contentElement);
        return;
      }
      
      // if this doesnt work i will cry
      let cachedDefinition = await this.getCachedDefinition(term);

      if (cachedDefinition && cachedDefinition.length > 0) {
        this.displayDefinition(cachedDefinition[0], contentElement);
        return;
      }

      const controller = new AbortController();
      const signal = controller.signal;
      this.currentRequest = controller;

      const response = await fetch(
        `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`,
        { signal },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!this.isVisible()) return;

      if (!data.list || data.list.length === 0) {
        contentElement.innerHTML =
          '<div class="urban-bubble-not-found">No definition found</div>';
        return;
      }

      this.localCache.set(termLowercase, data.list);
      
      this.cacheDefinition(term, data.list);

      this.displayDefinition(data.list[0], contentElement);
    } catch (error) {
      if (error.name === "AbortError") return;

      if (this.isVisible()) {
        contentElement.innerHTML = `<div class="urban-bubble-error">Error fetching definition</div>`;
        console.error("Urban lookup error:", error);
      }
    } finally {
      this.currentRequest = null;
    }
  }

  async checkExtensionContext() {
    // I am tired boss
    const now = Date.now();
    if (now - this.contextCheckTimestamp < 30000 && this.contextCheckTimestamp > 0) {
      return this.contextValid;
    }
    
    this.contextCheckTimestamp = now;
    
    try {
      if (window.urbanDictUtilsBridge && window.urbanDictUtilsBridge.isContextValid()) {
        const response = await window.urbanDictUtilsBridge.sendRuntimeMessage({
          action: "checkContextValid"
        });
        this.contextValid = response && response.valid === true;
      } else if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
        const response = await this.sendRuntimeMessage({
          action: "checkContextValid"
        }).catch(() => ({ valid: false }));
        this.contextValid = response && response.valid === true;
      } else {
        this.contextValid = false;
      }
    } catch (error) {
      this.contextValid = false;
      console.warn("Extension context check failed:", error);
    }
    
    return this.contextValid;
  }

  isExtensionContextValid() {
    // dont do this to me
    return this.contextValid && 
           ((typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) || 
           (window.urbanDictUtilsBridge && window.urbanDictUtilsBridge.isContextValid()));
  }

  async getCachedDefinition(term) {
    const termLower = term.toLowerCase();
    const localCached = this.localCache.get(termLower);
    if (localCached) {
      return localCached;
    }
    
    if (await this.checkExtensionContext()) {
      try {
        const response = await this.sendRuntimeMessage({
          action: "getCachedDefinition",
          term,
        });

        if (response?.definitions) {
          this.localCache.set(termLower, response.definitions);
          return response.definitions;
        }
      } catch (error) {
        console.warn("Cache fetch failed:", error);
        this.contextValid = false;
      }
    }

    return null;
  }
  // please work
  sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        if (window.urbanDictUtilsBridge) {
          window.urbanDictUtilsBridge
            .sendRuntimeMessage(message)
            .then(resolve)
            .catch(reject);
        } 
        else if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } else {
          reject(new Error("Extension context is unavailable"));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  cacheDefinition(term, definitions) {
    const termLower = term.toLowerCase();
    this.localCache.set(termLower, definitions);

    this.checkExtensionContext().then(isValid => {
      if (isValid) {
        this.sendRuntimeMessage({
          action: "cacheDefinition",
          term,
          definitions,
        }).catch((error) => {
          console.warn("Failed to cache definition in extension storage:", error);
          this.contextValid = false;
        });
      }
    }).catch(() => {
    });
  }

  displayDefinition(definition, contentElement) {
    if (!definition) return;

    const cleanDefinition = definition.definition.replace(/\[|\]/g, "");
    const cleanExample = definition.example.replace(/\[|\]/g, "");

    contentElement.innerHTML = `
      <div class="urban-bubble-word">${definition.word}</div>
      <div class="urban-bubble-definition">${cleanDefinition}</div>
      ${
        cleanExample
          ? `<div class="urban-bubble-example">${cleanExample}</div>`
          : ""
      }
      <div class="urban-bubble-votes">👍 ${definition.thumbs_up} 👎 ${definition.thumbs_down}</div>
    `;
  }
  // I should have used git from the very first minute
  abortCurrentRequest() {
    if (this.currentRequest && this.currentRequest.abort) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
  }

  position(x, y) {
    if (!this.element) return;

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y + 10}px`;

    requestAnimationFrame(() => {
      const rect = this.element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.pageXOffset;
      const scrollY = window.pageYOffset;

      if (x + rect.width > scrollX + viewportWidth) {
        this.element.style.left = `${Math.max(scrollX + 10, scrollX + viewportWidth - rect.width - 10)}px`;
      }

      if (y + rect.height > scrollY + viewportHeight) {
        this.element.style.top = `${Math.max(scrollY + 10, y - rect.height - 10)}px`;
      }
    });
  }

  isVisible() {
    return this.element && this.element.style.display === "block";
  }
  // NOOOOOOOOOOO
  show(word, x, y) {
    if (!this.isEnabled || !word) return;

    this.createBubbleElement();

    if (x === undefined || y === undefined) {
      x = window.innerWidth / 2 - 170;
      y = window.innerHeight / 3;
    }

    const contentElement = this.element.querySelector(".urban-bubble-content");
    contentElement.innerHTML =
      '<div class="urban-bubble-loading">Looking up definition...</div>';

    this.element.style.display = "block";
    this.position(x, y);

    this.abortCurrentRequest();
    this.fetchDefinition(word);
  }
  // I hate this thing
  hide() {
    if (this.element) {
      this.element.style.display = "none";
      this.abortCurrentRequest();
    }
  }
}

const definitionBubble = new DefinitionBubble();
