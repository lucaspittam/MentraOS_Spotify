# MentraOS Media Controller - Project Documentation

## Project Overview

This is a hands-free universal media controller app designed for MentraOS smart glasses. It allows users to control audio playback from any app (Spotify, Apple Music, YouTube Music, Podcasts, etc.) using voice commands and view track information in an AR overlay. The app works through a cloud service that communicates with mobile companion apps to control system-level media playback.

**MentraOS Architecture**: MentraOS is a cloud operating system for smart glasses that enables JavaScript/TypeScript app development. Apps run as cloud-based services that communicate with smart glasses via webhooks and real-time events.

**Universal Media Control**: Unlike app-specific controllers, this works with any audio app by controlling system-level media functions (like headphone button controls), eliminating the need for API keys or authentication.

**Monorepo Structure**: This project is organized as a monorepo with three main packages:
- **app**: The main Media Controller MentraOS cloud application
- **core**: Shared utilities and common functionality  
- **mobile**: Companion mobile applications (Android/iOS) that execute system media controls

## Architecture

The application follows a three-tier architecture with MentraOS cloud app, mobile companions, and system media control:

### Core Components

1. **MediaControllerApp** (`src/index.ts`) - Main cloud application extending MentraOS AppServer
2. **VoiceCommandService** (`src/services/voice-commands.ts`) - Voice transcription processing and command routing
3. **StorageService** (`src/services/storage.ts`) - Settings and state storage
4. **MediaOverlay** (`src/ui/overlay.ts`) - AR display component using MentraOS layouts
5. **ErrorHandler** (`src/utils/error-handler.ts`) - Centralized error handling and logging
6. **Mobile Communication** (`src/types/index.ts`) - Type definitions for mobile app communication
7. **UI Pages** (`src/pages/`) - User interface pages and components

### Mobile Companion Apps

1. **Android App** (`packages/mobile/android/`) - Android MediaController integration
2. **iOS App** (`packages/mobile/ios/`) - iOS MPRemoteCommandCenter integration
3. **System Integration** - Direct control of device media playback

## MentraOS Integration

### Cloud App Architecture
- **Extends AppServer**: Proper MentraOS cloud app using `AppServer` base class from `@mentra/sdk`
- **Session Management**: `onSession()` handles individual user sessions when glasses connect
- **Event-Driven**: Real-time communication via WebSockets and event subscriptions
- **Cloud-Based**: App runs as a cloud service, not on the glasses themselves
- **Webhook Integration**: MentraOS initiates app sessions via webhook calls

### Mobile Communication
- **Command Relay**: Cloud app sends media commands to mobile companion apps
- **System Control**: Mobile apps execute system-level media controls
- **State Sync**: Mobile apps report current media state back to cloud app
- **Universal Compatibility**: Works with any audio app without API integration

### Session Management
- **Individual Sessions**: Each user gets a unique `AppSession` instance
- **Session Lifecycle**: `onSession(session, sessionId, userId)` called when user activates app
- **Real-time Events**: `session.events.onTranscription()` for voice input processing
- **Session Cleanup**: `onStop()` handles session termination and cleanup

### Voice Processing
- **Transcription Events**: MentraOS provides voice transcriptions via `session.events.onTranscription()`
- **Command Processing**: App processes transcribed text for media commands
- **Natural Language**: Uses pattern matching for intuitive voice commands
- **Mobile Relay**: Commands are sent to mobile companions for execution

### Display System
- **Layout API**: Uses `session.layouts.showTextWall(text)` for glasses display
- **Text-Based**: MentraOS uses text layouts for AR display (not custom UI)
- **Real-time Updates**: Display updates instantly when layout API is called
- **Universal Content**: Shows media info from any audio app

### Logging and Monitoring
- **Session Logger**: Use `session.logger` instead of `console.log` for proper logging
- **Structured Logging**: Context-aware logging with session and user information
- **Error Tracking**: Built-in error tracking and monitoring capabilities

## Data Flow

