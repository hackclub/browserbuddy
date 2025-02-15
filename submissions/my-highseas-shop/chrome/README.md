# My HighSeas Shop - extension

## [website](https://github.com/ReLoia/My-HighSeas-Shop-Extension/tree/website) - CHROME - [firefox](https://github.com/ReLoia/My-HighSeas-Shop-Extension/tree/firefox)

## Overview

**My HighSeas Shop** is a Chrome extension that enhances your experience on the HighSeas shop page by allowing you to
control which items are visible. With this extension, you can hide specific items, manage them through a user-friendly
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

### Chrome

1. **Download the Extension Files:**
    - Go to the [Releases](https://github.com/reloia/my-highseas-shop-extension/releases) section of the GitHub
      repository.
   - Download the latest `.crx` file of the extension.

2. **Open Chrome Extensions Page:**
    - In Chrome, navigate to `chrome://extensions/`.

3. **Enable Developer Mode:**
    - Toggle the "Developer mode" switch in the top right corner of the Extensions page.

4. **Load the Extension:**
   - Drag and drop the downloaded `.crx` file onto the Extensions page.

5. **Confirm Installation:**
    - Once loaded, the extension icon will appear in the Chrome toolbar.

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

- Node.js (optional, for managing dependencies or tools like ESLint).
- A code editor, such as WebStorm or VS Code.

### File Structure

- **`manifest.json`**: Configuration for the extension.
- **`popup.html`**: The popup menu interface.
- **`scripts/`**: Contains the background script (`background.js`) and content script (`content.js`).
- **`styles/`**: Contains CSS files for content styling.
- **`assets/`**: Contains icons and other visual assets.

### Steps to Modify or Extend Features

1. Update `content.js` for changes to the behavior on the shop page.
2. Modify `popup.html` and `popup.js` to enhance the popup menu.
3. Add styles in `content.css` to adjust the visual appearance.
