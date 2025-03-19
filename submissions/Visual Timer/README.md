# Visual Timer Chrome/Firefox Extension

<p align="center">
  <img src="\assets\icons\icon128.png" alt="Visual Timer Icon" width="128" height="128">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.5.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/chrome-%E2%9C%93-brightgreen.svg" alt="Chrome">
  <img src="https://img.shields.io/badge/firefox-%E2%9C%93-orange.svg" alt="Firefox">
  <img src="https://img.shields.io/badge/manifest-v3-green.svg" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <br>
  <img src="https://img.shields.io/badge/pure-javascript-yellow.svg" alt="Pure JavaScript">
  <img src="https://img.shields.io-badge/no_dependencies-%E2%9C%93-green.svg" alt="No Dependencies">
  <img src="https://img.shields.io-badge/settings-synced-blue.svg" alt="Settings Synced">
</p>

A Chrome extension that provides a visual time-tracking overlay that changes color over time, helping you stay aware of time passing while working on tasks.

## Screenshots


<p align="center">
  <img src="\assets\Screenshots\Screenshot 2025-03-17 182049.png" alt="Timer Pixel UI" width="400"><br>
  <em>Default Pixel UI</em>
</p>

<p align="center">
  <img src="\assets\Screenshots\Screenshot 2025-03-17 182112.png" alt="Time Settings" width="400"><br>
  <em>Settings: Time</em>
</p>

<p align="center">
  <img src="\assets\Screenshots\Screenshot 2025-03-17 182132.png" alt="Display Setting" width="400"><br>
  <em>Settings: Display</em>
</p>

<p align="center">
  <img src="\assets\Screenshots\Screenshot 2025-03-17 182147.png" alt="Colors Setting" width="400"><br>
  <em>Settings: Colors</em>
</p>

<p align="center">
  <img src="\assets\Screenshots\Screenshot 2025-03-17 182218.png" alt="Timer Classic UI" width="400"><br>
  <em>Classic UI</em>
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
- Choice between Classic and Minecraft-styled Pixel UI

## Version History

### 1.5.0 (Current)
- Major UI improvements with pixel-perfect design
- Added alternative Minecraft-styled Pixel UI
- Fixed live timer update issue - timer now updates in real-time without requiring extension click
- Fixed timer display visibility - timer now properly disappears when extension is disabled
- Enhanced code structure and organization
- Improved extension reliability and performance
- Better handling of disabled state
- Added UI switcher to toggle between Classic and Pixel interfaces
- Improved performance with CSS-based textures
- Enhanced cross-browser compatibility
- Style enhancements to both interfaces

### v1.4.4
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
[![Watch the Installation & Usage Guide](\assets\Screenshots\Screenshot 2025-02-24 102937.png)](https://youtu.be/ik6qIkiS-jo "Watch the Installation & Usage Guide")
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
3. ### Firefox
1. Clone this repository or download the source code
2. Rename `manifest-ff.json` to `manifest.json` (make sure to backup the original Chrome manifest if needed)
3. Open Firefox and navigate to `about:debugging`
4. Click on "This Firefox" in the left sidebar
5. Click "Load Temporary Add-on"
6. Navigate to your extension folder and select the `manifest.json` file

Note: Firefox extensions loaded this way are temporary and will be removed when Firefox is closed. For permanent installation, the extension needs to be signed by Mozilla.

## Usage

1. Click the extension icon to open the settings popup
2. Toggle between Classic and Pixel UI styles using the UI switch button
3. Set your desired time duration (default is 2 hours)
4. Adjust overlay opacity as needed
5. Customize colors if desired
6. Enable/Disable the timer as needed
7. Use Pause/Resume to control timing

### Settings

#### Timer Controls
- **Enable Visual Timer**: Toggle the overlay on/off for all websites
- **Show Time Display**: Toggle the visibility of the time counter
- **Time Until Red**: Set the total duration before the overlay turns red
  - Hours: 0-24
  - Minutes: 0-59
- **Overlay Opacity**: Adjust the transparency of the color overlay (1-100%)
  - Lower values make the overlay more transparent
  - Higher values make the overlay more visible
  - Default: 70%
- **Color Transitions**: Customize the color stages of the timer
  - Choose colors for Start, 33%, 66%, and End stages
  - Reset to default colors (Blue → Green → Purple → Red)
  - Changes apply immediately to all tabs

#### Control Buttons
- **Reset Timer**: Restart the timer from 0 and reset the color to blue
- **Pause/Resume**: Temporarily stop/start the timer

### Color Stages

The overlay transitions through four distinct colors:
1. Blue (Start)
2. Green (33% of set time)
3. Purple (66% of set time)
4. Red (100% of set time)

### YouTube Compatibility

When using YouTube, the extension automatically adjusts its overlay to:
- Keep video controls accessible
- Maintain video player visibility
- Use a screen blend mode for better color visibility

## Tips

- Use the time display toggle to reduce distractions while keeping the color indicator
- Reset the timer when starting a new task
- Pause the timer during breaks
- The extension automatically pauses when your system is idle
- The settings are synchronized across your Chrome profile
- The overlay works independently on each tab
- Use the opacity slider to find the perfect balance between visibility and non-intrusiveness
- Your opacity settings will sync across all your Chrome instances
- Find your ideal opacity setting based on your screen brightness and website colors
- On dark websites, you might want to use lower opacity values
- On light websites, higher opacity values might work better
- Save different opacity settings for different times of day

## Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Utilizes Chrome's storage, alarms, idle, and tabs APIs
- Lightweight with minimal performance impact

## Permissions

The extension requires the following permissions:
- `storage`: Save your settings and timer state
- `alarms`: Update the timer every second
- `idle`: Detect system idle state
- `tabs`: Apply the overlay to web pages

## Troubleshooting

### Common Issues

1. **Timer Not Appearing or Extension not working**
   - Try toggling the "Enable Visual Timer" switch off and on again
   - Refresh the webpage you're trying to use the timer on
   - Make sure you've granted all necessary permissions

2. **Time Display Not Showing**
   - Toggle the "Show Time Display" switch off and then on
   - Check if "Enable Visual Timer" is turned on, as the time display requires the timer to be enabled

3. **Settings Not Syncing**
   - Make sure you're signed into your browser
   - Try closing and reopening your browser
   - Check if you have sync enabled in your browser settings

If these steps don't resolve your issue, please don't hesitate to:
1. [Create a new issue](https://github.com/yourusername/visual-timer/issues/new) with details about:
   - Your browser and version
   - Steps to reproduce the problem
   - What you expected to happen
   - What actually happened
2. Include any error messages from the browser's developer console (F12)

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## Browser Support

### Chrome
- Supports Manifest V3
- Full feature support
- Persistent settings across sessions
- Syncs across devices when signed in

### Firefox
- Uses Manifest V2
- All core features supported
- Temporary installation for development
- Requires Mozilla signing for permanent installation

## Development

### Building from Source
1. Clone the repository
2. No build step required - plain JavaScript
3. Load unpacked in Chrome or temporary add-on in Firefox
4. Make changes and reload extension as needed

### Contributing
We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both Chrome and Firefox
5. Submit a pull request

### Testing
- Test on both light and dark websites
- Verify YouTube compatibility
- Check all opacity levels
- Confirm sync functionality
- Validate timer accuracy

## Support

If you find this extension helpful, you can:
- Star the repository
- Report bugs
- Suggest features
- Share with others
- Contribute improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.