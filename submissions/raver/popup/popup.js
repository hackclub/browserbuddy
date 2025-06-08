if (typeof browser === "undefined") {
  var browser = chrome;
}

document.getElementById("year").textContent = new Date().getFullYear();

/**
 *
 * @param {chrome.tabCapture.CaptureOptions} options
 * @returns
 */
const capturePromise = async (options) => new Promise((resolve) => browser.tabCapture.capture(options, resolve));

/**
 *
 * @param {chrome.tabCapture.GetMediaStreamOptions} options
 * @returns
 */
const getMediaStreamIdPromise = async (options) => new Promise((resolve) => browser.tabCapture.getMediaStreamId(options, resolve));

const fromTabButton = document.getElementById("fromTab");

fromTabButton.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["pixi.js/pixi.min.js"] });
  browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["pixi.js/unsafe-eval.js"] });
  browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["main.js"] });

  const streamId = await getMediaStreamIdPromise({ targetTabId: tab.id });

  browser.runtime.sendMessage({ action: "start", options: { streamId, tabId: tab.id } });
});

/**
 * @type {HTMLInputElement}
 */
const visibilitySwitch = document.getElementById("visibility");
visibilitySwitch.addEventListener("change", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  browser.tabs.sendMessage(tab.id, { action: visibilitySwitch.checked ? "add" : "remove" });
});

/**
 * @type {HTMLInputElement}
 */
const bass = document.getElementById("bass");

/**
 * @type {HTMLSpanElement}
 */
const bassValue = document.getElementById("bassValue");

/**
 * @type {HTMLInputElement}
 */
const treble = document.getElementById("treble");

/**
 * @type {HTMLSpanElement}
 */
const trebleValue = document.getElementById("trebleValue");

/**
 * @type {HTMLInputElement}
 */
const smoothing = document.getElementById("smoothing");

/**
 * @type {HTMLSpanElement}
 */
const smoothingValue = document.getElementById("smoothingValue");

bass.addEventListener("input", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  browser.tabs.sendMessage(tab.id, { action: "setRange", options: { bass: bass.value, treble: treble.value } });

  bassValue.textContent = bass.value;
});

treble.addEventListener("input", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  browser.tabs.sendMessage(tab.id, { action: "setRange", options: { bass: bass.value, treble: treble.value } });

  trebleValue.textContent = treble.value;
});

smoothing.addEventListener("input", async () => {
  browser.runtime.sendMessage({ action: "smoothing", options: { value: parseInt(smoothing.value) / 100 } });

  smoothingValue.textContent = parseInt(smoothing.value) / 100;
});
