# Google Docs Auto Typer Extension

This Chrome extension simulates typing text into editable fields on websites using clipboard content. It allows users to start and stop the typing process with customizable keyboard shortcuts.

## Features
- Simulates natural typing with realistic delays between characters.
- Automatically types the most recent text copied to the clipboard.
- Start typing with `Ctrl+Shift+Y` and stop typing with `Ctrl+Shift+S`.

## Installation
1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing this extension's files.

## Usage
1. **Copy Text**: Copy the text you want to type to your clipboard.
2. **Navigate**: Go to any website with an editable field (e.g., text area or content-editable div).
3. **Start Typing**: Press `Ctrl+Shift+Y` to start typing the clipboard content.
4. **Stop Typing**: Press `Ctrl+Shift+S` to stop the typing process.

## Known Issues
- **Not Compatible with Google Docs**: This extension does not work properly with Google Docs due to its custom text editor implementation, which overrides standard DOM input behavior. Future updates may include specific adjustments for Google Docs compatibility.
- **Clipboard Permissions**: Ensure that clipboard access is enabled for the extension in your Chrome settings.

## How It Works
1. The extension listens for predefined keyboard shortcuts.
2. When triggered, it fetches the most recent clipboard text.
3. The text is typed character by character into the currently focused editable field.

## Customization
To change the keyboard shortcuts:
1. Go to `chrome://extensions/shortcuts/` in Chrome.
2. Find the extension and customize the shortcuts for **Start Typing** and **Stop Typing**.

## Troubleshooting
- **Clipboard Access Error**: If clipboard content isn't typed, ensure the browser allows clipboard access.
- **Editable Field Not Found**: Place the cursor in a valid text area or editable div before triggering the typing process.

## Contributing
Feel free to fork this repository and make improvements. Submit a pull request if you have a fix or enhancement.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
