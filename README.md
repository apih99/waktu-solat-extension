# Waktu Solat Chrome Extension

A Chrome extension to help users track daily prayer times based on their location, with reminders and customizable settings.

## Features

- **Prayer Time Display**: Shows today's prayer times (Subuh, Zuhur, Asar, Maghrib, Isyak) with time remaining until the next prayer.
- **Customizable Reminders**: Receive browser notifications before each prayer time.
- **Location Settings**: Manually input your location or auto-detect using browser geolocation.
- **Reminder Customization**: Adjust reminder time (5, 10, 15, or 30 minutes before prayer) and toggle specific prayer reminders.

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store (link will be provided when published)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and visible in your browser toolbar

## Usage

1. Click the Waktu Solat icon in your browser toolbar to view today's prayer times
2. The next prayer will be highlighted with the time remaining
3. Click the Settings button (⚙️) to:
   - Change your location
   - Adjust reminder time
   - Toggle specific prayer reminders
4. Use the keyboard shortcut `Ctrl+Shift+P` (or `Command+Shift+P` on Mac) to quickly open the extension

## API Integration

This extension uses the [waktusolat.app](https://api.waktusolat.app/docs) API to fetch accurate prayer times based on location.

## Privacy

- Your location data is stored locally and only used to fetch prayer times
- No personal data is shared with third parties

## Development

### Project Structure

```
waktu-solat-extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── popup.html         # Main popup UI
│   ├── css/
│   │   └── popup.css      # Styles for the popup
│   ├── js/
│   │   ├── popup.js       # UI interaction logic
│   │   └── background.js  # Background service worker
│   └── images/            # Icons and images
└── README.md              # This file
```

### Building from Source

1. Clone the repository
2. Make your changes
3. Load the extension in developer mode as described in the installation section

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Prayer times data provided by [waktusolat.app](https://api.waktusolat.app/docs)
- Icons and design elements created for this project 