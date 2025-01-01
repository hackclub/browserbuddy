# Privacy Policy

## Overview
WakaTime for Figma is a browser extension that tracks your design time and activity in Figma. This privacy policy explains what information we collect, how we use it, and your rights regarding this data.

## Data Collection

### Authentication Data
- **Figma Authentication**: The extension uses your Figma Personal Access Token to authenticate with Figma's official API. Your PAT is only used for API authentication and is never stored or transmitted elsewhere.
- **WakaTime Authentication**: Your WakaTime API key and API URL are stored locally in your browser's secure storage. These credentials are only used to send activity data to WakaTime's servers.

### Activity Data
We collect the following information about your Figma usage:
- Project and layer names from your Figma files
- Time spent editing and viewing files
- Timestamps of your design activity
- Basic system information (operating system and browser name)

### What we don't collect
- File contents or design assets
- Personal information beyond what's listed above
- Screenshots or visual content
- Communication or messages

## Data Usage
- All collected data is sent directly to WakaTime's servers (or your specified alternative server for High Seas users)
- The Figma file is SHA256 hashed on the client-side, and neither the hash nor the original file are ever sent elsewhere
- Data is used solely for generating time tracking statistics and activity reports
- No data is sold or shared with third parties

## Data Storage
- Authentication credentials are stored locally in your browser
- Activity data is stored on WakaTime's servers (or your specified alternative server)
- No additional local storage is used beyond browser extension settings

## Third-Party Services
This extension integrates with:
1. Figma's API - For accessing file and activity information
2. WakaTime's API - For storing and processing activity data

## User Rights
You have the right to:
- Access your tracked data through your WakaTime dashboard
- Stop tracking at any time by disabling or uninstalling the extension
- Request deletion of your data through WakaTime's platform

## Updates to Privacy Policy
We may update this privacy policy as needed. Significant changes will be communicated through the extension's update notes.

## Contact
For privacy concerns or questions, please open an issue on our [GitHub repository](https://github.com/SkyfallWasTaken/figma-wakatime/issues).

## Open Source
This extension is open source. You can review its code and functionality on [GitHub](https://github.com/SkyfallWasTaken/figma-wakatime).