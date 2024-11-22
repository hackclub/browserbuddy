const button = document.getElementById('button');
const apikey = document.getElementById('apikey');

(() => {
    chrome.storage.sync.get(["apikey"], function(items){
        if(items && items != {} && items.apikey != undefined){
            apikey.value = items.apikey;
        }
    });
    button.addEventListener('click', () => {
        if(apikey.value == ""){
            alert("Please enter a api key...");
        }else{
            chrome.storage.sync.set({ "apikey": apikey.value }, function(){
                alert("Horray !! API Key Successfully set...");
            });
        }
    })
})()