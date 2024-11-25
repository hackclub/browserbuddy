chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    font: "OpenDyslexic",
    fontSize: 16,
    letterSpacing: 0.1,
    lineSpacing: 1.5,
    bgColor: "#ffffff",
    tts: false,
  });
});
