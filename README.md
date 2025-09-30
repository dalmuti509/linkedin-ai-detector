# LinkedIn AI Bot Detector Chrome Extension

A Chrome browser extension that identifies AI bots on LinkedIn and adds overlay icons to their profile pictures.

## Features

- 🤖 **Suspicious Profile Detection**: Identifies potentially fake or bot accounts based on profile characteristics
- 🎯 **Visual Indicators**: Adds red overlay icons to detected suspicious profiles
- 📊 **Statistics**: Tracks detection counts and shows recent detections
- ⚙️ **Customizable**: Adjustable sensitivity levels and notification settings
- 🔄 **Real-time**: Continuously monitors LinkedIn pages for new content

## Installation

### Prerequisites

1. **Create Icon Files**: You need to create PNG icon files from the provided SVG:
   - Convert `icons/icon.svg` to PNG format in these sizes:
     - `icons/icon16.png` (16x16 pixels)
     - `icons/icon48.png` (48x48 pixels) 
     - `icons/icon128.png` (128x128 pixels)

   You can use online tools like:
   - [Convertio](https://convertio.co/svg-png/)
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - Or any image editor like GIMP, Photoshop, etc.

### Install in Chrome

1. **Download/Clone** this extension to your local machine
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Navigate to LinkedIn** (www.linkedin.com)
2. **The extension automatically activates** and starts scanning for AI bots
3. **Look for red overlay icons** (🤖) on profile pictures of detected AI bots
4. **Click the extension icon** to view statistics and settings

## How It Works

### Detection Algorithm

The extension identifies suspicious profiles based on behavioral and profile characteristics:

1. **Profile Age Analysis**:
   - Profiles created less than 30 days ago
   - New accounts are more likely to be fake or automated

2. **Connection Count Analysis**:
   - Profiles with less than 10 connections
   - Legitimate users typically have more connections

3. **Location Mismatch Detection**:
   - Company location doesn't match profile location
   - Indicates potential fake or automated profiles

4. **Suspicious Pattern Detection**:
   - Generic or automated-sounding names
   - Very short or empty profile descriptions
   - Repeated character patterns
   - Test accounts or demo profiles

### Visual Indicators

- **Red overlay icon** (🤖) appears on detected AI bot profile pictures
- **Pulsing animation** to draw attention
- **Tooltip** shows "AI Bot Detected" on hover

## Settings

Access settings through the extension popup:

- **Enable/Disable Detection**: Toggle the extension on/off
- **Notifications**: Show desktop notifications for detections
- **Sensitivity**: Adjust detection sensitivity (Low/Medium/High)
- **Clear Data**: Remove all stored detection data

## File Structure

```
linkedin-ai-detector/
├── manifest.json          # Extension manifest
├── content.js            # Main detection script
├── background.js         # Background service worker
├── popup.html           # Extension popup UI
├── popup.css            # Popup styles
├── popup.js             # Popup functionality
├── styles.css           # Content script styles
├── icons/               # Extension icons
│   ├── icon.svg         # Source SVG icon
│   ├── icon16.png       # 16x16 icon (create from SVG)
│   ├── icon48.png       # 48x48 icon (create from SVG)
│   └── icon128.png      # 128x128 icon (create from SVG)
└── README.md            # This file
```

## Technical Details

### Permissions

- `activeTab`: Access to current LinkedIn tab
- `storage`: Save settings and detection data
- `scripting`: Inject content scripts
- `host_permissions`: Access to LinkedIn.com

### Detection Criteria

The extension flags profiles that meet 2 or more of these criteria:

**Profile Age:**
- Account created less than 30 days ago
- Indicates new or potentially fake accounts

**Connection Count:**
- Less than 10 connections
- Legitimate users typically have more connections

**Location Mismatch:**
- Profile location doesn't match company location
- Suggests automated or fake profile creation

**Suspicious Patterns:**
- Generic names like "User123", "Test User"
- Very short or empty profile descriptions
- Repeated character patterns (e.g., "aaaa", "123123")
- Test companies or demo accounts

## Customization

### Adding Custom Patterns

You can extend the detection patterns by modifying the `aiIndicators` array in `content.js`:

```javascript
const aiIndicators = [
  // Add your custom patterns here
  /your-custom-pattern/i,
  // ... existing patterns
];
```

### Adjusting Sensitivity

The extension supports three sensitivity levels:

- **Low**: Only obvious AI bot indicators
- **Medium**: Balanced detection (default)
- **High**: More aggressive detection, may include false positives

## Troubleshooting

### Extension Not Working

1. **Check if enabled**: Click the extension icon to verify it's active
2. **Refresh LinkedIn**: Reload the LinkedIn page
3. **Check permissions**: Ensure the extension has access to LinkedIn
4. **Reinstall**: Remove and reinstall the extension

### No Detections

1. **Verify you're on LinkedIn**: The extension only works on linkedin.com
2. **Check sensitivity settings**: Try increasing sensitivity
3. **Look for profile pictures**: The extension scans for profile images
4. **Wait for page load**: Detection happens after page content loads

## Privacy

- **No data collection**: The extension doesn't collect or transmit personal data
- **Local storage only**: All data is stored locally in your browser
- **No external requests**: The extension doesn't make network requests
- **Open source**: All code is visible and auditable

## Contributing

Feel free to contribute improvements:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:

1. **Check the troubleshooting section**
2. **Review the code** for customization options
3. **Open an issue** with detailed information about the problem

---

**Note**: This extension is for educational and research purposes. Always respect LinkedIn's Terms of Service and use responsibly.
