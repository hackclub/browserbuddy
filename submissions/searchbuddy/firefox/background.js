chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    settings: { list: [], offsetX: 0, offsetY: 0, offsetW: 0, offsetH: 0 },
    history: [],
  });
});

chrome.runtime.onMessage.addListener(
  /**
   *
   * @param {{action: string, [key: string]: any }} request
   * @param {chrome.runtime.MessageSender} sender
   * @param {(response?: any) => void} sendResponse
   * @returns
   */
  (request, sender, sendResponse) => {
    if (request.action == "saveSettings") {
      chrome.storage.sync.set(request.settings);
      sendResponse();
    }

    if (request.action == "getSettings") {
      chrome.storage.sync.get(undefined, (result) => {
        sendResponse(result);
      });
    }

    if (request.action == "log") console.log(request.log); // debugging

    return true; // Keep the message channel open for async response
  }
);
