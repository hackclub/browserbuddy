"use strict";

(function () {
  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  window.urbanDictUtilsBridge = {
    sendRuntimeMessage: function (message) {
      return new Promise((resolve, reject) => {
        if (!isExtensionContextValid()) {
          reject(new Error("Extension context invalidated"));
          return;
        }

        try {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
    },

    isContextValid: function () {
      return isExtensionContextValid();
    },
    
    checkContextValidity: function() {
      return new Promise((resolve) => {
        if (!isExtensionContextValid()) {
          resolve(false);
          return;
        }
        
        try {
          chrome.runtime.sendMessage({action: "checkContextValid"}, (response) => {
            if (chrome.runtime.lastError) {
              resolve(false);
            } else {
              resolve(response && response.valid === true);
            }
          });
        } catch (err) {
          resolve(false);
        }
      });
    }
  };

  if (isExtensionContextValid()) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "showBubble" && message.word) {
        window.dispatchEvent(
          new CustomEvent("urbandict-lookup", {
            detail: { word: message.word },
          }),
        );
        sendResponse({ success: true });
        return true;
      }

      if (message.action === "settingsChanged") {
        window.dispatchEvent(
          new CustomEvent("urban-settings-changed", {
            detail: message.changes,
          }),
        );
        sendResponse({ success: true });
        return true;
      }

      if (message.action === "checkContextValid") {
        sendResponse({ valid: true });
        return true;
      }

      return false;
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync") {
        const relevantChanges = {};

        if (changes.darkMode) {
          relevantChanges.darkMode = changes.darkMode.newValue;
        }

        if (changes.bubbleEnabled) {
          relevantChanges.bubbleEnabled = changes.bubbleEnabled.newValue;
        }

        if (Object.keys(relevantChanges).length > 0) {
          window.dispatchEvent(
            new CustomEvent("urban-settings-changed", {
              detail: relevantChanges,
            }),
          );
        }
      }
    });
  }
})();
