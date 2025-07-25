# MentraOS Spotify Controller - Project Documentation

## Project Overview

This is a hands-free Spotify controller app designed for MentraOS smart glasses. It allows users to control Spotify playback and view track information using voice commands and an AR overlay interface. The app is built as a proper MentraOS application using the AppServer pattern.

## Architecture

The application follows the MentraOS AppServer architecture with proper session management and settings integration:

### Core Components

1. **SpotifyControllerApp** (`src/index.ts`) - Main AppServer implementation extending MentraOS AppServer
2. **SpotifyAuthService** (`src/services/spotify-auth.ts`) - OAuth authentication with token management
3. **SpotifyApiService** (`src/services/spotify-api.ts`) - Spotify Web API integration
4. **VoiceCommandService** (`src/services/voice-commands.ts`) - Voice command processing with MentraOS SDK
5. **StorageService** (`src/services/storage.ts`) - File-based token storage (server) and MentraOS storage (client)
6. **SpotifyOverlay** (`src/ui/overlay.ts`) - AR overlay UI component for music display
7. **MentraSettingsService** (`src/services/mentra-settings.ts`) - MentraOS settings integration
8. **ErrorHandler** (`src/utils/error-handler.ts`) - Centralized error handling and logging

## MentraOS Integration

### AppServer Implementation
- **Extends AppServer**: Proper MentraOS app using `AppServer` base class
- **Session Management**: `onSession()` handles user sessions on glasses
- **Webhook Endpoints**: `/webhook` for MentraOS, `/health` for monitoring
- **Configuration**: Uses package name, API key, and proper MentraOS config

