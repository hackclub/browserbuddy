console.log("content script loaded (guilt tripper)");
let counter = 0;
let sec = 0;
let min = 0;
let hour = 0;
let actualTime = "0 hour(s), 0 minute(s), 0 second(s)";
let target = document.getElementById("offline-container");
let prompt = "Shorts watched: " + counter + " | Time spent on Youtube: " + actualTime;

function activate() {
    target = document.getElementById("offline-container");
    counter++;
    prompt = "Shorts watched: " + counter + " | Time spent on Youtube: " + actualTime;

    if(document.getElementById("guilttripper") == null) {
        target.insertAdjacentHTML("beforebegin", `<p id='guilttripper' style='color: red; font-size: 20px; font-weight: bold; text-align: center;'>${prompt}</p>`);
    }
    else {
        const destroy = document.getElementById("guilttripper");
        destroy.remove();
        target.insertAdjacentHTML("beforebegin", `<p id='guilttripper' style='color: red; font-size: 20px; font-weight: bold; text-align: center;'>${prompt}</p>`);
    }
}

//for when the page is reloaded on the shorts screen (doesn't get detected normally due to content script loading late)
if(document.location.href.startsWith("https://www.youtube.com/shorts/")) {
    console.log(document.location.href + " (initial script load)");
    activate();
}

//short detector
chrome.runtime.onMessage.addListener(function(_msg, _sender, sendResponse) {
    sendResponse({status: "exist"});
    if(document.location.href.startsWith("https://www.youtube.com/shorts/")) {
        activate();
    }
})

setInterval(function() {
    sec += 1;
    if(sec == 60) { //timing up
        sec = 0;
        min++;
        if(min == 60) {
            min = 0;
            hour++;
        }
    }
    actualTime = hour + " hour(s), " + min + " minute(s), " + sec + " second(s)";
    if(document.location.href.startsWith("https://www.youtube.com/shorts/")) {
        target = document.getElementById("offline-container");
        prompt = "Shorts watched: " + counter + " | Time spent on Youtube: " + actualTime;
        if(document.getElementById("guilttripper") == null) {
            target.insertAdjacentHTML("beforebegin", `<p id='guilttripper' style='color: red; font-size: 20px; font-weight: bold; text-align: center;'>${prompt}</p>`);
        }
        else {
            const destroy = document.getElementById("guilttripper");
            destroy.remove();
            target.insertAdjacentHTML("beforebegin", `<p id='guilttripper' style='color: red; font-size: 20px; font-weight: bold; text-align: center;'>${prompt}</p>`);
        }
    }
}, 1000);

