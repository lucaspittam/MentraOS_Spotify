# MentraOS Media Controller

A hands-free media controller for MentraOS smart glasses that lets you control music playback and view track information using voice commands, working with any media playing on your connected phone.

## Features

- 🎵 **Live Now Playing Display**: Shows current track title, artist, and playback status in a sleek overlay.
- 🗣️ **Voice Commands**: Control playback with natural voice commands (play, pause, next, previous, volume, seek).
- ⚡ **Real-time Updates**: Track info and playback status updates from your phone.
- 👓 **Optimized for Smart Glasses**: Minimal, clean UI designed for MentraOS.

## Voice Commands

- **"Show Media"** - Toggle the music overlay
- **"Hide Media"** - Hide the music overlay
- **"Next song"** / **"Skip"** - Skip to next track
- **"Previous song"** - Go to previous track
- **"Pause music"** - Pause playback
- **"Play music"** / **"Resume music"** - Resume playback
- **"Volume up"** - Increase media volume
- **"Volume down"** - Decrease media volume
- **"Seek forward"** - Fast forward in the current track
- **"Seek backward"** - Rewind in the current track

## Project Setup & Deployment

This project is a monorepo containing the MentraOS application and a companion mobile application (Android/iOS) that acts as a bridge to control media playback on your phone.

### Prerequisites

1.  **Node.js** (v18 or higher)
2.  **MentraOS smart glasses** or development environment
3.  **Android Studio** (for Android companion app development)
4.  **Xcode** (for iOS companion app development)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd MentraOS_Media_Controller
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
    This will install dependencies for all packages in the monorepo.

### Building the Project

To build all packages:

```bash
npm run build
```

### Running the MentraOS App (Glasses)

To start the MentraOS application server:

```bash
npm start --workspace=packages/app
```

### Running the Companion Mobile App (Phone)

**Android:**

```bash
cd packages/mobile/android
# Follow Android-specific build and run instructions (e.g., via Android Studio or Gradle)
```

**iOS:**

```bash
cd packages/mobile/ios
# Follow iOS-specific build and run instructions (e.g., via Xcode)
```

## Project Structure

```
/
├── packages/
│   ├── app/                  # MentraOS application code
│   │   ├── src/
│   │   │   ├── index.ts      # Main application entry point
│   │   │   ├── services/     # Services like storage, voice commands
│   │   │   ├── ui/           # UI components (e.g., overlay)
│   │   │   └── utils/        # Utility functions
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── core/                 # Shared logic and interfaces between app and mobile
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/               # Companion mobile application code
│       ├── android/          # Android-specific project
│       ├── ios/              # iOS-specific project
│       ├── package.json
│       └── tsconfig.json
├── package.json              # Root monorepo package.json (defines workspaces)
├── tsconfig.base.json        # Base TypeScript configuration for all packages
└── README.md                 # This file
```

## Usage

1.  **Start the MentraOS app** on your development environment or glasses.
2.  **Run the companion mobile app** on your Android or iOS phone.
3.  Ensure your phone is connected to your MentraOS glasses (via MentraOS SDK communication).
4.  **Voice Control**: Use voice commands like "Play music", "Next song", etc., to control media playing on your phone.
5.  **Overlay**: Say "Show Media" to see current track information on your glasses.

## Troubleshooting

-   **Voice commands not working**: Check MentraOS voice permissions, verify app is properly installed on glasses, ensure companion app is running on phone and connected.
-   **No media information**: Ensure media is actively playing on your phone and the companion app is running.

## Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Test thoroughly
5.  Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
-   Check the troubleshooting section
-   Review MentraOS documentation at [docs.mentra.glass](https://docs.mentra.glass)
-   Open an issue in this repository
