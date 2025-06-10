# WakaTime for Figma

Track your Figma design time automatically with WakaTime. Get insights about your design activity, time spent on different projects, and visualize your productivity patterns.

[**Download for Firefox**](https://addons.mozilla.org/en-US/firefox/addon/wakatime-for-figma) • [**Download for Chrome**](https://chromewebstore.google.com/detail/wakatime-for-figma/ddoemmbdnemldilpbaofhnbhihjhbjni)

- 🎨 **Automatic time tracking** for your Figma work
- 📊 **Detailed metrics** about your design activity
- 🔄 **Real-time synchronization** with WakaTime dashboard
- 🚫 **Privacy-focused**: only tracks when you're actively working
- 🌐 **Works across all Figma files and projects**

## Installation

### For WakaTime users
1. Install the WakaTime browser extension
2. Get your WakaTime API key from [WakaTime Settings](https://wakatime.com/settings/account), click the extension icon in your toolbar, and paste it in.
3. Add a Figma API Key - a tutorial is linked in the extension popup
4. The extension will automatically start tracking your Figma activity

### For High Seas users
1. Install the WakaTime browser extension
2. Go to the [High Seas Signpost](https://highseas.hackclub.com/signpost), and click `Show Hackatime install instructions`
3. Scroll down, and click the small `View instructions for all platforms` link
4. Scroll down, till you see the `Script not working?` section
5. Copy the API key and API URL parts from the instructions. Then click on the WakaTime icon in your toolbar/extensions section and paste them in
6. Add a Figma API Key - a tutorial is linked in the extension popup
7. The extension will automatically start tracking your Figma activity

## Development

This extension is built using [WXT](https://wxt.dev) and TypeScript. You also need [Bun v1.1.40](https://bun.sh) to run the development server and build the extension.

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build
bun run build:firefox

# Create distribution zip
bun run zip
bun run zip:firefox
```

## How it works

The extension monitors your activity in Figma and sends heartbeats to WakaTime when you're actively designing. It tracks:
- File edits and views
- Time spent on different projects
- Design activity patterns

Your data is securely sent to WakaTime's servers and can be viewed in your WakaTime dashboard.

## Privacy

The extension tracks:
- Project and layer names
- Time spent editing/viewing
- The time of day you made changes
- OS and browser name (e.g. Chrome on Windows)

## License

WakaTime for Figma is released under the [GNU GPLv3 License.](https://github.com/SkyfallWasTaken/figma-wakatime/blob/main/LICENSE)

## Support

Having issues? Please file them on the [GitHub Issues page](https://github.com/SkyfallWasTaken/figma-wakatime/issues). Or if you're in the Hack Club Slack, message @skyfall.
