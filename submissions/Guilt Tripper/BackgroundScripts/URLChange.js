//to anyone reading, i'm very new to JS and extension building, so please don't mind the family reunion of if statements nested within one another. thanks!

chrome.tabs.onUpdated.addListener(function(_tabId, changeInfo, _tab) {
    if(changeInfo.url != undefined) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(tabs[0].url.startsWith("https://www.youtube.com", 0)) {
                console.log(tabs[0]);
                chrome.tabs.sendMessage(tabs[0].id, "url change detected", function(msg) {
                    msg = msg || {};
                    if(chrome.runtime.lastError) {
                        if (msg.status != "exist") {
                            console.log("content script doesn't exist - injecting");
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                files: ["ContentScripts/script.js"]
                            });
                        }
                    }
                });
            }
        });
    }
});