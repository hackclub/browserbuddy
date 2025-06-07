let tabDataMap = {};
let obituaryLog = [];
const REDIRECT_404 = true;
let popupEnabled = true;
let soundEnabled = true;

class BadgeAnimator {
  constructor() {
    this.isAnimating = false;
    this.frames = [
      { text: "†", color: "#673ab7" },
      { text: "†", color: "#9c27b0" },
      { text: "†", color: "#e91e63" }, 
      { text: "†", color: "#f44336" }, 
      { text: "†", color: "#9c27b0" }, 
      { text: "†", color: "#673ab7" }  
    ];
    this.deathCount = 0;
  }

  animate() {
    this.deathCount++;
    
    if (!this.isAnimating) {
      chrome.action.setBadgeText({ text: this.deathCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: "#673ab7" });
    }
    
    this.runAnimation();
  }

  runAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    let frameIndex = 0;
    
    const currentText = this.deathCount.toString();
    
    const animInterval = setInterval(() => {
      const frame = this.frames[frameIndex];
      chrome.action.setBadgeText({ text: frame.text });
      chrome.action.setBadgeBackgroundColor({ color: frame.color });
      
      frameIndex++;
      
      if (frameIndex >= this.frames.length) {
        clearInterval(animInterval);
        
        setTimeout(() => {
          chrome.action.setBadgeText({ text: currentText });
          chrome.action.setBadgeBackgroundColor({ color: "#673ab7" });
          this.isAnimating = false;
        }, 800);
      }
    }, 150);
  }

  resetCount() {
    this.deathCount = 0;
    chrome.action.setBadgeText({ text: "" });
  }
}

let badgeAnimator = null;

const initializeUtilities = async () => {
  try {
    badgeAnimator = new BadgeAnimator();

    const data = await chrome.storage.local.get(['popupEnabled', 'soundEnabled']);
    if (data.hasOwnProperty('popupEnabled')) {
      popupEnabled = data.popupEnabled;
    }
    if (data.hasOwnProperty('soundEnabled')) {
      soundEnabled = data.soundEnabled;
    } else {  
      await chrome.storage.local.set({ soundEnabled: true });
    }
  } catch (error) {
    console.error('Error initializing utilities:', error);
  }
};

const CAUSES_OF_DEATH = [
  "clicked away in disgust",
  "abandoned for a more interesting tab",
  "closed without being read",
  "victim of a tab cleanup spree",
  "sacrificed to free up memory",
  "forgotten in the sea of open tabs",
  "tragically closed before its time",
  "left unattended for too long",
  "dismissed in a moment of digital rage",
  "perished from lack of user attention",
  "shut down during browser maintenance",
  "lost to the void of productivity",
  "expired from neglect",
  "died of loneliness at the end of the tab bar",
  "met its demise at the hands of a ruthless user",
  "succumbed to the dreaded X button",
  "was cast into digital oblivion",
  "achieved its final render before expiration",
  "collapsed under the weight of its own DOM",
  "suffocated by too many concurrent processes",
  "fell victim to the dreaded browser crash",
  "was mercilessly evicted from RAM",
  "suffered a fatal case of browser fatigue",
  "was sentenced to the great recycle bin in the sky",
  "faced the ultimate Ctrl+W execution",
  "was purged during a digital cleansing ritual",
  "withered away from digital decay",
  "vanished into the ether of closed connections",
  "was banished to the realm of forgotten URLs",
  "met its end when the user found something more interesting"
];

const TIME_PHRASES = [
  "mere moments",
  "a brief %s seconds",
  "only %s minutes",
  "a respectable %s minutes",
  "a lengthy %s hours and %s minutes",
  "an impressive %s hours",
  "a marathon %s days, %s hours",
  "an ephemeral %s seconds of existence",
  "a fleeting %s minutes in the digital realm",
  "a noble %s hours of service",
  "a brief candle of %s minutes",
  "a dignified lifetime of %s hours",
  "an honorable %s minutes before the end",
  "a surprisingly long %s hours before meeting its fate",
  "exactly %s minutes and %s seconds (not that anyone was counting)",
  "barely %s minutes before expiring"
];

