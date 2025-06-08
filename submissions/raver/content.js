if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action == "start") {
    injectRave(message.options);
  }

  if (message.action == "data") {
    if (!window.renderRave) return;
    window.renderRave(Uint8Array.from(message.data.split(",").map((v) => parseInt(v))));
  }

  if (message.action == "remove") {
    hideCanvas();
  }

  if (message.action == "add") {
    showCanvas();
  }

  if (message.action == "setRange") {
    if (!window.setRange) return;
    window.setRange(message.options.bass, message.options.treble);
  }
});
