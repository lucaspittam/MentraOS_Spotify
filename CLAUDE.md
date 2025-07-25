# MentraOS Spotify Controller - Project Documentation

## Project Overview

This is a hands-free Spotify controller app designed for MentraOS smart glasses. It allows users to control Spotify playback and view track information using voice commands and an AR overlay interface.

## Architecture

The application follows a modular service-oriented architecture with clear separation of concerns:

### Core Components

1. **MentraSpotifyApp** (`src/index.ts`) - Main application orchestrator
2. **SpotifyAuthService** (`src/services/spotify-auth.ts`) - OAuth authentication
3. **SpotifyApiService** (`src/services/spotify-api.ts`) - Spotify Web API integration
4. **VoiceCommandService** (`src/services/voice-commands.ts`) - Voice command processing
5. **StorageService** (`src/services/storage.ts`) - Persistent data storage
6. **SpotifyOverlay** (`src/ui/overlay.ts`) - AR overlay UI component
7. **ErrorHandler** (`src/utils/error-handler.ts`) - Centralized error handling

## Data Flow

### Initialization Flow
1. App starts and initializes all services
2. Checks for existing Spotify tokens in MentraOS storage
3. If tokens exist, starts polling for currently playing track
4. If no tokens, prompts user to authenticate
5. Registers voice commands with MentraOS SDK
6. Sets up AR overlay UI

### Authentication Flow
1. User visits `/auth` endpoint
2. Redirects to Spotify OAuth with required scopes
3. User authenticates and grants permissions
4. Spotify redirects to `/callback` with authorization code
5. App exchanges code for access/refresh tokens
6. Tokens stored securely in MentraOS storage
7. Polling starts for currently playing track

### Real-time Updates
- App polls Spotify API every 5 seconds for currently playing track
- Updates AR overlay with track info (name, artist, album art)
- Handles token refresh automatically when access token expires
- Implements retry logic with exponential backoff for API failures

### Voice Commands
- "Show Spotify" - Toggle the music overlay
- "Next song" / "Skip" - Skip to next track
- "Pause music" - Pause playback
- "Play music" - Resume playback
- "Like this song" - Add current track to library
- "Previous song" - Go to previous track

## API Integrations

### Spotify Web API
- **Authentication**: OAuth 2.0 with PKCE flow
- **Scopes Required**:
  - `user-read-currently-playing`
  - `user-read-playback-state`
  - `user-modify-playback-state`
  - `user-library-modify`
- **Endpoints Used**:
  - `GET /v1/me/player/currently-playing` - Get current track
  - `PUT /v1/me/player/play` - Resume playback
  - `PUT /v1/me/player/pause` - Pause playback
  - `POST /v1/me/player/next` - Skip to next track
  - `POST /v1/me/player/previous` - Previous track
  - `PUT /v1/me/tracks` - Save track to library

### MentraOS SDK Integration
- **Storage**: `mentra.storage.*` - Persistent token storage
- **Voice**: `mentra.voice.registerCommand()` - Voice command registration
- **UI**: `mentra.ui.registerOverlay()` - AR overlay management
- **Feedback**: `mentra.feedback.*` - Haptic and audio feedback

## Key Features

### Authentication System
- Secure OAuth 2.0 flow with automatic token refresh
- Persistent token storage using MentraOS SDK
- Graceful handling of authentication errors

### Voice Control
- Natural language voice commands
- Haptic and audio feedback for actions
- Error handling with user-friendly messages

### AR Overlay
- Clean, minimalist design optimized for smart glasses
- Real-time track information display
- Album art, track name, and artist information
- Loading states and error messages

### Error Handling
- Centralized error categorization system
- Automatic retry logic for network failures
- User-friendly error messages in AR overlay
- Comprehensive logging for debugging

## Development Setup

### Environment Variables
```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
PORT=3000
```

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. Use ngrok for OAuth callback during development
4. Visit `/auth` to authenticate with Spotify

### Build and Deploy
1. `npm run build` - Build TypeScript to JavaScript
2. `npm run lint` - Run ESLint checks
3. `npm run type-check` - Run TypeScript type checking
4. Upload to MentraOS Developer Console

## Distribution Model

This app is designed for MentraOS smart glasses ecosystem, not traditional app stores:

- **Platform**: MentraOS smart glasses only
- **Distribution**: Mentra Developer Console
- **Requirements**: 
  - MentraOS glasses
  - Spotify Premium account
  - Individual user authentication (no shared API)

Each user must:
1. Install app on their MentraOS glasses
2. Complete Spotify OAuth authentication
3. Have active Spotify Premium account
4. Use their own Spotify credentials

## File Structure

```
src/
├── index.ts              # Main app entry point and orchestration
├── types/
│   └── index.ts          # TypeScript interfaces and types
├── services/
│   ├── spotify-auth.ts   # OAuth authentication handling
│   ├── spotify-api.ts    # Spotify Web API integration
│   ├── storage.ts        # MentraOS storage integration
│   └── voice-commands.ts # Voice command processing
├── ui/
│   └── overlay.ts        # AR overlay UI component
└── utils/
    └── error-handler.ts  # Centralized error handling
```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Express.js** - OAuth callback server
- **MentraOS SDK** - Smart glasses integration
- **Spotify Web API** - Music service integration
- **Node.js** - Runtime environment

## Memories

- Analyzed complete codebase architecture and functionality
- Documented comprehensive project structure and data flows
- Explained distribution model for MentraOS platform