### Complete System Flow
1. **User Activation**: User activates app on MentraOS glasses
2. **Cloud Session**: MentraOS calls cloud app webhook to initiate session
3. **Voice Input**: User speaks voice command ("next song", "pause", etc.)
4. **Voice Processing**: MentraOS transcribes speech and sends to cloud app
5. **Command Analysis**: Cloud app analyzes text for media commands
6. **Mobile Communication**: Cloud app sends command to mobile companion app
7. **System Control**: Mobile app executes system media control (like headphone button)
8. **Audio App Response**: Any playing audio app responds to system media control
9. **State Update**: Mobile app reports new media state back to cloud
10. **AR Display**: Cloud app updates glasses display with current track info

### Voice Command Flow
1. **Voice Input**: User speaks while app session is active
2. **Transcription**: MentraOS processes speech and sends transcription via `session.events.onTranscription()`
3. **Command Processing**: App analyzes transcribed text for recognized commands
4. **Mobile Relay**: App sends command to mobile companion via MentraOS mobile communication
5. **System Execution**: Mobile app executes system-level media control
6. **Feedback**: App updates display to show command results
7. **Error Handling**: Failed commands show error messages via display

### Mobile Integration Flow
1. **Command Reception**: Mobile app receives command from MentraOS cloud app
2. **System API Call**: Mobile app calls system media control APIs
3. **Media App Response**: Currently playing audio app responds to system control
4. **State Retrieval**: Mobile app queries system for current media state
5. **Cloud Update**: Mobile app sends current media state back to cloud app
6. **AR Display**: Cloud app updates glasses overlay with new information

## Voice Commands

Voice commands are processed through transcription analysis (not pre-registered commands):

- **"Show media" / "Show music"** - Display the media overlay
- **"Hide media" / "Hide music"** - Hide the media overlay
- **"Next song" / "Skip" / "Next track"** - Skip to next track
- **"Previous song" / "Previous track"** - Go to previous track
- **"Pause music" / "Pause"** - Pause current playback
- **"Play music" / "Resume" / "Play"** - Resume playback
- **"Volume up" / "Volume down"** - Adjust system volume
- **"Seek forward" / "Seek backward"** - Seek within current track

Commands work with any audio app currently playing (Spotify, Apple Music, YouTube Music, Podcasts, Audiobooks, etc.).

## System Integration

### Android Integration
- **MediaController**: Uses Android MediaController and MediaSessionManager APIs
- **System Commands**: Sends standard media key events (KEYCODE_MEDIA_PLAY_PAUSE, etc.)
- **Notification Access**: Reads media notifications for current track info
- **Universal Compatibility**: Works with any app that supports media session callbacks

### iOS Integration  
- **MPRemoteCommandCenter**: Uses iOS remote command center for media control
- **MPNowPlayingInfoCenter**: Reads current playing info from system
- **Control Center Integration**: Same controls as iOS Control Center media widget
- **App Agnostic**: Works with any iOS app that reports to system media center

### System Benefits
- **No Authentication**: No API keys, OAuth flows, or user accounts needed
- **Universal Support**: Works with any audio app automatically
- **Native Integration**: Uses same system APIs as headphone buttons
- **Instant Setup**: Users just install mobile companion and MentraOS app

## Development Setup

### Environment Variables
```bash
# MentraOS Configuration
PACKAGE_NAME=com.yourname.media-controller
MENTRAOS_API_KEY=your_mentraos_api_key_here
PORT=3000

# Development
NODE_ENV=development
```

### Prerequisites
- **Node.js**: v18.0.0+ (recommended runtime)
- **Bun**: Package manager and alternative runtime
- **ngrok**: For local development webhook exposure
- **MentraOS Console**: Account for app registration
- **Android Studio**: For Android companion app development
- **Xcode**: For iOS companion app development

### Local Development
1. **Setup Environment**: Copy `.env.example` to `.env` and configure (in packages/app/)
2. **Install Dependencies**: 
   - Root: `npm install` (installs all packages)
   - App only: `cd packages/app && bun install`
