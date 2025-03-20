let runtime_callbacks = {
  load_model,
  get_model
};
let stl_file = null;

chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create({url: chrome.runtime.getURL("index.html"), selected: true});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    sendResponse(await runtime_callbacks[message.cmd](...(message.args ?? [])));
  })();
  return true;
});

function load_model(file_name, stl_data) {
  stl_file = [file_name, stl_data];
  chrome.tabs.create({url: chrome.runtime.getURL("index.html"), selected: true});
}

function get_model() {
  let ret = stl_file;
  stl_file = null;
  return ret;
}
