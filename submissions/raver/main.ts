import * as Px from "./pixi.js/pixi";
import { Ticker } from "./pixi.js/pixi.js";

import { sigmoid } from "./utils";

// Create a PixiJS Application
const app = new Px.Application();
await app.init({
  width: window.innerWidth, // Full width of the window
  height: window.innerHeight, // Full height of the window
  backgroundAlpha: 0, // Transparent background
  resolution: window.devicePixelRatio || 1, // Adjust for retina displays
  resizeTo: window, // Resize the renderer to fill the window
});

const ticker = new Ticker();
ticker.minFPS = 60;
ticker.maxFPS = 144;

ticker.start();

const canvas = document.body.appendChild(app.canvas); // TODO: Fix this
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";

const audioContext = new AudioContext();
const analyser = new AnalyserNode(audioContext, { fftSize: 2 ** 14 });
const frequencyData = new Uint8Array(analyser.frequencyBinCount);
const eachBinWidth = audioContext.sampleRate / analyser.fftSize;

let treble = 20000;
let bass = 0;

let clampedFrequencyDataLength = Math.floor((treble - bass) / eachBinWidth) + 1;

function updateClampedFrequencyDataLength() {
  clampedFrequencyDataLength = Math.floor((treble - bass) / eachBinWidth) + 1;
  console.log(clampedFrequencyDataLength);
}

updateClampedFrequencyDataLength();

const trebleInput = document.getElementById("treble") as HTMLInputElement;
const trebleValue = document.getElementById("trebleValue") as HTMLSpanElement;
trebleInput.value = treble.toString();

trebleInput.addEventListener("input", (event) => {
  treble = parseInt((event.target as HTMLInputElement).value);
  updateClampedFrequencyDataLength();

  trebleValue.textContent = treble.toString();
});

const bassInput = document.getElementById("bass") as HTMLInputElement;
const bassValue = document.getElementById("bassValue") as HTMLSpanElement;
bassInput.value = bass.toString();

bassInput.addEventListener("input", (event) => {
  bass = parseInt((event.target as HTMLInputElement).value);
  updateClampedFrequencyDataLength();

  bassValue.textContent = bass.toString();
});

const smoothingInput = document.getElementById("smoothing") as HTMLInputElement;
const smoothingValue = document.getElementById("smoothingValue") as HTMLSpanElement;
smoothingInput.value = (analyser.smoothingTimeConstant * 100).toString();

smoothingInput.addEventListener("input", (event) => {
  analyser.smoothingTimeConstant = parseInt((event.target as HTMLInputElement).value) / 100;

  smoothingValue.textContent = analyser.smoothingTimeConstant.toString();
});

let audioSource: MediaStreamAudioSourceNode | undefined;

const fromMicButton = document.getElementById("fromMic") as HTMLButtonElement;
const fromTabButton = document.getElementById("fromTab") as HTMLButtonElement;

function loadAudio(stream: MediaStream) {
  if (audioSource) audioSource.disconnect();

  audioSource = audioContext.createMediaStreamSource(stream);
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
}

fromMicButton.addEventListener("click", async () =>
  loadAudio(
    await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        echoCancellation: false,
        autoGainControl: false,
      },
    })
  )
);

fromTabButton.addEventListener("click", async () =>
  loadAudio(
    await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: false,
    })
  )
);

function render() {
  const data = frequencyData.slice(bass / eachBinWidth, treble / eachBinWidth);

  animateLights(data);
  animateBars(data);
  renderBass(frequencyData);
  detectBeat(frequencyData);
  renderBeat();
}

ticker.add(render, {});

const behindStage = new Px.Container({});

app.stage.addChild(behindStage);

const gradient = new Px.FillGradient(0, 0, window.innerWidth, window.innerHeight);

gradient.addColorStop(0, 0xff0000);
gradient.addColorStop(0.4, 0x000000);
gradient.addColorStop(0.7, 0x000000);
gradient.addColorStop(1, 0xff0000);

const bassVisualizer = new Px.Graphics({}).rect(0, 0, window.innerWidth, window.innerHeight).fill(gradient);

bassVisualizer.tint = 0x000000;

behindStage.addChild(bassVisualizer);

function renderBass(data: Uint8Array) {
  const bassData = data.slice(0, Math.floor(200 / eachBinWidth));

  const bassIntensity = bassData.reduce((acc, curr) => acc + curr, 0) / 255 / bassData.length;

  bassVisualizer.tint = sigmoid(bassIntensity, 10, 0.5) * 0xffffff;
}

