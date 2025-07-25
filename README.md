# Mentra Spotify Controller

A hands-free Spotify controller for MentraOS smart glasses that lets you control music playback and view track information using voice commands.

## Features

- 🎵 **Live Now Playing Display**: Shows current track, artist, and album art in a sleek overlay
- 🗣️ **Voice Commands**: Control playback with natural voice commands
- 🔐 **Spotify OAuth**: Secure authentication with persistent token storage
- ⚡ **Real-time Updates**: Track info updates every 5 seconds
- 👓 **Optimized for Smart Glasses**: Minimal, clean UI designed for MentraOS

## Voice Commands

- **"Show Spotify"** - Toggle the music overlay
- **"Next song"** / **"Skip"** - Skip to next track
- **"Pause music"** - Pause playback
- **"Play music"** - Resume playback
- **"Like this song"** - Add current track to your library
- **"Previous song"** - Go to previous track

## Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MentraOS development environment** set up
3. **Spotify Developer Account** and app credentials
4. **ngrok** for local development tunneling

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app with these settings:
   - **App Name**: Mentra Spotify Controller
   - **Redirect URI**: `http://localhost:3000/callback`
   - **Scopes**: 
     - `user-read-currently-playing`
     - `user-read-playback-state`
     - `user-modify-playback-state`
     - `user-library-modify`

3. Note your **Client ID** and **Client Secret**

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd MentraOS_Spotify
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Spotify credentials
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Development

### Local Development with ngrok

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **In another terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Update your Spotify app redirect URI** to use the ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/callback
   ```

4. **Authenticate**: Visit `https://your-ngrok-url.ngrok.io/auth`

5. **Deploy to your glasses** using the MentraOS developer console

### Testing

- **Check app status**: `GET /status`
- **Manual auth**: `GET /auth` 
- **OAuth callback**: `GET /callback`

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── types/                # TypeScript type definitions
├── services/
│   ├── spotify-auth.ts   # OAuth authentication handling
│   ├── spotify-api.ts    # Spotify Web API integration
│   ├── storage.ts        # Mentra storage integration
│   └── voice-commands.ts # Voice command processing
├── ui/
│   └── overlay.ts        # Music overlay UI component
└── utils/
    └── error-handler.ts  # Centralized error handling
```

## Deployment

### Deploy to MentraOS

1. **Build the production version**:
   ```bash
   npm run build
   ```

2. **Upload to Mentra Developer Console**:
   - Package the `dist/` folder and `mentra.config.json`
   - Upload through the developer portal
   - Install on your glasses

3. **Configure production redirect URI**:
   - Update Spotify app settings with your production callback URL
   - Update environment variables accordingly

### Production Environment Variables

```bash
SPOTIFY_CLIENT_ID=your_production_client_id
SPOTIFY_CLIENT_SECRET=your_production_client_secret
SPOTIFY_REDIRECT_URI=https://your-production-domain/callback
PORT=3000
```

## Usage

1. **First Launch**: The app will prompt you to authenticate with Spotify
2. **Authentication**: Follow the OAuth flow on your paired phone
3. **Voice Control**: Once authenticated, use voice commands to control playback
4. **Overlay**: Say "Show Spotify" to see current track information

## Troubleshooting

### Common Issues

**"No tokens found"**
- Complete the Spotify OAuth flow first
- Check that redirect URI matches exactly

**"No active device"**
- Start playing music on any Spotify device first
- The app requires an active playback session

**"Authentication failed"**
- Verify Spotify app credentials
- Check redirect URI configuration
- Ensure ngrok tunnel is active (development)

**Voice commands not working**
- Check MentraOS voice permissions
- Verify app is properly installed on glasses
- Try restarting the app

### Debug Mode

```bash
# Enable verbose logging
DEBUG=1 npm run dev
```

## API Reference

### Spotify Web API Endpoints Used

- `GET /v1/me/player/currently-playing` - Get current track
- `PUT /v1/me/player/play` - Resume playback
- `PUT /v1/me/player/pause` - Pause playback
- `POST /v1/me/player/next` - Skip to next track
- `POST /v1/me/player/previous` - Previous track
- `PUT /v1/me/tracks` - Save track to library

### MentraOS SDK Integration

- `mentra.storage.*` - Persistent token storage
- `mentra.voice.registerCommand()` - Voice command registration
- `mentra.ui.registerOverlay()` - UI overlay management
- `mentra.feedback.*` - Haptic and audio feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on MentraOS glasses
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review MentraOS documentation at [docs.mentra.glass](https://docs.mentra.glass)
- Open an issue in this repository