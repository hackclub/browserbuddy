# YouTube Thumbnail Blur Extension

## Overview
This Chrome extension automatically blurs YouTube thumbnails and reveals them on hover, providing a more focused browsing experience. When installed, all YouTube thumbnails will be blurred by default and will become clear when you mouse over them.

## Features
- Automatically blurs all YouTube thumbnails
- Smooth transition effect when hovering over thumbnails
- Works with dynamically loaded content
- Handles YouTube's single-page navigation
- 5-second delay to ensure proper thumbnail loading
- Lightweight and performance-friendly

## Installation

### Developer Mode
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the folder containing the extension files

### Files Needed
- `manifest.json`
- `content.js` 

## How It Works
The extension:
1. Waits 5 seconds after page load to ensure all content is properly loaded
2. Applies a blur effect to all YouTube thumbnails
3. Removes the blur when you hover over a thumbnail
4. Reapplies the blur when you move your mouse away
5. Automatically handles newly loaded thumbnails as you scroll

## Configuration
You can modify these values in `content.js` to customize the extension:
- Blur intensity: Change `blur(5px)` to your preferred value
- Initial delay: Adjust the `5000` millisecond delay
- Transition speed: Modify the `0.3s` transition timing

## Technical Details
The extension uses:
- MutationObserver to track dynamically loaded content
- YouTube's `yt-navigate-finish` event for page navigation
- CSS transitions for smooth blur effects
- Dataset attributes to prevent duplicate processing

## Troubleshooting
If thumbnails aren't blurring:
1. Make sure the extension is enabled
2. Try refreshing the page
3. Check if you're on a YouTube page
4. Verify that Developer mode is enabled

## Contributing
Feel free to submit issues and pull requests for:
- Bug fixes
- Performance improvements
- New features
- Documentation improvements

## License
MIT License - Feel free to use and modify as needed

## Version
1.0.0