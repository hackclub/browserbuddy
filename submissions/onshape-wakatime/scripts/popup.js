chrome.storage.local.get().then((items) => {
    console.log(items.apiKey);
    let api_key = document.getElementById("api_key");
    api_key.value = items.apiKey;
    api_key.addEventListener("change", function () {
        chrome.storage.local.set({ apiKey: api_key.value });
    });
    
    let enabled = document.getElementById("enabled");
    enabled.checked = items.enabled;
    enabled.addEventListener("change", function () {


        chrome.storage.local.set({ enabled: enabled.checked });
    });

    let msg = document.getElementById("msg");
    msg.innerText = items.msg;

    let api_url = document.getElementById("api_url");
    api_url.value = items.api_url;
    api_url.addEventListener("change", function () {
        chrome.storage.local.set({ api_url: api_url.value });
    });

    let sendHeartbeat = document.getElementById("sendHeartbeat");
    sendHeartbeat.addEventListener("click", function () {
        chrome.runtime.sendMessage({ msg: "forceSendHeartbeat" });
    });
  });

  button = document.getElementById("help");
    button.addEventListener("click", link_open);
function link_open() {
    chrome.tabs.create({ url: "https://github.com/JeffreyWangDev/onshape-wakatime/blob/main/README.md#api-key" });
}