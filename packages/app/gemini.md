# Gemini Project Briefing

This document provides a comprehensive overview of the MentraOS Media Controller project, designed to give Gemini a deep understanding of its purpose, architecture, and key components.

## 1. Core Functionality

This project is a **hands-free media controller for MentraOS smart glasses**. It enables users to manage media playback (e.g., music, podcasts) and view track information using voice commands. Unlike the previous version, this application is designed to work with **any media playing on a connected phone** (Android or iOS) rather than being tied to a specific service like Spotify.

**Key Features:**

-   **Voice Control:** Users can play, pause, skip to next/previous track, adjust volume, and seek forward/backward using natural language commands.
-   **"Now Playing" Overlay:** A UI component on the glasses displays the current track title, artist, playback status, and progress.
-   **Cross-Platform Compatibility:** Designed to work with both Android and iOS companion applications to control the phone's native media session.
-   **Real-time Updates:** Media information and playback status are updated in real-time from the companion phone app.
-   **Smart Glasses UI:** The user interface is minimal and optimized for the MentraOS environment.

## 2. Project Structure & Key Files

The project is now organized as a **monorepo** using npm workspaces, written in **TypeScript** and running on **Node.js**.

```
/
├── packages/
│   ├── app/                  # MentraOS application code (runs on the glasses/server)
│   │   ├── src/
│   │   │   ├── index.ts      # Main application entry point, handles MentraOS session and API endpoints.
│   │   │   ├── services/     # Generic services like storage, and voice command processing.
│   │   │   ├── ui/           # UI components for the glasses overlay (e.g., overlay.ts).
│   │   │   └── utils/        # Utility functions (e.g., error-handler.ts).
│   │   ├── package.json      # Dependencies and scripts for the MentraOS app.
│   │   └── tsconfig.json     # TypeScript configuration for the MentraOS app.
│   ├── core/                 # Shared logic, interfaces, and types used by both the MentraOS app and mobile app.
│   │   ├── src/
│   │   │   └── index.ts      # Placeholder for shared core logic.
│   │   ├── package.json      # Dependencies and scripts for the core package.
│   │   └── tsconfig.json     # TypeScript configuration for the core package.
│   └── mobile/               # Companion mobile application code (runs on Android/iOS phones)
│       ├── android/          # Android-specific project files.
│       ├── ios/              # iOS-specific project files.
│       ├── package.json      # Dependencies and scripts for the mobile package.
│       └── tsconfig.json     # TypeScript configuration for the mobile package.
├── package.json              # Root monorepo package.json, defines workspaces and top-level scripts.
├── tsconfig.base.json        # Base TypeScript configuration extended by all sub-packages.
└── README.md                 # Main project README, provides setup and usage instructions.
```

### Critical Files for Gemini to Understand:

1.  **`packages/app/src/index.ts`**: The main entry point for the MentraOS application. It initializes the `AppServer`, manages user sessions, sets up API endpoints for communication with the mobile app, and orchestrates the `MediaOverlay` and `VoiceCommandService`.
2.  **`packages/app/src/services/voice-commands.ts`**: This service processes voice input from the user. It translates voice commands (e.g., "next song", "volume up") into generic media control actions and simulates sending these commands to the companion mobile app.
3.  **`packages/app/src/ui/overlay.ts`**: Manages the visual display on the MentraOS glasses. It updates the overlay with current media information (title, artist, playback status, progress) received from the mobile app and handles showing/hiding the overlay.
4.  **`packages/app/src/services/storage.ts`**: A generic key-value storage service used for persistent data storage on the MentraOS device or server.
5.  **`packages/app/src/types/index.ts`**: Defines the core TypeScript interfaces and types, such as `MediaTrack` and `MediaState`, which are crucial for consistent data structures across the MentraOS app and the future mobile companion app.
6.  **`package.json` (root)**: Defines the monorepo structure using `workspaces` and includes top-level scripts for building and starting the entire project.
7.  **`packages/app/package.json`**: Defines dependencies (including `@mentra/sdk` and `@mentra/core`) and scripts specific to the MentraOS application.
8.  **`packages/core/package.json`**: Defines dependencies and scripts for the shared core logic.
9.  **`packages/mobile/package.json`**: Defines dependencies and scripts for the companion mobile application.

## 3. Core Dependencies

-   **`@mentra/sdk`**: The official SDK for developing MentraOS applications, providing `AppServer`, session management, and access to hardware features.
-   **`@mentra/core`**: A custom package within this monorepo for shared interfaces and logic between the MentraOS app and the mobile companion app.
-   **`node-fetch`**: Used for making HTTP requests (e.g., for the `/update-media-state` endpoint).
-   **`typescript`**: The primary language used across the entire project.

## 4. How It Works: The Application Flow (Updated)

1.  **Initialization**: The `MediaControllerApp` in `packages/app/src/index.ts` starts, setting up the server and API endpoints.
2.  **User Session**: When a user starts the app on their glasses, the `onSession` method is triggered.
3.  **Mobile App Communication**: The MentraOS app expects a companion mobile application (running on the user's phone) to send media state updates to its `/update-media-state` endpoint. This mobile app will be responsible for interacting with the phone's native media session APIs (e.g., Android's `MediaSession`, iOS's `MPRemoteCommandCenter`).
4.  **User Interaction (Voice Commands)**:
    -   The `VoiceCommandService` listens for transcriptions from the user.
    -   When a command like "Next song" or "Volume up" is detected, it simulates sending a generic media control command to the companion mobile app (in a real implementation, this would use the MentraOS SDK's communication channel to the phone).
5.  **UI Updates (Overlay)**:
    -   The `MediaOverlay` in `packages/app/src/ui/overlay.ts` is responsible for displaying media information on the glasses.
    -   It receives `MediaState` updates (track title, artist, playback status, progress) via the `/update-media-state` API endpoint from the mobile app.
    -   The overlay's content is updated dynamically to reflect the current media playback on the phone.

## 5. How to Run the Project

-   **Install all dependencies**: `npm install` (from the root directory)
-   **Build all packages**: `npm run build` (from the root directory)
-   **Start MentraOS App**: `npm start --workspace=packages/app` (from the root directory)
-   **Mobile App**: The mobile companion app (in `packages/mobile/android` and `packages/mobile/ios`) will need to be built and run separately using their respective platform-specific tools (Android Studio/Xcode).

This updated briefing provides a comprehensive understanding of the refactored project, its new monorepo structure, and the shift to a generic media control approach. For more specific details, refer to the source code and the `README.md` file.