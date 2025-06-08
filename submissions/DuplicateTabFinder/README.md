# Duplicate Tab Finder

Duplicate Tab Finder is a browser extension designed to help users identify and manage duplicate tabs in their browser efficiently. By providing features such as automatically closing duplicates, grouping them by domain, and offering easy navigation, it enhances the browsing experience by reducing clutter and improving productivity.

## Features

- **Find Duplicate Tabs:** Automatically detects duplicate tabs across all open windows.
- **Close Duplicates:** Provides options to close individual duplicates or all duplicates at once.
- **Group by Domain:** Organizes duplicate tabs by their domain for easier management.
- **Search Functionality:** Allows users to search through duplicate tabs to quickly find specific ones.
- **Dark Mode Toggle:** Switch between light and dark themes for a personalized interface.
- **Export/Import Settings:** Save and load your extension settings as JSON files.
- **Keyboard Shortcuts:** Utilize customizable keyboard shortcuts to enhance workflow.

## Installation

### Google Chrome

1. **Download the Extension:**
   - Clone the repository or download the ZIP file from the [GitHub repository](https://github.com/PawiX25/DuplicateTabFinder).

2. **Load into Browser:**
   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle in the top right corner.
   - Click on "Load unpacked" and select the downloaded extension folder.

3. **Permissions:**
   - The extension requires permissions to access browser tabs, notifications, storage, and downloads to function correctly.

### Mozilla Firefox

1. **Download the Extension:**
   - Clone the repository or download the ZIP file from the [GitHub repository](https://github.com/PawiX25/DuplicateTabFinder).

2. **Load as a Debug Extension:**
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
   - Click on "Load Temporary Add-on".
   - Select the `manifest.json` file from the downloaded extension folder.

3. **Permissions:**
   - The extension requires permissions to access browser tabs, notifications, storage, and downloads to function correctly.

## Usage

1. **Open the Extension:**
   - Click on the Duplicate Tab Finder icon in the browser toolbar to open the popup.

2. **View Duplicates:**
   - The extension lists all detected duplicate tabs. If no duplicates are found, a message will indicate so.

3. **Manage Duplicates:**
   - **Close All:** Removes all duplicate tabs under a specific URL.
   - **Keep:** Retains one instance of the tab and closes the rest.
   - **Individual Controls:** Use the "Keep" or "Close" buttons next to each tab for granular control.

4. **Settings:**
   - Access the settings panel to enable features like auto-closing duplicates or grouping them by domain.
   - Export your current settings or import settings from a previously saved JSON file.

5. **Search:**
   - Use the search box to filter duplicate tabs based on URLs or titles.

6. **Theme Toggle:**
   - Switch between light and dark modes using the toggle button for a comfortable viewing experience.

---

For any issues or feature requests, please open an issue on the [GitHub repository](https://github.com/PawiX25/DuplicateTabFinder).