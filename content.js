// content.js
(function() {
  'use strict';

  const CONFIG = {
    CUSTOM_CLASS: 'youtube-enhancer-enabled',
    FEATURE_FILES: {
      vid: { js: 'features/vidplayer.js', css: 'features/vidplayer.css' },
      shorts2long: { js: 'features/shorts2long.js', css: 'features/shorts2long.css' },
      subsComment: { js: 'features/subs-comment.js', css: 'features/subs-comment.css' },
      subsbutton: { js: 'features/subsbutton.js', css: 'features/subsbutton.css' },
      sblock: { js: 'features/shortsblock.js', css: 'features/shortsblock.css' }
    }
  };

  let isExtensionEnabled = true;
  const injectedElements = {};
  const activeFeatureCleanups = {};

  async function initialize() {
    console.log('Initializing content script');
    await chrome.storage.sync.get(['extensionEnabled'], (result) => {
      isExtensionEnabled = result.extensionEnabled !== false;
      toggleExtensionFeatures(isExtensionEnabled);
    });

    await chrome.storage.sync.get(Object.keys(CONFIG.FEATURE_FILES), (features) => {
      console.log('Feature states:', features);
      Object.keys(CONFIG.FEATURE_FILES).forEach((feature) => {
        if (features[feature] !== false) {
          enableFeature(feature);
        }
      });
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggleExtension') {
        handleToggleExtension(message.enabled);
      } else if (message.action === 'toggleFeature') {
        handleToggleFeature(message.feature, message.enabled);
      }
      sendResponse({ status: 'success' });
      return true;
    });
  }

  function handleToggleExtension(enabled) {
    isExtensionEnabled = enabled;
    toggleExtensionFeatures(enabled);
    Object.keys(CONFIG.FEATURE_FILES).forEach((feature) => {
      chrome.storage.sync.get([feature], (result) => {
        if (result[feature] && isExtensionEnabled) {
          enableFeature(feature);
        } else {
          disableFeature(feature);
        }
      });
    });
  }

  function handleToggleFeature(feature, enabled) {
    if (enabled && isExtensionEnabled) {
      enableFeature(feature);
    } else {
      disableFeature(feature);
    }
  }

  async function enableFeature(feature) {
    if (!CONFIG.FEATURE_FILES[feature]) return;
    try {
      injectCSS(feature);
      await loadFeatureJS(feature);
      if (window.youtubeEnhancer?.[feature]?.init) {
        const cleanup = window.youtubeEnhancer[feature].init();
        if (cleanup) activeFeatureCleanups[feature] = cleanup;
      }
      console.log(`Enabled feature: ${feature}`);
    } catch (error) {
      console.error(`Error enabling ${feature}:`, error);
    }
  }

  function disableFeature(feature) {
    if (!CONFIG.FEATURE_FILES[feature]) return;
    if (injectedElements[feature]) {
      injectedElements[feature].remove();
      delete injectedElements[feature];
    }
    if (activeFeatureCleanups[feature]) {
      activeFeatureCleanups[feature]();
      delete activeFeatureCleanups[feature];
    }
    console.log(`Disabled feature: ${feature}`);
  }

  function loadFeatureJS(feature) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(CONFIG.FEATURE_FILES[feature].js);
      script.id = `youtube-enhancer-${feature}-script`;
      script.onload = () => {
        console.log(`Loaded ${feature}.js`);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${feature}.js`));
      document.head.appendChild(script);
    });
  }

  function injectCSS(feature) {
    const existingLink = document.getElementById(`youtube-enhancer-${feature}-css`);
    if (existingLink) existingLink.remove();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(CONFIG.FEATURE_FILES[feature].css) + '?v=' + Date.now();
    link.id = `youtube-enhancer-${feature}-css`;
    link.onload = () => console.log(`CSS loaded for ${feature}`);
    link.onerror = () => console.error(`CSS failed to load for ${feature}`);
    document.head.appendChild(link);
    injectedElements[feature] = link;
  }

  function toggleExtensionFeatures(enabled) {
    document.body.classList.toggle(CONFIG.CUSTOM_CLASS, enabled);
  }

  initialize();
})();