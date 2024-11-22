const apikey = document.getElementById('apikey');
const btn = document.getElementById('btn');

(() => {
    chrome.storage.sync.get(["apikey"], function(items){
        if(items && items != {} && items.apikey != undefined){
            apikey.innerHTML = "API Key is Set :D"
        }else{
            apikey.innerHTML = "API Key is Not Set :("
        }
    });
    btn.addEventListener('click', () => {
        let internalUrl = chrome.runtime.getURL("views/onboarding.html");
        chrome.tabs.create({ url: internalUrl });
    })
})()