app.renderer?.on("resize", () => {
  bassVisualizer.clear().rect(0, 0, window.innerWidth, window.innerHeight).fill(gradient);
});

const lightsCount = 30;

const lights: Px.Graphics[] = [];

for (let i = 0; i < lightsCount; i++) {
  const light = new Px.Graphics({
    x: Math.random() * window.innerWidth,
    y: Math.random() * (window.innerHeight - 400),
  });

  light.circle(0, 0, 10).fill(0xffffff);

  app.stage.addChild(light);
  lights.push(light);
}

function animateLights(data: Uint8Array) {
  lights.forEach((light, i) => {
    const frequencyIndex = Math.floor((i / lights.length) * clampedFrequencyDataLength);

    const intensity = data[frequencyIndex] / 255;

    const hue = Math.floor((i / lights.length) * 360);

    light.clear().circle(0, 0, 10).fill(`hsl(${hue}, 100%, 50%)`);

    // light.tint = intensity * 0xffffff;
    light.scale.set(sigmoid(intensity, 5, 0.5) * 10);
    light.alpha = intensity;
  });
}

const barsCount = 200;
let barWidth = window.innerWidth / barsCount;

const bars: Px.Graphics[] = [];

for (let i = 0; i < barsCount; i++) {
  const hue = Math.floor((i / barsCount) * 360);

  const bar = new Px.Graphics({}).rect(i * barWidth, window.innerHeight - 200, barWidth, 200).fill(`hsl(${hue}, 100%, 50%)`);

  app.stage.addChild(bar);
  bars.push(bar);
}

function animateBars(data: Uint8Array) {
  bars.forEach((bar, i) => {
    const frequencyIndex = Math.floor((i / bars.length) * clampedFrequencyDataLength);

    const intensity = data[frequencyIndex] / 255;

    const hue = Math.floor((i / bars.length) * 360);

    bar
      .clear()
      .rect(i * barWidth, window.innerHeight - intensity * window.innerHeight, barWidth, intensity * window.innerHeight)
      .fill(`hsl(${hue}, 100%, 50%)`);

    bar.tint = intensity * 0xffffff;
  });
}

const HISTORY_SIZE = 5; // The number of recent amplitude values to consider
const amplitudeHistory: number[] = [];

function detectBeats(data: Uint8Array): boolean {
  // Calculate the average amplitude
  const sum = data.reduce((acc, value) => acc + value, 0);
  const average = sum / data.length;

  // Update the amplitude history
  amplitudeHistory.push(average);
  if (amplitudeHistory.length > HISTORY_SIZE) {
    amplitudeHistory.shift(); // Remove the oldest amplitude value
  }

  // Calculate the moving average and standard deviation
  const historyAverage = amplitudeHistory.reduce((a, b) => a + b, 0) / amplitudeHistory.length;
  const variance = amplitudeHistory.reduce((a, b) => a + Math.pow(b - historyAverage, 2), 0) / amplitudeHistory.length;
  const standardDeviation = Math.sqrt(variance);

  // Set a dynamic threshold based on the moving average and standard deviation
  const dynamicThreshold = historyAverage + standardDeviation * 1.7;

  return average > dynamicThreshold;
}

const theBeats: Px.Graphics[] = [];

let lastBeat = 0;

function detectBeat(data: Uint8Array) {
  if (!detectBeats(data)) return;

  const now = Date.now();
  if (now - lastBeat < 100) return;

  lastBeat = now;

  const beat = new Px.Graphics({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
    .circle(0, 0, 10)
    .fill(0x00aeff);

  beat.scale.set(7);

  const innerCircle = new Px.Graphics({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
    .circle(0, 0, 10)
    .fill(0);

  innerCircle.scale.set(4);

  beat.setMask(innerCircle);

  behindStage.addChild(beat);

  theBeats.push(beat);
}

function renderBeat() {
  const removeIndices: number[] = [];

  theBeats.forEach((beat, index) => {
    beat.scale.set(beat.scale.x * 1.1);

    beat.alpha -= 0.03;

    if (beat.alpha < 0) {
      behindStage.removeChild(beat);

      removeIndices.push(index);
    }
  });

  removeIndices.reverse().forEach((index) => theBeats.splice(index, 1));
}
