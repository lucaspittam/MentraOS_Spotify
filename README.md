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

## Quick Deploy to Render 🚀

**Live Production URL**: https://mentraos-spotify.onrender.com

### 1. Get API Keys (5 minutes)

**MentraOS Console**: https://console.mentra.glass
- Create app with package name: `com.yourname.spotify-controller`
- Set production URL: `https://mentraos-spotify.onrender.com`
- Copy your API key

**Spotify Dashboard**: https://developer.spotify.com/dashboard
- Create app with redirect URI: `https://mentraos-spotify.onrender.com/callback`
- Copy Client ID and Client Secret

### 2. Deploy to Render (5 minutes)

1. **Push to GitHub** (if not already done)
2. **Go to render.com** → Sign up → New Web Service
3. **Connect your GitHub repo**: `MentraOS_Spotify`
4. **Add environment variables**:
   ```
   MENTRAOS_API_KEY=your_mentraos_api_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```
5. **Click Deploy** - Render auto-detects the `render.yaml` config

### 3. Install on Glasses (5 minutes)

1. **Test**: Visit https://mentraos-spotify.onrender.com/auth
2. **Update MentraOS Console** with production URL
3. **Install via MentraOS phone app**
4. **Try voice commands**: "Show Spotify", "Next song", etc.

**That's it!** Your app is live and ready for unlimited users. Each person authenticates with their own Spotify Premium account.

📖 **Need detailed setup?** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions.

---

## Local Development Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MentraOS smart glasses** or development environment
3. **Spotify Premium account**
4. **ngrok** for local OAuth callbacks

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
   # Edit .env with your API keys (see deployment guide)
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

## Production Deployment

### Render Hosting (Recommended)

This app is pre-configured for **Render** deployment with automatic scaling:

- **Production URL**: https://mentraos-spotify.onrender.com
- **Auto-deploy**: Every git push triggers deployment
- **Free tier**: 750 hours/month (24/7 coverage)
- **Zero config**: `render.yaml` handles everything

### Environment Variables Required

Set these in your Render dashboard:

| Variable | Value | Where to Get |
|----------|--------|--------------|
| `MENTRAOS_API_KEY` | Your API key | [MentraOS Console](https://console.mentra.glass) |
| `SPOTIFY_CLIENT_ID` | Your client ID | [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Your client secret | Spotify Dashboard |

Pre-configured automatically:
- `PACKAGE_NAME`: com.yourname.spotify-controller
- `SPOTIFY_REDIRECT_URI`: https://mentraos-spotify.onrender.com/callback
- `PORT`: 10000

### Alternative Hosting

The app also works on:
- **Railway** (see DEPLOYMENT.md)
- **Heroku**
- **DigitalOcean**
- **Any Node.js hosting platform**

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