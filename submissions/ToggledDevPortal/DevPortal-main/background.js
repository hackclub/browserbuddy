// background.js

// Listen for messages from the content script (content.js)
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.redirect) {
      // Redirect the user to your extension's page
      chrome.tabs.create({ url: 'integrations.html?ghun=' + message.redirect }, function (tab) {
        // Send a response back to the content script to indicate successful redirection
        sendResponse({ success: true });
      });
    }

    if (message.replit) {
      
      // Redirect the user to your extension's page
      chrome.tabs.create({ url: 'integrations.html?repl=' + message.replit }, function (tab) {
        // Send a response back to the content script to indicate successful redirection
        sendResponse({ success: true });
      });
    }

    if (message.openai) {
      // Redirect the user to your extension's page
      chrome.tabs.create({ url: 'productivity.html?openai=' + message.openai }, function (tab) {
        // Send a response back to the content script to indicate successful redirection
        sendResponse({ success: true });
      });
    }

    if (message.sub1) {
      // Redirect the user to your extension's page
      chrome.tabs.create({ url: 'purchased.html?purchased=' + message.sub1 }, function (tab) {
        // Send a response back to the content script to indicate successful redirection
        sendResponse({ success: true });
      });
    }
    // To ensure sendResponse is called asynchronously
    return true;
  });
  