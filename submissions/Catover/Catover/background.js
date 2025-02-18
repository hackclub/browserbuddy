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
    }
);

// Listen for web requests and block ads if enabled
browser.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (blockingEnabled === true) {
            adsBlocked++;
            // Save updated count
            chrome.storage.local.set({ adsBlocked: adsBlocked });
            return { cancel: true };
        }
        return { cancel: false };
    },
    {
        urls: [
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
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
    },
    ["blocking"]
);

// Handle messages from popup
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === 'toggleBlocking') {
            blockingEnabled = request.enabled;
            chrome.storage.local.set({ blockingEnabled: blockingEnabled });
            sendResponse({ enabled: blockingEnabled });
            return true;
        }
        
        if (request.action === 'toggleCatReplacement') {
            catReplacementEnabled = request.enabled;
            chrome.storage.local.set({ catReplacementEnabled: catReplacementEnabled });
            sendResponse({ enabled: catReplacementEnabled });
            return true;
        }
        
        if (request.action === 'togglePositivityBubble') {
            positivityBubbleEnabled = request.enabled;
            chrome.storage.local.set({ positivityBubbleEnabled: positivityBubbleEnabled });
            sendResponse({ enabled: positivityBubbleEnabled });
            return true;
        }
        
        if (request.action === 'getStatus') {
            sendResponse({
                adsBlocked: adsBlocked,
                blockingEnabled: blockingEnabled,
                catReplacementEnabled: catReplacementEnabled,
                positivityBubbleEnabled: positivityBubbleEnabled
            });
            return true;
        }
    }
);

console.log('Background script loaded');