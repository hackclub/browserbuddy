const video = document.getElementById('video');
const statusElement = document.getElementById('status');
const studyTimeElement = document.getElementById('study-time');
const historyElement = document.getElementById('history');
const toggleLandmarksButton = document.getElementById('toggleLandmarks');

// Audio alert (ensure alert.mp3 is in your extension folder)
const alertSound = new Audio('alert.mp3');

// Daily study data is stored per day in localStorage.
let dailyStudyData = JSON.parse(localStorage.getItem('dailyStudyData')) || {};
let showLandmarks = true;
let studying = false;
let lastDetectionTime = Date.now();
let noFaceStart = null; // time when face is no longer detected

// Helper to get the dominant expression from a given expressions object
function getAverageExpression(expressions) {
  const expressionValues = Object.values(expressions);
  const maxExpressionValue = Math.max(...expressionValues);
  const dominantExpression = Object.keys(expressions).find(
    expression => expressions[expression] === maxExpressionValue
  );
  return dominantExpression;
}

// Use mediaDevices.getUserMedia to automatically trigger the browser's camera permission prompt.
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      statusElement.textContent = 'Camera access granted.';
      removeCameraOverlay(); // Remove overlay if present
    })
    .catch(err => {
      console.error(err);
      statusElement.textContent = "Camera access is required.";
      showCameraOverlay(); // Show custom overlay prompting user to enable camera access.
    });
}