const MELODRAMATIC_PHRASES = [
  "In Memoriam: ",
  "We regret to announce the passing of ",
  "Taken too soon: ",
  "With heavy hearts, we announce the departure of ",
  "Farewell to ",
  "R.I.P. ",
  "Gone but not forgotten: ",
  "In loving memory of ",
  "Dearly departed: ",
  "The digital world mourns the loss of ",
  "Alas, poor ",
  "Weep for ",
  "Forever silenced: ",
  "In the digital graveyard lies ",
  "The browser has tolled the bell for ",
  "Shed a tear for the demise of ",
  "Heaven has gained another angel: ",
  "Tragically departed: ",
  "Here lies the memory of ",
  "Let us observe a moment of silence for ",
  "Memento mori: ",
  "The last pixel has rendered for ",
  "No longer among the living tabs: ",
  "Lost but not forgotten: ",
  "The end has come for "
];

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const formatTimeAlive = (startTime) => {
  const timeAliveMs = Date.now() - startTime;
  const seconds = Math.floor(timeAliveMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 10) {
    return "mere moments";
  } else if (seconds < 60) {
    return `a brief ${seconds} seconds`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours === 1 ? '' : 's'}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}` : ''}`;
  } else {
    const remainingHours = hours % 24;
    return `${days} day${days === 1 ? '' : 's'}${remainingHours > 0 ? ` and ${remainingHours} hour${remainingHours === 1 ? '' : 's'}` : ''}`;
  }
};

const extractDomain = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  } catch (e) {
    return url;
  }
};

const initExtension = async () => {
  console.log("Tabituary: Initializing extension");
  
  const data = await chrome.storage.local.get(['tabDataMap', 'obituaryLog']);
  
  if (data.tabDataMap) {
    tabDataMap = data.tabDataMap;
  }
  
  if (data.obituaryLog) {
    obituaryLog = data.obituaryLog;
  }

  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (!tabDataMap[tab.id]) {
      tabDataMap[tab.id] = {
        id: tab.id,
        title: tab.title || "Untitled Tab",
        url: tab.url || "about:blank",
        createdTime: Date.now()
      };
    }
  });
  
  await chrome.storage.local.set({ tabDataMap });
  
  try {
    const activeTabs = tabs.filter(tab => 
      tab.active && 
      tab.url && 
      tab.url.startsWith('http') && 
      !tab.url.includes('chrome-extension://')
    );
    
    if (activeTabs.length > 0) {
      console.log('Pre-injecting content script into active tabs for faster popups');
      for (const tab of activeTabs) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['js/content.js']
        }).catch(err => {
          console.log('Could not preload content script in tab', tab.id);
        });
      }
    }
  } catch (error) {
    console.error('Error pre-injecting content scripts:', error);
  }
};

const generateObituary = (tabData) => {
  if (!tabData) return null;
  
  const timeAlive = formatTimeAlive(tabData.createdTime);
  const causeOfDeath = getRandomItem(CAUSES_OF_DEATH);
  const melodramaticPhrase = getRandomItem(MELODRAMATIC_PHRASES);
  
  const name = tabData.url ? extractDomain(tabData.url) : tabData.title.split(' ')[0];
  
  const cleanTitle = tabData.title.length > 40 ? 
    tabData.title.substring(0, 37) + '...' : 
    tabData.title;
  
  const message = `${cleanTitle} lived for ${timeAlive} before it ${causeOfDeath}.`;
  
  return {
    title: `${melodramaticPhrase}${name}`,
    message: message,
    url: tabData.url,
    createdTime: tabData.createdTime,
    deathTime: Date.now(),
    timeAlive: timeAlive,
    causeOfDeath: causeOfDeath,
    tabTitle: cleanTitle
  };
};

const playSound = async (soundType = 'obituary', volume = 0.7) => {
  try {
    console.log(`Tabituary: Attempting to play sound: ${soundType}`);
    
    const focusedTabs = await getFocusedTabs();
    for (const tab of focusedTabs) {
      const success = await trySoundInTab(tab.id, soundType, volume);
      if (success) {
        console.log(`Tabituary: Sound played successfully in focused tab ${tab.id}`);
        return true;
      }
    }
    
    const validTabs = await getAnyValidTabs();
    for (const tab of validTabs) {
      const success = await trySoundInTab(tab.id, soundType, volume);
      if (success) {
        console.log(`Tabituary: Sound played successfully in tab ${tab.id}`);
        return true;
      }
    }
    
    console.log('Tabituary: Failed to play sound in any tab');
    return false;
  } catch (error) {
    console.error('Tabituary: Error playing sound:', error);
    return false;
  }
};

