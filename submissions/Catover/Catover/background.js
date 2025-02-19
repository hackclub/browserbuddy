const browser = chrome || browser;
let blockingEnabled = true;
let catReplacementEnabled = true;
let positivityBubbleEnabled = true;
let adsBlocked = 0;

// Load saved settings
chrome.storage.local.get(
    ['blockingEnabled', 'catReplacementEnabled', 'positivityBubbleEnabled', 'adsBlocked'], 
    function(result) {
        blockingEnabled = result.blockingEnabled !== undefined ? result.blockingEnabled : true;
        catReplacementEnabled = result.catReplacementEnabled !== undefined ? result.catReplacementEnabled : true;
        positivityBubbleEnabled = result.positivityBubbleEnabled !== undefined ? result.positivityBubbleEnabled : true;
        adsBlocked = result.adsBlocked || 0;
        
        // Only initialize rules if blocking is enabled
        if (blockingEnabled) {
            updateRules();
        }
    }
);

// Define rule for blocking ads
const adBlockingRule = {
    id: 1,
    priority: 1,
    action: { type: "block" },
    condition: {
        urlFilter: "||*",
        domains: [
            "*://*.doubleclick.net/*",
            "*://*.googlesyndication.com/*",
            "*://*.googleadservices.com/*",
            "*://*.adsafeprotected.com/*",
            "*://*.adnxs.com/*",
            "*://*.adsrvr.org/*",
            "*://*.adform.net/*",
            "*://*.advertising.com/*",
            "*://*.adtech.de/*",
            "*://*.exponential.com/*",
            "*://*.media.net/*",
            "*://*.zedo.com/*",
            "*://*.yieldmanager.com/*",
            "*://*.pubmatic.com/*",
            "*://*.openx.net/*",
            "*://*.rubiconproject.com/*",
            "*://*.criteo.com/*",
            "*://*.outbrain.com/*",
            "*://*.taboola.com/*",
            "*://*.revcontent.com/*",
            "*://*.mgid.com/*",
            "*://*.adblade.com/*",
            "*://*.adroll.com/*",
            "*://*.quantserve.com/*",
            "*://*.scorecardresearch.com/*",
            "*://*.bluekai.com/*",
            "*://*.mathtag.com/*",
            "*://*.tradedoubler.com/*",
            "*://*.adbrite.com/*",
            "*://*.admob.com/*",
            "*://*.adcolony.com/*",
            "*://*.adf.ly/*",
            "*://*.adfly.com/*",
            "*://*.adk2.com/*",
            "*://*.admarketplace.net/*",
            "*://*.adscale.de/*",
            "*://*.adserverplus.com/*",
            "*://*.adtechus.com/*",
            "*://*.advertserve.com/*",
            "*://*.adzerk.*/*" // adzerk regex
        ],
        resourceTypes: [
            "main_frame",
            "sub_frame",
            "stylesheet",
            "script",
            "image",
            "font",
            "object",
            "xmlhttprequest",
            "ping",
            "csp_report",
            "media",
            "websocket",
            "other"
        ]
    }
};

// Function to update blocking rules
async function updateRules() {
    try {
        if (blockingEnabled) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [1],
                addRules: [adBlockingRule]
            });
        } else {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [1]
            });
        }
    } catch (error) {
        console.error('Error updating rules:', error);
    }
}

// Handle messages from popup with conditional execution
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
            case 'toggleBlocking':
                blockingEnabled = request.enabled;
                chrome.storage.local.set({ blockingEnabled });
                if (blockingEnabled) {
                    updateRules();
                } else {
                    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
                }
                sendResponse({ enabled: blockingEnabled });
                break;

            case 'toggleCatReplacement':
                catReplacementEnabled = request.enabled;
                chrome.storage.local.set({ catReplacementEnabled });
                // Only notify content script if enabled
                if (catReplacementEnabled) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'enableCatReplacement'
                            });
                        }
                    });
                }
                sendResponse({ enabled: catReplacementEnabled });
                break;

            case 'togglePositivityBubble':
                positivityBubbleEnabled = request.enabled;
                chrome.storage.local.set({ positivityBubbleEnabled });
                // Only notify content script if enabled
                if (positivityBubbleEnabled) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs[0]) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'enablePositivityBubble'
                            });
                        }
                    });
                }
                sendResponse({ enabled: positivityBubbleEnabled });
                break;

            case 'getStatus':
                sendResponse({
                    adsBlocked,
                    blockingEnabled,
                    catReplacementEnabled,
                    positivityBubbleEnabled
                });
                break;
        }
        return true;
    }
);

// Track blocked requests using declarativeNetRequest.onRuleMatchedDebug
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(
    (info) => {
        if (info.rule.id === 1) {
            adsBlocked++;
            chrome.storage.local.set({ adsBlocked: adsBlocked });
        }
    }
);

console.log('Background script loaded');