// Creates an overlay with a prompt and a retry button.
function showCameraOverlay() {
  if (!document.getElementById('cameraOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'cameraOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '94%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '20px';

    overlay.innerHTML = `
      <div style="max-width: 600px; padding: 30px; background: rgba(255,255,255,0.1); border-radius: 15px;">
        <h2 style="font-size: 36px; font-weight: bold; margin-bottom: 20px;">📷 Camera Access Required</h2>
        <p style="font-size: 24px; margin-bottom: 15px;">To track your study time, this extension needs camera access.</p>
        <p style="font-size: 20px; margin-bottom: 25px; line-height: 1.5;">
          If you have denied access, follow these steps to enable it:
        </p>
        <div style="text-align: left; font-size: 20px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px;">
          <ol style="padding-left: 25px;">
            <li>🔗 Open <span id="copyLink" 
                style="color: #4dd0e1; text-decoration: underline; font-weight: bold; cursor: pointer;">
                chrome://extensions/
              </span> 
              <span id="copyMessage" style="font-size: 18px; color: #0f0; display: none;">(Copied!)</span>
            </li>
            <li>🔍 Find this extension and click <b>Details</b></li>
            <li>⚙️ Scroll down and go to <b>Site Settings</b></li>
            <li>🎥 Find "Camera" and set it to <b>Allow</b></li>
            <li>🔄 Reload this page and click "Retry" below</li>
          </ol>
        </div>
        <button id="retryCameraAccess" 
          style="margin-top: 30px; font-size: 22px; padding: 15px 30px; background: #28a745; 
          border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
          ✅ Retry Camera Access
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Copy to clipboard functionality
    document.getElementById('copyLink').addEventListener('click', () => {
      navigator.clipboard.writeText('chrome://extensions/').then(() => {
        document.getElementById('copyMessage').style.display = 'inline';
        setTimeout(() => {
          document.getElementById('copyMessage').style.display = 'none';
        }, 2000);
      });
    });

    document.getElementById('retryCameraAccess').addEventListener('click', () => {
      overlay.remove();
      startVideo();
    });
  }
}

// Removes the camera access overlay if it exists.
function removeCameraOverlay() {
  const overlay = document.getElementById('cameraOverlay');
  if (overlay) {
    overlay.remove();
  }
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // Adjust canvas position
  canvas.style.position = 'absolute';
  canvas.style.top = '130px';  // Shift canvas 30px upwards
  canvas.style.left = '0';

  let lastDetectionTime = 0;
let studying = false;
let studyStartTime = null; // Start time of the current study session
let noFaceStart = null;

// Load previous study data from localStorage
const storedData = JSON.parse(localStorage.getItem('dailyStudyData')) || {};
const today = new Date().toLocaleDateString();

if (!storedData[today]) {
    storedData[today] = { timeSpent: 0, expressionCounts: {} };
}

let totalStudyTime = storedData[today].timeSpent; // Load today's stored time

function detectFace() {
    const now = Date.now();
    
    if (now - lastDetectionTime > 100) { // Run every ~100ms
        lastDetectionTime = now;

        faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .then(detections => {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (showLandmarks) {
                    faceapi.draw.drawDetections(canvas, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
                }

                if (detections.length > 0) {
                    // Reset face lost timer
                    noFaceStart = null;

                    const expressions = detections[0].expressions;
                    const dominantExpression = getAverageExpression(expressions) || "None";

                    if (!studying) {
                        studying = true;
                        studyStartTime = now;
                        statusElement.textContent = 'I am studying...';
                    }

                    // Calculate elapsed time and update study duration
                    if (studyStartTime) {
                        let elapsed = (now - studyStartTime) / 1000; // Convert to seconds
                        totalStudyTime += elapsed;
                        storedData[today].timeSpent = totalStudyTime;
                        studyStartTime = now; // Reset start time
                    }

                    // Update expression count
                    if (!storedData[today].expressionCounts[dominantExpression]) {
                        storedData[today].expressionCounts[dominantExpression] = 0;
                    }
                    storedData[today].expressionCounts[dominantExpression]++;

                    // Save updated data to localStorage
                    localStorage.setItem('dailyStudyData', JSON.stringify(storedData));

                    // Convert study time to hrs, mins, secs
                    const hrs = Math.floor(totalStudyTime / 3600);
                    const mins = Math.floor((totalStudyTime % 3600) / 60);
                    const secs = Math.floor(totalStudyTime % 60);

                    // Find the most frequent expression today
                    let todayDominant = 'None';
                    let maxCount = 0;
                    for (let expr in storedData[today].expressionCounts) {
                        if (storedData[today].expressionCounts[expr] > maxCount) {
                            maxCount = storedData[today].expressionCounts[expr];
                            todayDominant = expr;
                        }
                    }

                    studyTimeElement.textContent = `Study Time: ${hrs} hrs ${mins} mins ${secs} sec | Expression: ${dominantExpression}`;
                } else {
                    if (studying) {
                        studying = false;
                        studyStartTime = null;
                        statusElement.textContent = 'No face detected. Pausing...';
                    }

                    if (noFaceStart === null) {
                        noFaceStart = now;
                    } else if (now - noFaceStart >= 30000) {
                        alertSound.play();
                        noFaceStart = now;
                    }
                }
            });
    }
    requestAnimationFrame(detectFace);
}

  detectFace();
});

// Update the history view to show the last 7 days.
function updateHistory() {
  const entries = [];
  for (let date in dailyStudyData) {
    entries.push({ date, data: dailyStudyData[date] });
  }
  // Sort entries by date (oldest first)
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  // Get the last 7 days.
  const last7 = entries.slice(-7);
  const historyText = last7
    .map(entry => {
      const total = entry.data.timeSpent;
      const hrs = Math.floor(total / 3600);
      const mins = Math.floor((total % 3600) / 60);
      // Determine the dominant expression for the day.
      const counts = entry.data.expressionCounts;
      let dominant = 'None';
      let maxCount = 0;
      for (let expr in counts) {
        if (counts[expr] > maxCount) {
          maxCount = counts[expr];
          dominant = expr;
        }
      }
      return `${entry.date}: ${hrs} hrs ${mins} mins (Expression: ${dominant})`;
    })
    .join('<br>');
  historyElement.innerHTML = `7-Day Study History:<br>${historyText}`;
}

// Call updateHistory on page load to display stored history.
updateHistory();

// Toggle landmarks visibility.
toggleLandmarksButton.addEventListener('click', () => {
  showLandmarks = !showLandmarks;
  toggleLandmarksButton.textContent = showLandmarks ? 'Hide Landmarks' : 'Show Landmarks';
});
