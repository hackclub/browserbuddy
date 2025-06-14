if (typeof browser === "undefined") {
  var browser = chrome;
}

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({});

  if (existingContexts.some((c) => c.contextType === "OFFSCREEN_DOCUMENT")) return;

  await chrome.offscreen.createDocument({
    url: "offscreen/offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Process tab audio for visualization",
  });
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action == "start") {
    await ensureOffscreenDocument();

    browser.runtime.sendMessage({
      action: "start_offscreen",
      options: { streamId: message.options.streamId, tabId: message.options.tabId },
    });
  }

  if (message.action == "audio_start") {
    browser.tabs.sendMessage(message.options.tabId, { action: "start", options: message.options });
  }

  if (message.action == "audio_data") {
    browser.tabs.sendMessage(message.options.tabId, { action: "data", data: message.options.data });
  }
});
