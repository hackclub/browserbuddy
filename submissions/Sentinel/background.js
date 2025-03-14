const serverUrl = "https://sentinel-apaq.onrender.com";
let defaultStudentId = "unknown";
let whitelist = [];

function getStudentId(callback) {
  chrome.storage.local.get("studentId", (data) => {
    const id = data.studentId || defaultStudentId;
    callback(id);
  });
}

function captureAndSendScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error("Error capturing tab:", JSON.stringify(chrome.runtime.lastError));
      return;
    }
    getStudentId((id) => {
      fetch(`${serverUrl}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          screenshot: dataUrl,
          timestamp: Date.now(),
        }),
      })
        .then((res) => res.text())
        .then((data) => console.log("Screenshot sent:", data))
        .catch((err) => console.error("Error sending screenshot:", err));
    });
  });
}

function sendActivity(url) {
  getStudentId((id) => {
    fetch(`${serverUrl}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, tabVisited: url })
    })
      .then((res) => res.text())
      .then((data) => console.log("Activity tracked:", data))
      .catch((err) => console.error("Error tracking activity:", err));
  });
}

async function updateWhitelist() {
  try {
    const res = await fetch(`${serverUrl}/rules`);
    const rules = await res.json();
    whitelist = rules.map(rule => rule.condition.url);
    updateDeclarativeRules(whitelist);
    console.log("Whitelist updated:", whitelist);
  } catch (err) {
    console.error("Error updating whitelist:", err);
  }
}

function updateDeclarativeRules(allowedUrls) {
  let dynamicRules = [];
  let ruleId = 1;
  allowedUrls.forEach((url) => {
    dynamicRules.push({
      id: ruleId,
      priority: 2,
      action: { type: "allow" },
      condition: {
        urlFilter: url,
        resourceTypes: ["main_frame"]
      }
    });
  });
  dynamicRules.push({
    id: 9999,
    priority: 1,
    action: { type: "block" },
    condition: {
      regexFilter: "https?://.*",
      resourceTypes: ["main_frame"]
    }
  });
  let removeIds = [];
  for (let i = 1; i < ruleId; i++) {
    removeIds.push(i);
  }
  removeIds.push(9999);
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules: dynamicRules
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating dynamic rules:", chrome.runtime.lastError);
    } else {
      console.log("Dynamic rules updated.");
    }
  });
}

updateWhitelist();
setInterval(updateWhitelist, 5000);

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.studentId) {
    chrome.storage.local.set({ studentId: message.studentId }, () => {
      console.log("Received student id from website:", message.studentId);
      sendResponse({ status: "ok" });
    });
    return true;
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      sendActivity(tab.url);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    sendActivity(changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      sendActivity(tabs[0].url);
    }
  });
});

setInterval(captureAndSendScreenshot, 1000);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("studentId", (data) => {
      if (!data.studentId) {
          chrome.tabs.create({ url: "http://ayaangrover.is-a.dev/sentinel/website/student" });
      }
  });
});

// hello! this is me, ayaan grover, the creator of this extension. i hope you're having a great day! :)