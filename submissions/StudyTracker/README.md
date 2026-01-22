
# Study Tracker Chrome Extension

Study Tracker is a Chrome extension that uses face detection and expression recognition to monitor your study sessions. It tracks the time you spend studying and records your dominant facial expression during each session. The extension aggregates your study data by day and displays a 7-day history, giving you insights into your study habits and mood over time.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Face Detection & Expression Recognition:** Uses `face-api.js` to detect faces, facial landmarks, and expressions.
- **Study Time Tracking:** Accumulates study time every second when your face is detected.
- **Daily Aggregation:** Records study data per day with total study time and the dominant facial expression.
- **7-Day History:** Displays your study history for the last 7 days, including study duration and mood.
- **Toggle Overlays:** Option to show or hide detection overlays (landmarks, bounding boxes, expression labels).
- **Alert System:** Plays an alert sound if no face is detected for 30 consecutive seconds.

## Installation

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/raghib112/Study-Tracker.git
   ```
2. **Place Models:**
   - Download the required models from [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in the `/models` directory of the extension.

3. **Add Alert Sound:**
   - Ensure that you have an `alert.mp3` file in the root of the extension directory. This sound will play if no face is detected for 30 seconds.

4. **Load the Extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" (top right).
   - Click "Load unpacked" and select your extension’s directory.

## Usage

1. Click on the Study Tracker icon in your Chrome toolbar.
2. The extension will open a popup with a video feed from your webcam.
3. The extension will:
   - Detect your face and update the study time in real time.
   - Display your current dominant facial expression alongside the accumulated study time.
   - Aggregate your study data per day.
4. Use the **Toggle Landmarks** button to show/hide detection overlays (bounding boxes, landmarks, and expression labels).
5. If no face is detected for 30 seconds, an alert sound will play to remind you to start studying.

## How It Works

- **Face Detection:** The extension uses `face-api.js` to perform real-time face detection, landmark detection, and expression recognition.
- **Study Time Tracking:** Each time a face is detected, the extension increments the study timer (in seconds) and updates the daily record stored in `localStorage`.
- **Daily Aggregation:** Study data is saved in an object keyed by date. For each day, it stores the total time studied (in seconds) and tallies the count of each detected facial expression.
- **7-Day History:** The extension processes the daily records to show the total study time (converted to hours, minutes, and seconds) and the dominant expression for each of the last 7 days.
- **No-Face Alert:** If no face is detected continuously for 30 seconds, an alert sound (`alert.mp3`) is played.

## Dependencies

- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [Tailwind CSS](https://tailwindcss.com/) via the Tailwind Browser CDN

## Project Structure

<!-- ```
study-tracker-extension/
├── manifest.json           # Chrome extension manifest file
├── popup.html              # HTML file for the extension's popup UI
├── popup.js               # JavaScript file containing detection and tracking logic
├── background.js           # Run program
├── content.js              # Content is here
├── face-api.min.js         # Face API library file
├── models/                 # Directory containing face-api.js models (downloaded separately)
├── alert.mp3               # Alert sound file for no-face detection
└── README.md               # This file
``` -->

```
study-tracker-extension/
├── manifest.json           # Chrome extension manifest file
├── popup.html              # HTML file for the extension's popup UI
├── script.js               # JavaScript file containing detection and tracking logic
├── face-api.min.js         # Face API library file
├── models/                 # Directory containing face-api.js models (downloaded separately)
├── alert.mp3               # Alert sound file for no-face detection
└── README.md               # This file
```

## Customization

- **Study Duration and Alert Timing:**
  - The extension tracks study time continuously. You can adjust the 30-second no-face alert interval by modifying the value in `popup.js` (`30000` ms).
- **UI Styling:**
  - The popup uses Tailwind CSS for a modern look. Customize styles in `popup.html` or add your own CSS as needed.

## Troubleshooting

- **Models Not Loading:**
  - Ensure that the `/models` directory is correctly placed and contains the necessary model files.
- **Webcam Permissions:**
  - Make sure your browser has permission to access the webcam.
- **Alert Sound Not Playing:**
  - Confirm that `alert.mp3` is in the extension directory and that your browser supports the audio format.
- **Performance Issues:**
  - The extension throttles detection to every 500ms. Adjust this value in `popup.js` if needed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to contribute, open issues, or suggest improvements!

