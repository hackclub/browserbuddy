# HoverLens Chrome Extension

HoverLens is a Chrome extension that enhances the user experience by magnifying text and images on hover, while providing customizable overlays with additional information.

## Features
- **Magnify Text/Images:** Automatically magnifies content when hovered over.
- **Customizable Overlays:** Displays contextual information about the hovered element.
- **Adjustable Magnification Levels:** Users can control the zoom level from the settings popup.

## Installation
1. Download the [HoverLens.zip](./HoverLens.zip) file and extract the contents.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load Unpacked** and select the extracted folder.

## Usage
1. Hover over any text, image, or element to see it magnified.
2. Use the settings popup (click the extension icon) to adjust magnification levels.

## Files Overview
- `manifest.json`: Extension metadata and configurations.
- `content.js`: Core functionality for magnification and overlays.
- `styles.css`: Styling for overlays.
- `popup.html`: UI for the settings popup.
- `popup.js`: Handles user settings for magnification.
- `background.js`: Initializes and logs extension events.

## Contributing
Feel free to fork this repository and submit pull requests for new features or improvements.

## License
This project is licensed under the MIT License.
