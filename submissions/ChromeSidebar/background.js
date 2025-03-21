const GOOGLE_ORIGIN = 'https://www.google.com';
chrome.sidePanel
.setPanelBehavior({ openPanelOnActionClick: true })
.catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['isFirstLaunch'], function(result) {
    if (result.isFirstLaunch === undefined) {
      // If isFirstLaunch flag is not set, set it
      chrome.storage.local.set({isFirstLaunch: false}, function() {
        console.log("Extension launched for the first time.");
        chrome.tabs.create({url: "./setup.html"});
      });
    } else {
      console.log("Not the first launch.");
    }
  });
});