3. **Start Development**: 
   - From root: `npm run dev:app`
   - From app package: `cd packages/app && bun run dev`
4. **Expose Local Server**: `ngrok http 3000` for webhook access
5. **Register App**: Create app in MentraOS Console with ngrok URL
6. **Mobile Apps**: Develop and install companion apps on test devices

### Build and Deploy
1. **Build Application**: 
   - From root: `npm run build:app`
   - From app package: `cd packages/app && bun run build`
2. **Type Check**: `bun run type-check` - Validates TypeScript
3. **Lint Code**: `bun run lint` - Runs ESLint
4. **Deploy Cloud App**: Upload to cloud platform (Railway, Render, etc.)
5. **Configure Webhook**: Update MentraOS Console with production URL
6. **Publish Mobile Apps**: Deploy mobile companions to app stores

## Deployment Requirements

### MentraOS App Registration
- **Console Registration**: Register app at [console.mentra.glass/apps](https://console.mentra.glass/apps)
- **Package Name**: Must match `PACKAGE_NAME` environment variable exactly
- **API Key**: Obtain from MentraOS Console for authentication
- **Webhook URL**: Point to your deployed app's root URL
- **Permissions**: Declare in console (microphone for voice input)
- **Setup Guide**: See `MENTRAOS_SETUP.md` for complete console configuration

### Cloud Hosting
- **Static Domain**: Required for consistent webhook access
- **HTTPS**: MentraOS requires secure webhook endpoints
- **Always-On**: App must be available 24/7 for user sessions
- **Environment Variables**: Configure all required env vars in hosting platform

### Mobile App Distribution
- **Android**: Publish companion app to Google Play Store
- **iOS**: Publish companion app to Apple App Store
- **Permissions**: Mobile apps need media control and notification access permissions
- **Background Execution**: Mobile apps need background execution for real-time communication

### User Requirements
- **MentraOS Glasses**: Users must have MentraOS smart glasses
- **Mobile Device**: Android or iOS device with companion app installed
- **Internet Connection**: Required for cloud app communication
- **Audio App**: Any audio app for playback (no specific app required)

## File Structure

```
MentraOS_Media_Controller/              # Monorepo root
├── packages/
│   ├── app/                           # Main Media Controller cloud app
│   │   ├── src/
│   │   │   ├── index.ts               # Main AppServer implementation
│   │   │   ├── pages/                 # UI pages and components
│   │   │   ├── services/
│   │   │   │   ├── storage.ts         # Settings and state storage
│   │   │   │   └── voice-commands.ts  # Voice command processing
│   │   │   ├── types/
│   │   │   │   └── index.ts           # TypeScript interfaces and mobile communication
│   │   │   ├── ui/
│   │   │   │   └── overlay.ts         # AR overlay using MentraOS layouts
│   │   │   └── utils/
│   │   │       └── error-handler.ts   # Error handling and logging
│   │   ├── .env.example               # Environment variables template
│   │   ├── package.json               # App package configuration
│   │   ├── tsconfig.json              # App TypeScript config
│   │   ├── CLAUDE.md                  # This documentation file
│   │   └── dist/                      # Built JavaScript output
│   ├── core/                          # Shared core utilities
│   │   ├── src/
│   │   │   └── index.ts               # Core shared functionality
│   │   └── package.json               # Core package configuration
│   └── mobile/                        # Mobile companion apps
│       ├── android/
│       │   └── index.ts               # Android MediaController integration
│       ├── ios/
│       │   └── index.ts               # iOS MPRemoteCommandCenter integration
│       └── package.json               # Mobile package configuration
├── package.json                       # Root package configuration
├── tsconfig.base.json                 # Base TypeScript configuration
└── README.md                          # Project overview
```

## Technologies Used

- **TypeScript** - Type-safe development with MentraOS SDK support
- **MentraOS SDK** - Cloud-based smart glasses app framework (`@mentra/sdk`)
- **Bun Runtime** - Fast JavaScript runtime and package manager
- **Android MediaController** - System-level media control on Android
- **iOS MPRemoteCommandCenter** - System-level media control on iOS
- **Node.js** - Alternative runtime for production deployment

## Key Architectural Decisions

### Universal Media Control Strategy
- **System-Level Integration**: Control media through system APIs, not app-specific APIs
- **No Authentication Required**: Eliminates OAuth flows and API key management
- **App Agnostic**: Works with any audio app that supports system media controls
- **Mobile Relay Pattern**: Cloud app → Mobile companion → System media control

### Three-Tier Architecture
- **MentraOS Cloud App**: Handles voice processing and AR display
- **Mobile Companion Apps**: Execute system media controls and report state
- **System Media APIs**: Universal media control layer used by all audio apps

### Voice Processing Strategy
- **Transcription-Based**: Process voice via transcription analysis, not command registration
- **Pattern Matching**: Use flexible pattern matching for natural voice commands
- **Command Relay**: Send parsed commands to mobile apps for execution
- **Universal Commands**: Same voice commands work across all audio apps

### Display Strategy
- **Text Layouts**: Use MentraOS `session.layouts.showTextWall()` for all display
- **Universal Content**: Display media info from any audio app
- **Real-time Updates**: Instant display updates via layout API calls
- **Source Agnostic**: Shows track info regardless of audio app source

### Mobile Communication
- **Real-time Messaging**: Use MentraOS mobile communication when available
- **Command/Response Pattern**: Send commands, receive media state updates
- **Error Handling**: Graceful handling of mobile app disconnections
- **Background Operation**: Mobile apps maintain connection for instant response

## Development Best Practices

### MentraOS Patterns
- **Use `session.logger`**: Always use session logger instead of `console.log`
- **Event-Driven**: Build around event subscriptions, not polling
- **Session Management**: Properly handle session lifecycle and cleanup
- **Error Handling**: Provide clear user feedback for all error states

### Mobile Integration
- **Background Permissions**: Ensure mobile apps can run in background
- **System Permissions**: Request proper media control permissions
- **Connection Resilience**: Handle temporary connection losses gracefully
- **State Synchronization**: Keep cloud and mobile state synchronized

### Voice Command Design
- **Natural Language**: Support natural phrasing for voice commands
- **Pattern Matching**: Use flexible text analysis for command recognition
- **Universal Commands**: Design commands that work across all audio apps
- **Error States**: Handle unrecognized commands gracefully

### Display Optimization
- **Text-Only**: Design for text-based layouts (no custom graphics)
- **Concise Content**: Keep display content brief and scannable
- **Universal Format**: Design layouts that work with any audio app content
- **Loading States**: Show loading feedback during mobile operations

## Deployment

### Current Hosting
- **Platform**: Render.com cloud hosting
- **Build Command**: `npm install && npm run build` 
- **Start Command**: `npm run render-start`
- **Environment**: Node.js production environment
- **Port**: Auto-assigned by Render (via PORT env var)

### Render Configuration
The app includes a `render.yaml` file for deployment configuration and a `render-start` script in package.json for proper startup sequence.

## Memories

- **Stripped to Essentials**: Removed all non-working features, kept only voice recognition and text display
- **Basic MentraOS App**: Simple foundation with working voice commands ("Show Media"/"Hide Media") 
- **Render Deployment**: Deployed to Render.com with proper build/start scripts
- **Voice Transcription**: Uses `session.events.onTranscription()` for voice input processing
- **Text Layouts**: Uses `session.layouts.showTextWall()` for AR display
- **Session Logging**: Uses `session.logger.info()` for proper MentraOS logging
- **Console Configuration**: App config is done in MentraOS Console, not local files
- **No Local Config Files**: Removed mentra.config.json - configuration is console-based
- **Setup Documentation**: Created MENTRAOS_SETUP.md with complete console configuration guide
- **Working Foundation**: Ready for building actual functionality on top