### Settings System
- **Console Configuration**: Settings defined in MentraOS Developer Console at [console.mentra.glass/apps](https://console.mentra.glass/apps)
- **Settings Location**: Appear in **Settings → App Settings → Spotify Controller** on glasses
- **Real-time Sync**: Changes sync immediately via `session.settings.onChange()`
- **Available Settings**:
  - `spotify_connected` (text) - Connection status display
  - `show_album_art` (toggle) - Album artwork in overlay
  - `auto_show_overlay` (toggle) - Auto-show music overlay
  - `overlay_timeout` (slider, 5-60) - Overlay display duration
  - `voice_feedback` (toggle) - Audio confirmations
  - `haptic_feedback` (toggle) - Vibration confirmations
  - `auth_action` (select) - Connect/Disconnect dropdown

### Display System
- **TextWall Layouts**: Uses `session.layouts.showTextWall()` for glasses display
- **Track Information**: Shows current song, artist, album in AR
- **Authentication Prompts**: Displays auth URLs and instructions
- **Error Messages**: User-friendly error displays

## Data Flow

### Session Lifecycle
1. **MentraOS Activation**: User activates app on glasses
2. **Webhook Call**: MentraOS calls `/webhook` to start session
3. **Session Creation**: `AppServer.onSession()` creates new user session
4. **Service Initialization**: Auth, API, settings, voice, and overlay services initialized
5. **Authentication Check**: Checks for stored Spotify tokens
6. **Display Logic**: Shows current track or authentication prompt
7. **Real-time Updates**: Polls Spotify API and updates display
8. **Session End**: `AppServer.onStop()` handles cleanup

### Authentication Flow
1. **Token Check**: App checks for existing valid tokens in storage
2. **Auth Prompt**: If no tokens, shows authentication URL on glasses
3. **User Authentication**: User visits URL on phone/computer or uses Settings
4. **OAuth Flow**: Standard Spotify OAuth 2.0 with PKCE
5. **Token Storage**: Access/refresh tokens stored securely
6. **Session Update**: Settings service updates connection status
7. **Music Integration**: Begins polling Spotify API for track info

### Settings Integration
1. **Console Definition**: Settings configured in MentraOS Developer Console
2. **Settings Display**: Appear in MentraOS Settings app automatically
3. **Change Events**: `session.settings.onChange()` fires when user changes settings
4. **Handler Processing**: `MentraSettingsService.handleSettingsChange()` processes changes
5. **Behavior Updates**: App behavior updates based on new setting values
6. **Real-time Sync**: Settings changes apply immediately across all sessions

### Real-time Updates
- **Track Polling**: Polls Spotify API every 5 seconds for current track
- **Display Updates**: Updates glasses display with new track information
- **Overlay Management**: Shows/hides overlay based on user preferences
- **Token Refresh**: Automatically refreshes expired access tokens
- **Settings Sync**: Real-time synchronization of user preferences

## Voice Commands

Voice commands are registered with MentraOS SDK and work hands-free:

- **"Show Spotify"** - Toggle the music overlay display
- **"Next song" / "Skip"** - Skip to next track
- **"Previous song"** - Go to previous track
- **"Pause music"** - Pause current playback
- **"Play music"** - Resume playback
- **"Like this song"** - Add current track to Spotify library

Voice feedback and haptic feedback can be controlled via app settings.

## API Integrations

### Spotify Web API
- **Authentication**: OAuth 2.0 with PKCE flow
- **Token Management**: Automatic refresh with retry logic
- **Scopes Required**:
  - `user-read-currently-playing` - Get current track
  - `user-read-playback-state` - Read playback state
  - `user-modify-playback-state` - Control playback
  - `user-library-modify` - Add tracks to library
- **Endpoints Used**:
  - `GET /v1/me/player/currently-playing` - Get current track
  - `PUT /v1/me/player/play` - Resume playback
  - `PUT /v1/me/player/pause` - Pause playback
  - `POST /v1/me/player/next` - Skip to next track
  - `POST /v1/me/player/previous` - Previous track
  - `PUT /v1/me/tracks` - Save track to library

### MentraOS SDK Integration
- **AppServer**: Base class for MentraOS apps with session management
- **AppSession**: Per-user session with events, layouts, and settings
- **Layouts**: `session.layouts.showTextWall()` for AR display
- **Settings**: `session.settings.get()` and `onChange()` for user preferences
- **Events**: `session.events.onTranscription()` for voice input
- **Voice Commands**: Registered via MentraOS voice system
- **Storage**: File-based storage for server, MentraOS storage for client data

## Key Features

### Proper MentraOS App
- **AppServer Architecture**: Follows MentraOS patterns exactly
- **Session Management**: Handles multiple concurrent user sessions
- **Webhook Integration**: Proper `/webhook` endpoint for MentraOS calls
- **Settings Integration**: Native MentraOS Settings app integration
- **Display System**: Uses MentraOS layout system for AR display

### Authentication System
- **Secure OAuth 2.0**: Standard Spotify authentication flow
- **Token Management**: Automatic refresh with expiration handling
- **Storage Options**: File-based (server) and MentraOS storage (client)
- **Error Handling**: Graceful authentication error recovery
- **Settings Integration**: Connect/disconnect via MentraOS Settings

### Voice Control
- **MentraOS Voice SDK**: Integrated with native voice system
- **Natural Commands**: Intuitive voice command phrases
- **Feedback System**: Audio and haptic feedback (user configurable)
- **Error Handling**: Voice command error recovery
- **User Preferences**: Feedback can be enabled/disabled in settings

### AR Display
- **TextWall Layouts**: Clean text display optimized for smart glasses
- **Real-time Updates**: Live track information updates
- **User Preferences**: Display options configurable in settings
- **Loading States**: Clear feedback during operations
- **Error Messages**: User-friendly error displays

### Settings Management
- **Console Configuration**: Settings defined in MentraOS Developer Console
- **Native Integration**: Appears in standard MentraOS Settings app
- **Real-time Sync**: Immediate synchronization across devices
- **User Control**: Toggle features, adjust timeouts, manage connection
- **Persistent Storage**: Settings persist across app sessions

## Development Setup

### Environment Variables
```bash
# MentraOS Configuration
PACKAGE_NAME=com.yourname.spotify-controller
MENTRAOS_API_KEY=your_mentraos_api_key_here
PORT=3000

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-ngrok-url.ngrok.io/callback

# Development
NODE_ENV=development
```

### Local Development
1. **Setup Environment**: Copy `.env.template` to `.env` and configure
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev` (uses Bun runtime)
4. **Setup ngrok**: `ngrok http 3000` for OAuth callbacks
5. **Configure Console**: Add settings to MentraOS Developer Console

### Build and Deploy
1. **Build Application**: `npm run build` - Compiles TypeScript
2. **Type Check**: `npm run type-check` - Validates TypeScript
3. **Lint Code**: `npm run lint` - Runs ESLint
4. **Deploy**: Upload to cloud platform or self-host
5. **Configure Webhook**: Set webhook URL in MentraOS console

## Distribution Model

This is a **native MentraOS application** distributed exclusively through the MentraOS ecosystem:

### Platform Requirements
- **MentraOS Smart Glasses**: Only runs on MentraOS hardware
- **MentraOS Developer Console**: App registration and settings configuration
- **Cloud Deployment**: App must be deployed and accessible via webhook
- **Individual Authentication**: Each user must authenticate with their own Spotify account

### User Requirements
- **MentraOS Glasses**: Must have MentraOS smart glasses
- **Spotify Premium**: Required for playback control (Spotify API limitation)
- **Internet Connection**: Required for Spotify API access
- **Personal Authentication**: Must use their own Spotify credentials

### Installation Process
1. **Developer**: Configure app in MentraOS console with settings
2. **Deployment**: Deploy app to cloud platform with webhook URL
3. **User**: Install app on MentraOS glasses from app store
4. **Authentication**: User authenticates via Settings or auth URL
5. **Usage**: Voice commands and overlay work immediately after auth

## File Structure

```
mentraos-spotify-controller/
├── src/
│   ├── index.ts                    # Main AppServer implementation
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces and types
│   ├── services/
│   │   ├── spotify-auth.ts        # OAuth authentication with token management
│   │   ├── spotify-api.ts         # Spotify Web API client integration
│   │   ├── storage.ts             # Multi-environment storage (file/MentraOS)
│   │   ├── voice-commands.ts      # MentraOS voice command integration
│   │   └── mentra-settings.ts     # MentraOS settings system integration
│   ├── ui/
│   │   └── overlay.ts             # AR overlay UI component
│   └── utils/
│       └── error-handler.ts       # Centralized error handling and logging
├── .env.template                   # Environment variables template
├── package.json                    # Node.js/Bun configuration
├── tsconfig.json                   # TypeScript configuration
├── DEPLOYMENT_GUIDE.md             # Complete deployment instructions
├── MENTRA_CONSOLE_SETTINGS.md      # Settings configuration guide
└── dist/                          # Built JavaScript output
```

## Technologies Used

- **TypeScript** - Type-safe development with full MentraOS SDK support
- **MentraOS SDK** - Native smart glasses integration with AppServer
- **Bun Runtime** - Recommended JavaScript runtime for MentraOS apps
- **Spotify Web API** - Music service integration with OAuth 2.0
- **Node.js Compatibility** - Works with Node.js and Bun environments

## Key Architectural Decisions

### AppServer Pattern
- **Proper Integration**: Uses MentraOS AppServer base class correctly
- **Session Management**: Handles per-user sessions with proper lifecycle
- **Webhook Endpoints**: Exposes correct endpoints for MentraOS integration
- **Configuration**: Uses proper MentraOS configuration patterns

### Settings System
- **Console-Driven**: Settings defined in MentraOS console, not local files
- **Native Integration**: Uses standard MentraOS Settings app interface
- **Real-time Sync**: Immediate updates via MentraOS settings system
- **User Control**: All preferences controllable by end users

### Storage Strategy
- **Dual Storage**: File-based for server persistence, MentraOS storage for client
- **Token Security**: Secure token storage with automatic refresh
- **Cross-Platform**: Works in both development and production environments

### Display Strategy
- **MentraOS Layouts**: Uses native `session.layouts.showTextWall()` API
- **AR Optimized**: Text layouts designed for smart glasses display
- **User Preferences**: Display behavior controlled by user settings

## Memories

- **Complete Architecture Redesign**: Transformed from Express app to proper MentraOS AppServer
- **Settings Integration**: Implemented native MentraOS Settings app integration
- **Console Configuration**: Created comprehensive MentraOS Developer Console setup guide
- **Session Management**: Built proper user session handling with lifecycle management
- **Display System**: Integrated with MentraOS layout system for AR display
- **Voice Integration**: Connected with MentraOS voice command system
- **Real-time Updates**: Implemented live Spotify track polling and display updates
- **Authentication Flow**: Built secure OAuth flow with token management
- **Error Handling**: Created comprehensive error handling and user feedback system
- **Documentation**: Provided complete deployment and configuration guides