const getFocusedTabs = async () => {
  try {
    const tabs = await chrome.tabs.query({active: true});
    return tabs.filter(tab => 
      tab && tab.id && tab.id !== 0 && 
      tab.url && 
      tab.url.startsWith('http') && 
      !tab.url.includes('chrome-extension://')
    );
  } catch (error) {
    console.error('Tabituary: Error getting focused tabs:', error);
    return [];
  }
};

const getAnyValidTabs = async () => {
  try {
    const allTabs = await chrome.tabs.query({});
    return allTabs.filter(tab => 
      tab && tab.id && tab.id !== 0 && 
      tab.url && 
      tab.url.startsWith('http') && 
      !tab.url.includes('chrome-extension://')
    );
  } catch (error) {
    console.error('Tabituary: Error getting any tabs:', error);
    return [];
  }
};

const trySoundInTab = async (tabId, soundType, volume) => {
  if (!tabId) return false;
  
  console.log(`Tabituary: Attempting to play sound "${soundType}" in tab ${tabId}`);
  
  try {
    await ensureContentScriptInjected(tabId);
    
    const result = await sendPlaySoundMessage(tabId, soundType, volume);
    if (result) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Tabituary: Error playing sound in tab ${tabId}:`, error);
    return false;
  }
};

const ensureContentScriptInjected = async (tabId) => {
  try {
    const pingResult = await new Promise(resolve => {
      chrome.tabs.sendMessage(
        tabId, 
        { action: 'ping' },
        response => {
          if (chrome.runtime.lastError) {
            resolve(false);
          } else {
            resolve(response && response.success);
          }
        }
      );
      
      setTimeout(() => resolve(false), 300);
    });
    
    if (pingResult) {
      return true;
    }
    
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['js/content.js']
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  } catch (error) {
    console.error('Tabituary: Error ensuring content script:', error);
    return false;
  }
};

const sendPlaySoundMessage = async (tabId, soundType, volume) => {
  return new Promise(resolve => {
    const timeoutId = setTimeout(() => {
      console.log('Tabituary: Sound message timeout');
      resolve(false);
    }, 2000);
    
    try {
      chrome.tabs.sendMessage(
        tabId,
        { action: 'playSound', sound: soundType, volume },
        response => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            console.warn('Tabituary: Message error:', chrome.runtime.lastError);
            resolve(false);
          } else if (response && response.success) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Tabituary: Message send error:', error);
      resolve(false);
    }
  });
};

const testSoundSystem = async () => {
  console.log('Tabituary: Testing sound system...');
  
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tabs || tabs.length === 0) {
    console.error('Tabituary: No tabs available for sound test');
    return false;
  }
  
  const testTab = tabs[0];
  if (!testTab || !testTab.id) {
    console.error('Tabituary: Invalid test tab');
    return false;
  }
  
  try {
    await injectAudioPlayer(testTab.id, true);
    
    const success = await chrome.scripting.executeScript({
      target: { tabId: testTab.id },
      func: () => {
        if (window.tabituaryAudioPlayer) {
          console.log('Tabituary: Running sound test');
          window.tabituaryAudioPlayer.hasUserInteraction = true;
          window.tabituaryAudioPlayer.testSound();
          return true;
        }
        return false;
      }
    });
    
    return success && success[0] && success[0].result === true;
  } catch (error) {
    console.error('Tabituary: Sound test error:', error);
    return false;
  }
};

const displayObituary = async (obituary) => {
  if (!obituary) return;
  
  try {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: obituary.title,
      message: obituary.message,
      priority: 2,
      requireInteraction: true,
      silent: true
    });
    
    if (badgeAnimator) {
      badgeAnimator.animate();
    }
    
    const tabQuery = await chrome.tabs.query({});
    
    const validTabs = tabQuery.filter(tab => 
      tab && tab.id && tab.id !== 0 && 
      tab.url && 
      tab.url.startsWith('http') && 
      !tab.url.includes('chrome-extension://')
    );
    
    let targetTab = null;
    if (validTabs.length > 0) {
      const activeTabIndex = validTabs.findIndex(tab => tab.active);
      targetTab = activeTabIndex >= 0 ? validTabs[activeTabIndex] : validTabs[0];
    }
    
    let popupShown = false;
    if (popupEnabled && targetTab) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          files: ['js/content.js']
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        popupShown = await new Promise((resolve) => {
          chrome.tabs.sendMessage(
            targetTab.id, 
            {
              action: 'showTabObituary',
              obituary: obituary,
              playSound: soundEnabled
            },
            (response) => {
              resolve(response?.success || false);
            }
          );
          
          setTimeout(() => resolve(false), 1000);
        }).catch(() => false);
        
        console.log('Tabituary: Popup display result:', popupShown ? 'shown' : 'failed');
      } catch (err) {
        console.error('Tabituary: Popup injection error:', err);
        popupShown = false;
      }
    }

    if (soundEnabled && !popupShown && targetTab) {
      console.log('Tabituary: Popup failed or disabled, trying to play sound separately');
      try {
        await trySoundInTab(targetTab.id, obituary.is404 ? '404' : 'obituary', 0.6).catch(e => {
          console.error('Tabituary: Sound error:', e);
          return false;
        });
      } catch (soundError) {
        console.error('Tabituary: Error playing sound:', soundError);
      }
    }
    
  } catch (error) {
    console.error("Tabituary: Error in displayObituary:", error);
    
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: obituary.title,
        message: obituary.message,
        priority: 2,
        requireInteraction: true,
        silent: true
      });
    } catch (notifError) {
      console.error("Tabituary: Error creating notification:", notifError);
    }
  }
};

chrome.tabs.onCreated.addListener(async (tab) => {
  tabDataMap[tab.id] = {
    id: tab.id,
    title: tab.title || "Untitled Tab",
    url: tab.url || "about:blank",
    createdTime: Date.now()
  };
  
  await chrome.storage.local.set({ tabDataMap });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabDataMap[tabId] && (changeInfo.title || changeInfo.url)) {
    tabDataMap[tabId] = {
      ...tabDataMap[tabId],
      title: tab.title || tabDataMap[tabId].title,
      url: tab.url || tabDataMap[tabId].url
    };
    
    await chrome.storage.local.set({ tabDataMap });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const tabData = tabDataMap[tabId];
  
  if (tabData) {
    const obituary = generateObituary(tabData);
    
    if (obituary) {
      obituaryLog.unshift(obituary);
      
      if (obituaryLog.length > 100) {
        obituaryLog = obituaryLog.slice(0, 100);
      }
      
      await chrome.storage.local.set({ obituaryLog });
      
      displayObituary(obituary);
    }
    
    delete tabDataMap[tabId];
    await chrome.storage.local.set({ tabDataMap });
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    try {
      const currentTabs = await chrome.tabs.query({});
      const currentTabIds = new Set(currentTabs.map(tab => tab.id));

      const tabsToRemove = [];
      for (const tabId in tabDataMap) {
        if (!currentTabIds.has(parseInt(tabId))) {
          tabsToRemove.push(parseInt(tabId));
        }
      }
      
      for (const tabId of tabsToRemove) {
        const tabData = tabDataMap[tabId];
        if (tabData) {
          const obituary = generateObituary(tabData);
          
          if (obituary) {
            obituaryLog.unshift(obituary);
            
            if (obituaryLog.length > 100) {
              obituaryLog = obituaryLog.slice(0, 100);
            }
            
            await chrome.storage.local.set({ obituaryLog });
            
            displayObituary(obituary);
          }
          
          delete tabDataMap[tabId];
        }
      }
      
      if (tabsToRemove.length > 0) {
        await chrome.storage.local.set({ tabDataMap });
      }
    } catch (error) {
      console.error('Error in window focus tracking:', error);
    }
  }
});

const syncTabData = async () => {
  try {
    const currentTabs = await chrome.tabs.query({});
    const currentTabIds = new Set(currentTabs.map(tab => tab.id));
    
    let changes = false;
    
    for (const tabId in tabDataMap) {
      if (!currentTabIds.has(parseInt(tabId))) {
        delete tabDataMap[tabId];
        changes = true;
      }
    }
    
    for (const tab of currentTabs) {
      if (!tabDataMap[tab.id]) {
        tabDataMap[tab.id] = {
          id: tab.id,
          title: tab.title || "Untitled Tab",
          url: tab.url || "about:blank",
          createdTime: Date.now()
        };
        changes = true;
      }
    }
    
    if (changes) {
      await chrome.storage.local.set({ tabDataMap });
    }
  } catch (error) {
    console.error('Error syncing tab data:', error);
  }
};

setInterval(syncTabData, 30000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSoundSettings') {
    soundEnabled = message.enabled;
    chrome.storage.local.set({ soundEnabled: message.enabled });
    sendResponse({ success: true, soundEnabled: message.enabled });
  } else if (message.action === 'updatePopupSettings') {
    popupEnabled = message.enabled;
    sendResponse({ success: true, popupEnabled: message.enabled });
  } else if (message.action === 'resetBadgeCount' && badgeAnimator) {
    badgeAnimator.resetCount();
    sendResponse({ success: true });
  } else if (message.action === 'testNotification') {
    const testObituary = {
      title: "Test 404 Notification",
      message: message.message || "This is a test 404 notification",
      url: sender.tab ? sender.tab.url : "https://example.com/404",
      createdTime: Date.now(),
      deathTime: Date.now(),
      timeAlive: "test duration",
      causeOfDeath: "404 Test",
      tabTitle: "404 Test Page",
      is404: true
    };
    
    displayObituary(testObituary);
    
    sendResponse({success: true, message: "Test notification displayed"});
  } else if (message.action === 'test404Detection') {
    if (sender.tab) {
      handle404Page(sender.tab);
      sendResponse({success: true, message: "404 detection test triggered"});
    } else {
      sendResponse({success: false, message: "No valid tab found for testing"});
    }
  } else if (message.action === 'testSound') {
    playSound('test', 0.3).then(success => {
      sendResponse({success, message: success ? "Sound played" : "Failed to play sound"});
    });
    return true;
  } else if (message.action === 'contentScriptReady') {
    console.log('Tabituary: Content script ready in tab:', sender.tab ? sender.tab.id : 'unknown');
    sendResponse({success: true, message: "Background script acknowledged"});
  } else if (message.action === 'contentScriptLoaded') {
    console.log('Tabituary: Content script loaded in tab:', sender.tab ? sender.tab.id : 'unknown', 'at', message.location || 'unknown location');
    sendResponse({success: true, message: "Background script acknowledged"});
  } else if (message.action === 'userInteraction') {
    console.log('Tabituary: User interaction detected in tab:', sender.tab ? sender.tab.id : 'unknown', 'event:', message.event || 'click');
    
    if (sender.tab && sender.tab.id) {
      setTimeout(() => {
        chrome.tabs.sendMessage(
          sender.tab.id,
          { action: 'playSound', sound: 'test', volume: 0.1 },
          (response) => {
            console.log('Tabituary: Test sound after interaction result:', response);
          }
        );
      }, 500);
    }
    
    sendResponse({success: true, message: "Interaction registered"});
  }
  
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  badgeAnimator = new BadgeAnimator();
  await initializeUtilities();
  initExtension();
  
  setup404Detection();
});

const setup404Detection = () => {
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId !== 0) return;
    
    try {
      const tab = await chrome.tabs.get(details.tabId);
      
      if (!tab.url || !tab.url.startsWith('http')) return;
      
      console.log('Checking for 404 page:', tab.url);
      
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: detect404Page
      }).then(injectionResults => {
        if (injectionResults && injectionResults[0] && injectionResults[0].result === true) {
          console.log('404 page detected:', tab.url);
          handle404Page(tab);
        }
      }).catch(err => {
        console.error('Error executing 404 detection script:', err);
      });
    } catch (error) {
      console.error('Error checking for 404 page:', error);
    }
  });
  
  try {
    chrome.webRequest.onCompleted.addListener(
      async (details) => {
        if (details.statusCode === 404) {
          console.log('HTTP 404 status detected via webRequest:', details.url);
          try {
            const tab = await chrome.tabs.get(details.tabId);
            setTimeout(() => {
              handle404Page(tab);
            }, 500);
          } catch (error) {
            console.error('Error handling 404 from webRequest:', error);
          }
        }
      },
      { urls: ['<all_urls>'], types: ['main_frame'] }
    );
    console.log('WebRequest listener for 404 status codes registered');
  } catch (error) {
    console.error('Failed to register webRequest listener:', error);
  }
};

const detect404Page = () => {
  console.log('Running 404 detection on page');
  
  try {
    const httpStatus = 
      document.querySelector('meta[name="http-status"]')?.getAttribute('content') ||
      document.querySelector('meta[property="http-status"]')?.getAttribute('content');
    
    if (httpStatus === '404') {
      console.log('404 detected from meta tag');
      return true;
    }
    
    const title = document.title.toLowerCase();
    const bodyText = document.body?.innerText.toLowerCase() || '';
    
    const notFoundIndicators = [
      '404',
      'not found',
      'page not found',
      'cannot be found',
      'doesn\'t exist',
      'does not exist',
      'error 404',
      'page missing',
      'page unavailable',
      'not exist',
      'no longer available',
      'could not be found',
      'missing',
      'error',
      'page doesn\'t exist'
    ];
    
    if (notFoundIndicators.some(phrase => title.includes(phrase))) {
      console.log('404 detected from title:', title);
      return true;
    }
    
    const firstFewHundredChars = bodyText.substring(0, 1000);
    if (notFoundIndicators.some(phrase => firstFewHundredChars.includes(phrase))) {
      console.log('404 detected from body text');
      return true;
    }

    const hasStatusCodeElement = 
      document.querySelector('.error-code, .status-code, .error-404, .http-error, .page-not-found, .not-found') ||
      document.querySelector('[class*="404"], [class*="not-found"], [id*="404"], [id*="not-found"]');
    
    if (hasStatusCodeElement) {
      console.log('404 detected from status code element');
      return true;
    }
    
    if (window.performance && window.performance.getEntries) {
      const entries = window.performance.getEntries();
      for (const entry of entries) {
        if (entry.responseStatus === 404) {
          console.log('404 detected from performance API');
          return true;
        }
      }
    }
    
    if (document.querySelector('.error-page, .error-container, .error-message, .error-content')) {
      const errorText = document.querySelector('.error-page, .error-container, .error-message, .error-content').innerText.toLowerCase();
      if (notFoundIndicators.some(phrase => errorText.includes(phrase))) {
        console.log('404 detected from error page structure');
        return true;
      }
    }
    
    if (window.location.href.toLowerCase().includes('404') || 
        window.location.href.toLowerCase().includes('not-found') || 
        window.location.href.toLowerCase().includes('error')) {
      console.log('404 detected from URL pattern');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in 404 detection:', error);
    return false;
  }
};

const handle404Page = async (tab) => {
  console.log('Handling 404 page:', tab.url);
  
  const domain = new URL(tab.url).hostname;
  const path = new URL(tab.url).pathname;
  
  const displayPath = path.length > 30 ? path.substring(0, 27) + '...' : path;
  const displayDomain = domain.length > 25 ? domain.substring(0, 22) + '...' : domain;
  
  const obituary = {
    title: "404 Page Not Found",
    message: `The page "${displayPath}" on ${displayDomain} never existed or has vanished into the digital void. No trace remains of what once might have been.`,
    url: tab.url,
    createdTime: Date.now(),
    deathTime: Date.now(),
    timeAlive: "unknown",
    causeOfDeath: "404 Not Found",
    tabTitle: "404 Page Not Found",
    is404: true
  };
  
  obituaryLog.unshift(obituary);
  
  if (obituaryLog.length > 100) {
    obituaryLog = obituaryLog.slice(0, 100);
  }
  
  await chrome.storage.local.set({ obituaryLog });
  
  await playSound('404', 0.9);
  
  if (badgeAnimator) {
    badgeAnimator.animate();
  }
};

chrome.runtime.onStartup.addListener(async () => {
  badgeAnimator = new BadgeAnimator();
  await initializeUtilities();
  initExtension();
  setup404Detection();
}); 