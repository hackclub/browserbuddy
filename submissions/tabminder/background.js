chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.sync.get({ reminders: [] }, (data) => {
      let reminders = Array.isArray(data.reminders) ? data.reminders : [];
      const matchingReminders = reminders.filter(reminder =>
        reminder.pageUrl && tab.url.includes(reminder.pageUrl) &&
        (!reminder.snoozeUntil || Date.now() > reminder.snoozeUntil)
      );
      if (matchingReminders.length > 0) {
        const reminderHtmlUrl = chrome.runtime.getURL("reminder.html") +
          `?page=${encodeURIComponent(tab.url)}&title=${encodeURIComponent(tab.title)}`;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: injectReminderIframe,
          args: [reminderHtmlUrl]
        });
      }
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      chrome.storage.sync.get({ reminders: [] }, (data) => {
        let reminders = Array.isArray(data.reminders) ? data.reminders : [];
        const matchingReminders = reminders.filter(reminder =>
          reminder.pageUrl && tab.url.includes(reminder.pageUrl) &&
          (!reminder.snoozeUntil || Date.now() > reminder.snoozeUntil)
        );
        if (matchingReminders.length > 0) {
          const reminderHtmlUrl = chrome.runtime.getURL("reminder.html") +
            `?page=${encodeURIComponent(tab.url)}&title=${encodeURIComponent(tab.title)}`;
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: injectReminderIframe,
            args: [reminderHtmlUrl]
          });
        }
      });
    }
  });
});

function injectReminderIframe(iframeUrl) {
  let existingIframe = document.getElementById("tabminder-notification-iframe");
  if (existingIframe) {
    existingIframe.remove();
  }
  let iframe = document.createElement("iframe");
  iframe.id = "tabminder-notification-iframe";
  iframe.src = iframeUrl;
  iframe.style.position = "fixed";
  iframe.style.top = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "300px";
  if (iframeUrl.includes("reminder.html")) {
    iframe.style.height = "auto";
  } else {
    iframe.style.height = "200px";
  }
  iframe.style.border = "none";
  iframe.style.borderRadius = "15px";
  iframe.style.zIndex = "10000";
  iframe.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  document.body.appendChild(iframe);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'closeIframe' && sender.tab && sender.tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: () => {
        const iframe = document.getElementById("tabminder-iframe");
        if (iframe) iframe.remove();
      }
    });
  }
  if (message.action === 'closeReminderIframe' && sender.tab && sender.tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: () => {
        const iframe = document.getElementById("tabminder-notification-iframe");
        if (iframe) iframe.remove();
      }
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) {
    chrome.notifications.create('error', {
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'TabMinder Error',
      message: 'TabMinder cannot be used on this page.'
    });
    return;
  }

  const pageUrl = tab.url;
  const pageTitle = tab.title;
  const iframeUrl = chrome.runtime.getURL("iframe.html") +
    `?page=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}`;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleIframe,
    args: [iframeUrl]
  });
});

function toggleIframe(iframeUrl) {
  let existingIframe = document.getElementById("tabminder-iframe");
  if (existingIframe) {
    existingIframe.remove();
  } else {
    let iframe = document.createElement("iframe");
    iframe.id = "tabminder-iframe";
    iframe.src = iframeUrl;
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "300px";
    iframe.style.height = "400px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "15px";
    iframe.style.zIndex = "10000";
    iframe.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    document.body.appendChild(iframe);
  }
}
