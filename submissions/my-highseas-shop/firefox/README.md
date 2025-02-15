# My HighSeas Shop - extension

## [website](https://github.com/ReLoia/My-HighSeas-Shop-Extension/tree/website) - [chrome](https://github.com/ReLoia/My-HighSeas-Shop-Extension/tree/chrome) - FIREFOX

## Overview

**My HighSeas Shop** is a Firefox extension that enhances your experience on the HighSeas shop page by allowing you to
control which items are visible.  
With this extension, you can hide specific items, manage them through a user-friendly
popup menu, and customize your shopping experience.

---

## Features

- **Hide Items:** Select and hide specific items from the HighSeas shop page.
- **Manage Hidden Items:** Use the popup menu to view and unhide hidden items.
- **Seamless Integration:** Works dynamically with the HighSeas shop, even as you navigate or interact with the page.
- **Persistent Settings:** Your hidden items are saved and persist across browser sessions.

### Screenshots

![image](https://github.com/user-attachments/assets/45e364e2-8882-4163-8a04-35b55e2cb928)

---

## Installation Guide

### Firefox

1. **Install the extension from the Firefox Add-ons website:**
   - Go to the [My HighSeas Shop extension page](https://addons.mozilla.org/en-US/firefox/addon/my-highseas-shop/).
   - Click the "Add to Firefox" button to install the extension.

---

## Usage

1. Navigate to the HighSeas shop page: [https://highseas.hackclub.com/shop](https://highseas.hackclub.com/shop).
2. Click on the extension icon in the Chrome toolbar to open the popup menu.
3. Hide or unhide items:
    - To hide an item: Click the hide button in the popup menu.
    - To unhide an item: Use the "Hidden Items" section in the popup menu to re-enable visibility.
4. Enjoy your customized shop experience!

---

## Development

### Prerequisites

- A code editor, such as WebStorm or VS Code.

### File Structure

- **`manifest.json`**: Configuration for the extension.
- **`popup.html`**: The popup menu interface.
- **`scripts/`**: Contains the background script (`background.js`) and content script (`content.js`).
- **`styles/`**: Contains CSS files for content styling.
- **`assets/`**: Contains icons and other visual assets.

### Steps to Modify or Extend Features

1. Update `content.js` for changes to the behavior on the shop page.
2. Modify `popup.html`, `popup.js` and `popup.css` to enhance the popup menu.
