# Download Buddy
Convert your images automatically on download!

[Demo](https://sharex.shuchir.dev/u/G78KXn.mp4)

## Installation
1. Clone this repository
2. Open `chrome://extensions/` or `about:debugging#/runtime/this-firefox` in your browser
3. Click on `Load Unpacked` (Chromium) or `Load Temporary Add-on` (Firefox)
4. Select the appropriate folder inside the cloned repository

## Usage
1. Open the exension popup by clicking on the extension icon
2. Set your conversion preferences
3. Attempt to download an image that matches your source format
4. Profit

## Supported Formats
FROM:
- PNG
- JPEG
- WEBP
- BMP
- TIFF
- ICO
- AVIF

TO:
- PNG
- JPEG
- WEBP

## Notes
- The reason for 2 completely different extensions rather than one, cross-platform extension is because Firefox doesn't support offscreen DOM. Offscreen DOM is preferred since it doesn't interfere with actual page content, so the Chromium extension has been built to support it. The Firefox version, however, has to use the onscreen DOM, which is why it's a separate extension.