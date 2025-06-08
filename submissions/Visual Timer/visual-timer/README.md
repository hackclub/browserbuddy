# Visual Timer Chrome/Firefox Extension

<p align="center">
  <img src="icon128.png" alt="Visual Timer Icon" width="128" height="128">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.4.4-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/chrome-%E2%9C%93-brightgreen.svg" alt="Chrome">
  <img src="https://img.shields.io/badge/firefox-%E2%9C%93-orange.svg" alt="Firefox">
  <img src="https://img.shields.io/badge/manifest-v3-green.svg" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <br>
  <img src="https://img.shields.io/badge/pure-javascript-yellow.svg" alt="Pure JavaScript">
  <img src="https://img.shields.io-badge/no_dependencies-%E2%9C%93-green.svg" alt="No Dependencies">
  <img src="https://img.shields.io/badge/settings-synced-blue.svg" alt="Settings Synced">
</p>

A Chrome extension that provides a visual time-tracking overlay that changes color over time, helping you stay aware of time passing while working on tasks.

## Screenshots

<p align="center">
  <img src="recording/Screenshot 2025-02-24 102937.png" alt="Timer Initial State" width="400"><br>
  <em>Interface of extension</em>
</p>

<p align="center">
  <img src="recording/Screenshot 2025-02-24 103013.png" alt="Timer Mid State" width="400"><br>
  <em>Transitioning through green</em>
</p>

<p align="center">
  <img src="recording/Screenshot 2025-02-24 103033.png" alt="Timer Late State" width="400"><br>
  <em>more view of it</em>
</p>

<p align="center">
  <img src="recording/Screenshot 2025-02-24 103209.png" alt="Timer Final State" width="400"><br>
  <em>overlay on youtube video</em>
</p>

## Features

- Visual color-changing overlay that transitions through different colors (Blue → Green → Purple → Red)
- Adjustable overlay opacity (1-100%)
- Customizable time settings (up to 24 hours)
- Show/hide time display
- Pause and reset functionality
- Works on all websites
- Special compatibility with YouTube
- Settings sync across Chrome instances
- Automatic pause during system idle

## Version History

### v1.4.4 (Current)
- Implemented gradual opacity increase as timer progresses
- Added gentler visual start with initially reduced opacity
- Fixed permissions policy violations with safer event listeners
- Enhanced cleanup handling for better browser compatibility
- Added fallback event listeners for cross-browser support

### v1.4.3
- Fixed multiple script injection issues
- Prevented tab reloading on message failures
- Added protection against duplicate elements
- Improved script messaging and error handling
- Added script presence detection
- Enhanced compatibility with different websites
- Reduced unnecessary tab updates

### v1.4.2
- Fixed overlay persistence after disabling extension
- Fixed glitchy behavior after system idle/sleep
- Improved state management across tabs
- Added periodic state verification
- Enhanced visibility state handling
- Improved tab reload behavior
- Added force disable functionality
- Optimized transitions and animations

### v1.4.1
- Fixed overlay flickering issue on page load/refresh
- Improved transition animations
- Enhanced initialization timing
- Optimized performance with will-change CSS property

### v1.4.0
- Added color stage customization
- Added visual timeline for color transitions
- Added color reset functionality
- Updated interface with color picker controls
- Improved color transition visualization

### v1.3.1
- Fixed message handling for better stability
- Improved error handling across browsers
- Enhanced settings synchronization
- Updated documentation

### v1.3
- Added adjustable opacity control
- Added opacity sync across browser instances
- Added tooltip for opacity percentage
- Improved settings persistence

### v1.0
- Initial release
- Basic timer functionality
- Color transitions
- YouTube compatibility

## Installation

### Watch Installation & Usage Guide
[![Watch the Installation & Usage Guide](recording/Screenshot 2025-02-24 102937.png)](https://youtu.be/ik6qIkiS-jo "Watch the Installation & Usage Guide")
<p align="center"><em>👆 Click the image above to watch the installation and usage guide on YouTube</em></p>

### Chrome
1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" in the top left
5. Select the folder containing the extension files

### Firefox
1. Clone this repository or download the source code
2. Rename `manifest-ff.json` to `manifest.json` (make sure to backup the original Chrome manifest if needed)
3. Open Firefox and
