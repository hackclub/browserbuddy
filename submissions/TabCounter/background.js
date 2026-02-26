// Store tab information
let tabData = {};
let codeFileCount = 0;

// Code file extensions to track
const codeExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass',
  '.py', '.java', '.rb', '.php', '.go', '.swift', '.c', '.cpp', '.cs',
  '.sh', '.rs', '.dart', '.vue', '.json', '.xml', '.yaml', '.yml',
  '.md', '.sql', '.graphql', '.kt', '.kts', '.lua', '.pl', '.r',
  '.elm', '.ex', '.exs', '.hs', '.perl', '.h', '.m', '.mm'
];

// Initialize when extension loads
chrome.runtime.onInstalled.addListener(() => {
  initializeTracking();
});

// Initialize tracking for all tabs
function initializeTracking() {
  chrome.tabs.query({}, (tabs) => {
    const currentTime = Date.now();
    
    tabs.forEach(tab => {
      tabData[tab.id] = {
        url: tab.url,
        title: tab.title,
        openedAt: currentTime,
        isCode: checkIfCodeFile(tab.url)
      };
      
      if (checkIfCodeFile(tab.url)) {
        codeFileCount++;
      }
    });
    
    // Save to storage
    saveDataToStorage();
  });
}

// Check if a URL points to a code file
function checkIfCodeFile(url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return false;
  }
  
  // Extract filename from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // Check if the pathname ends with any code extension
  return codeExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Event listener for when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  tabData[tab.id] = {
    url: tab.url || '',
    title: tab.title || '',
    openedAt: Date.now(),
    isCode: checkIfCodeFile(tab.url)
  };
  
  if (checkIfCodeFile(tab.url)) {
    codeFileCount++;
  }
  
  saveDataToStorage();
});

// Event listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const wasCodeBefore = tabData[tabId]?.isCode || false;
    const isCodeNow = checkIfCodeFile(changeInfo.url);
    
    // Update code file count
    if (wasCodeBefore && !isCodeNow) {
      codeFileCount--;
    } else if (!wasCodeBefore && isCodeNow) {
      codeFileCount++;
    }
    
    // Update tab data
    tabData[tabId] = {
      ...tabData[tabId],
      url: changeInfo.url,
      isCode: isCodeNow
    };
  }
  
  if (changeInfo.title) {
    tabData[tabId] = {
      ...tabData[tabId],
      title: changeInfo.title
    };
  }
  
  saveDataToStorage();
});

// Event listener for when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabData[tabId]?.isCode) {
    codeFileCount--;
  }
  
  delete tabData[tabId];
  saveDataToStorage();
});

// Save data to chrome storage
function saveDataToStorage() {
  chrome.storage.local.set({
    tabData: tabData,
    codeFileCount: codeFileCount
  });
}

// Function to get current stats
function getStats() {
  const currentTime = Date.now();
  const tabCount = Object.keys(tabData).length;
  
  // Calculate average time and find longest open tab
  let totalTime = 0;
  let longestTime = 0;
  let longestTabId = null;
  
  for (const [tabId, data] of Object.entries(tabData)) {
    const timeOpen = currentTime - data.openedAt;
    totalTime += timeOpen;
    
    if (timeOpen > longestTime) {
      longestTime = timeOpen;
      longestTabId = tabId;
    }
  }
  
  const avgTimeOpen = tabCount > 0 ? totalTime / tabCount : 0;
  
  return {
    tabCount,
    codeFileCount,
    avgTimeOpen,
    longestTime,
    longestTabInfo: longestTabId ? tabData[longestTabId] : null
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse(getStats());
  }
  return true;
});
