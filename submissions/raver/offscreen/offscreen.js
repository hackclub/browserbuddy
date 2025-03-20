if (typeof browser === "undefined") {
  var browser = chrome;
}

let analyser;

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action == "start_offscreen") {
    const { streamId, tabId } = message.options;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser({ fftSize: message.options.fftSize });
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    browser.runtime.sendMessage({
      action: "audio_start",
      options: {
        fftSize: analyser.fftSize,
        frequencyBinCount: analyser.frequencyBinCount,
        sampleRate: audioContext.sampleRate,
        tabId,
      },
    });

    const data = new Uint8Array(analyser.frequencyBinCount);

    setInterval(() => {
      analyser.getByteFrequencyData(data);

      browser.runtime.sendMessage({ action: "audio_data", options: { data: data.toString(), tabId } });
    }, 1000 / 65);
  }

  if (message.action == "smoothing") {
    analyser.smoothingTimeConstant = message.options.value;
  }
});
