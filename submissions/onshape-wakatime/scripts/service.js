
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.msg === "forceSendHeartbeat") {
    sendHeartbeat();
  }
});
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.local.set({
      apiKey: "",
      heartbeats: [],
      enabled: true,
      msg: "",
      api_url: "https://waka.hackclub.com/api"
    });
  }
});

function sendHeartbeat() {
  console.log("Sending heartbeat");
  try {
    chrome.storage.local.get().then((items) => {
      let enabled = items.enabled;
      if (!enabled) {
        return;
      }
      let heartbeats = items.heartbeats;
      let apiKey = items.apiKey;
      if (apiKey === "") {
        chrome.storage.local.set({ msg: "Please set your WakaTime API key." });
        return
      }
      let api_url = items.api_url;
      if (api_url === "") {
        chrome.storage.local.set({ msg: "Please set your WakaTime API URL." });
        return
      }
      try {
        if (heartbeats.length === 0) {
          return;
        }
      } catch (e) {
        return;
      }

      fetch(api_url+"/compat/wakatime/v1/users/current/heartbeats.bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify(heartbeats),
      })
        .then((response) => {
          if (response.ok) {
            chrome.storage.local.set({ heartbeats: [] });
            chrome.storage.local.set({ msg: "Heartbeats sent successfully at " + new Date().toLocaleTimeString() });
          } else if (response.status == 401) {
            chrome.storage.local.set({ msg: "Error: API key invalid" });
          } else if (response.status == 403) {
            chrome.storage.local.set({ msg: "Error: API key invalid" });
          }
          else {
            chrome.storage.local.set({ msg: "Error: Something went wrong! " + response.status.toString() });
          }
        })
    });
  }
  catch (e) {
    console.log(e);
  }
}

async function createHeartbeatTimer() {
  const alarm = await chrome.alarms.get("sendHeartbeat");
  if (typeof alarm === 'undefined') {
    chrome.alarms.create("sendHeartbeat", {
      delayInMinutes: 2,
      periodInMinutes: 2
    });
    sendHeartbeat();
  }
}
createHeartbeatTimer();

chrome.alarms.onAlarm.addListener(sendHeartbeat);