let allFilters = [
  "*://*.doubleclick.net/*",
  "*://partner.googleadservices.com/*",
  "*://*.googlesyndication.com/*",
  "*://*.google-analytics.com/*",
  "*://creative.ak.fbcdn.net/*",
  "*://*.adbrite.com/*",
  "*://*.exponential.com/*",
  "*://*.quantserve.com/*",
  "*://*.scorecardresearch.com/*",
  "*://*.zedo.com/*",
];

const createRules = () => {
  return allFilters.map((filter, index) => ({
    id: parseInt(index, 10) + 1001,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: filter,
      resourceTypes: [
        "main_frame",
        "sub_frame",
        "script",
        "image",
        "xmlhttprequest",
        "media",
        "font",
        "stylesheet",
      ],
    },
  }));
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("filters", (result) => {
    if (result["filters"] === undefined) {
      chrome.storage.local.set({ filters: allFilters }, initializeRules);
    } else {
      allFilters = result["filters"];
      initializeRules();
    }
  });

  function initializeRules() {
    const dynamicRuleIds = allFilters.map((_, index) => index + 1001);

    chrome.declarativeNetRequest
      .updateDynamicRules({
        removeRuleIds: dynamicRuleIds,
      })
      .then(() => {
        const rules = createRules();
        return chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules,
        });
      })
      .then(() => {})
      .catch((error) => {});
  }

  chrome.storage.local.get("webrtc_privacy", (result) => {
    const webRTCPrivacy = result["webrtc_privacy"] ?? false;
    if (
      chrome.privacy &&
      chrome.privacy.network &&
      chrome.privacy.network.webRTCIPHandlingPolicy
    ) {
      try {
        chrome.privacy.network.webRTCIPHandlingPolicy.set({
          value: webRTCPrivacy ? "default_public_interface_only" : "default",
        });
      } catch (error) {}
    }
  });
});
