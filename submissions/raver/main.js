var Px = PIXI;

function sigmoid(value, steepness = 1, midpoint = 0.5) {
  return 1 / (1 + Math.exp(-steepness * (value - midpoint)));
}

/**
 *
 * @param {{
 *  fftSize: number
 *  frequencyBinCount: number
 *  sampleRate: number
 * }} options
 */

async function rave(options) {
  console.log("Raver Options:", options);

  console.log("Creating PixiJS Application...");

  // Create a PixiJS Application
  const app = new Px.Application();

  console.log(app);

  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
    resizeTo: window, // Resize the renderer to fill the window
  });

  console.log("PixiJS Application created");

  const canvas = document.body.appendChild(app.canvas); // TODO: Fix this
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999999";

  canvas.id = "rave-canvas";

  window.frequencyData = new Uint8Array(options.frequencyBinCount);
  const eachBinWidth = options.sampleRate / options.fftSize;

  let treble = 16000;
  let bass = 0;

  let clampedFrequencyDataLength = Math.floor((treble - bass) / eachBinWidth) + 1;

  function updateClampedFrequencyDataLength() {
    clampedFrequencyDataLength = Math.floor((treble - bass) / eachBinWidth) + 1;
    console.log(clampedFrequencyDataLength);
  }

  updateClampedFrequencyDataLength();

  /**
   *
   * @param {Uint8Array} rawData music data
   * @returns {void}
   */
  function render(rawData) {
    if (!rawData) return;
    const data = rawData.slice(bass / eachBinWidth, treble / eachBinWidth);

    animateLights(data);
    animateBars(data);
    // renderBass(frequencyData);
    detectBeat(rawData);
    renderBeat();
  }

  const behindStage = new Px.Container({});

  app.stage.addChild(behindStage);

  // const gradient = new Px.FillGradient(0, 0, window.innerWidth, window.innerHeight);
  // gradient.addColorStop(0, 0xff0000);
  // gradient.addColorStop(0.4, 0x000000);
  // gradient.addColorStop(0.7, 0x000000);
  // gradient.addColorStop(1, 0xff0000);

  // const bassVisualizer = new Px.Graphics({}).rect(0, 0, window.innerWidth, window.innerHeight).fill(gradient);
  // bassVisualizer.tint = 0x000000;

  // behindStage.addChild(bassVisualizer);

  function renderBass(data) {
    const bassData = data.slice(0, Math.floor(200 / eachBinWidth));

    const bassIntensity = bassData.reduce((acc, curr) => acc + curr, 0) / 255 / bassData.length;
    bassVisualizer.tint = sigmoid(bassIntensity, 10, 0.5) * 0xffffff;
  }

  app.renderer?.on("resize", () => {
    bassVisualizer.clear().rect(0, 0, window.innerWidth, window.innerHeight).fill(gradient);
  });

  const lightsCount = 30;

  const lights = [];
  for (let i = 0; i < lightsCount; i++) {
    const light = new Px.Graphics({
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight - 400),
    });

    light.circle(0, 0, 10).fill(0xffffff);

    app.stage.addChild(light);
    lights.push(light);
  }

  function animateLights(data) {
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

  const barsCount = 150;
  let barWidth = window.innerWidth / barsCount;

  const bars = [];
  for (let i = 0; i < barsCount; i++) {
    const hue = Math.floor((i / barsCount) * 360);

    const bar = new Px.Graphics({}).rect(i * barWidth, window.innerHeight - 200, barWidth, 200).fill(`hsl(${hue}, 100%, 50%)`);
    app.stage.addChild(bar);
    bars.push(bar);
  }

  function animateBars(data) {
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

  const amplitudeHistory = [];
  function detectBeats(data) {
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

  const theBeats = [];
  let lastBeat = 0;

  function detectBeat(data) {
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
    const removeIndices = [];
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

  function setRange(newBass, newTreble) {
    bass = newBass;
    treble = newTreble;

    updateClampedFrequencyDataLength();
  }

  return [render, setRange];
}

/**
 *
 * @param {Parameters<rave>[0]} options
 * @returns {void}
 */
async function injectRave(options) {
  if (window.__injectedRaver) return;

  window.__injectedRaver = true;

  const [renderRave, setRange] = await rave(options);

  window.renderRave = renderRave;
  window.setRange = setRange;
}

function hideCanvas() {
  const canvas = document.getElementById("rave-canvas");
  if (canvas) canvas.style.display = "none";
}

function showCanvas() {
  const canvas = document.getElementById("rave-canvas");
  if (canvas) canvas.style.display = "block";
}
