# YouTube Enhancer

A lightweight, open-source browser extension that improves your YouTube experience with essential quality-of-life enhancements while respecting your privacy.

![YouTube Enhancer Logo](icons/img.png)

> **Note**: This extension is currently in development and may not be fully functional. Please report any issues you encounter.

## Features

- **Cleaner Interface**: Removes ads, promotional content, and other distractions
- **Enhanced Video Grid**: Improves the video browsing experience with a better grid layout
- **Focus Mode**: One-click immersive viewing experience
- **Advanced Playback Controls**: Easily adjust video speed with a convenient dropdown menu
- **Performance Optimized**: Minimal impact on browser performance

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)
1. Download or clone this repository to your local machine
2. Open Chrome/Edge/Brave and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top-right corner
4. Click "Load unpacked" and select the extension directory
5. YouTube Enhancer is now installed!

## Usage

After installation, simply navigate to YouTube.com. The extension will automatically:

- Apply a cleaner interface by removing ads and distractions
- Implement a better video grid layout for easier browsing
- Add enhanced playback controls to the video player

### Focus Mode
Click the "Focus" button (eye icon) in the player controls to toggle focus mode, which dims the page and centers the video for distraction-free viewing.

### Speed Control
Click the speed button (e.g., "1x") in the player controls to open a dropdown menu and select your preferred playback speed.

## Known Issues

- **Manifest V3 Compatibility**: Some features may not work correctly in Manifest V3 environments
- **TrustedHTML Warnings**: Occasionally Chrome may log TrustedHTML warnings in the console (these don't affect functionality)
- **YouTube Updates**: Since YouTube frequently updates its UI, occasional layout issues may occur
- **Mobile Support**: This extension is designed for desktop browsers only

## Roadmap

- [ ] Add keyboard shortcuts for all features
- [ ] Implement user preferences panel
- [ ] Add dark mode toggle
- [ ] Create more customization options
- [ ] Add video bookmark feature
- [ ] Migrate fully to Manifest V3 (Due to focus on Firefox)
- [ ] Add Clear History system via 1 clcik

## Contributing

Contributions are welcome! If you'd like to help improve YouTube Enhancer:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone git@github.com:Prarambha369/YouTube_Enhancer.git

# Navigate to the directory
cd youtube-enhancer

# Install dependencies (if using npm)
npm install
```

## Code Structure

```
youtube-enhancer/
├── manifest.json        # Extension configuration
├── background.js        # Background service worker
├── content.js           # Main content script loader
├── popup.html           # Extension popup UI
├── popup.js             # Popup functionality
├── feature-handlers.js  # Feature toggle handlers
├── features/            # Individual feature modules
│   ├── vidplayer.js     # Enhanced video player
│   ├── shorts2long.js   # Shorts to regular video converter
│   └── shortsblock.js   # Shorts blocking functionality
├── styles/              # CSS styles
│   └── theme.css        # Main theme styles
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped improve this extension
- Inspired by various YouTube enhancement tools in the open-source community

---

**Made with ❤️ by Prarambha**
