# MentraOS Spotify Controller - Deployment Guide

This guide explains how to deploy the Spotify Controller as a proper MentraOS app.

## 🏗️ App Structure

The app is now properly structured as a MentraOS app using `AppServer`:

```
spotify-controller/
├── src/
│   ├── index.ts              # Main AppServer implementation
│   ├── services/
│   │   ├── spotify-auth.ts   # Spotify OAuth handling
│   │   ├── spotify-api.ts    # Spotify Web API client
│   │   ├── storage.ts        # Token storage (file-based)
│   │   ├── voice-commands.ts # Voice command processing
│   │   └── mentra-settings.ts # MentraOS settings integration
│   ├── ui/
│   │   └── overlay.ts        # Music overlay UI
│   ├── utils/
│   │   └── error-handler.ts  # Error handling
│   └── types/
│       └── index.ts          # TypeScript types
├── .env.template             # Environment variables template
├── package.json              # Node.js package configuration
├── tsconfig.json             # TypeScript configuration
└── dist/                     # Built JavaScript (after npm run build)
```

## 🔧 Environment Setup

1. **Copy Environment Template**
   ```bash
   cp .env.template .env
   ```

2. **Configure Environment Variables**
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

## 📱 MentraOS Console Setup

1. **Create App in Console**
   - Go to [console.mentra.glass/apps](https://console.mentra.glass/apps)
   - Create new app with package name: `com.yourname.spotify-controller`
   - Set app name: "Spotify Controller"
   - Add description: "Voice-controlled Spotify playback for MentraOS smart glasses"

2. **Configure App Settings** (as per `MENTRA_CONSOLE_SETTINGS.md`):
   - `spotify_connected` (text) - Connection status display
   - `show_album_art` (toggle) - Show album artwork  
   - `auto_show_overlay` (toggle) - Auto-show music overlay
   - `overlay_timeout` (slider, 5-60) - Overlay display duration
   - `voice_feedback` (toggle) - Audio confirmations
   - `haptic_feedback` (toggle) - Vibration confirmations
   - `auth_action` (select) - Connect/Disconnect dropdown

3. **Set Permissions**
   - Microphone access (for voice commands)
   - Any other required permissions

## 🚀 Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Set up ngrok** (for OAuth callbacks)
   ```bash
   ngrok http 3000
   # Copy the HTTPS URL to SPOTIFY_REDIRECT_URI
   ```

4. **Test Locally**
   - App runs on port 3000
   - Webhook endpoint: `/webhook`
   - Health check: `/health`
   - Settings endpoint: `/settings`

## 🏭 Production Deployment

### Option 1: Cloud Platform (Recommended)

1. **Deploy to Platform** (Render, Railway, etc.)
   - Connect GitHub repository
   - Set environment variables
   - Deploy with build command: `npm run build`
   - Start command: `npm start`

2. **Update MentraOS Console**
   - Set webhook URL to your deployed app
   - Test webhook connectivity

### Option 2: Self-Hosted

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Configure Reverse Proxy** (nginx, etc.)
   - SSL termination
   - Domain setup
   - Health checks

## 🔄 How It Works

### User Experience Flow

1. **App Installation**
   - User installs app from MentraOS
   - App appears in MentraOS app list

2. **First Launch**
   - User activates app on glasses
   - App shows authentication prompt with Spotify URL
   - OR user goes to Settings → App Settings → Spotify Controller

3. **Authentication**
   - User visits auth URL on phone/computer
   - Completes Spotify OAuth flow
   - Returns to MentraOS glasses

4. **Normal Usage**
   - App shows current track when music is playing
   - Voice commands control playback:
     - "Show Spotify" - Toggle overlay
     - "Next song" - Skip track
     - "Pause music" - Pause
     - "Play music" - Resume
     - etc.

### Technical Flow

1. **Session Start**
   - MentraOS calls `/webhook` when user activates app
   - `AppServer.onSession()` creates new user session
   - Services initialized (auth, API, settings, voice, overlay)

2. **Authentication Check**
   - App checks for stored Spotify tokens
   - Shows appropriate display (music or auth prompt)

3. **Real-time Updates**
   - Polls Spotify API every 5 seconds for track changes
   - Updates display and overlay accordingly
   - Settings changes processed immediately

4. **Session End**
   - `AppServer.onStop()` called when user deactivates
   - Cleanup handled automatically

## 📊 Monitoring

### Health Checks
- `GET /health` - App health status
- Monitor response time and uptime

### Logs
- App logs show session events
- Error handling with categorized errors
- Settings changes logged

### Analytics
- Track active sessions
- Monitor authentication success rates
- Voice command usage patterns

## 🐛 Troubleshooting

### App Won't Start
- ✅ Check all environment variables are set
- ✅ Verify MENTRAOS_API_KEY is correct
- ✅ Ensure port is available
- ✅ Check MentraOS console webhook URL

### Authentication Issues
- ✅ Verify Spotify client credentials
- ✅ Check redirect URI matches exactly
- ✅ Ensure HTTPS for production callbacks
- ✅ Test OAuth flow manually

### Settings Not Appearing
- ✅ Confirm settings configured in MentraOS console
- ✅ Check app package name matches exactly
- ✅ Verify app is deployed and responding
- ✅ Test settings endpoint manually

### Voice Commands Not Working
- ✅ Check microphone permissions granted
- ✅ Verify voice commands are registered
- ✅ Test with clear speech patterns
- ✅ Check app session is active

## 🔐 Security Notes

- Store API keys securely (environment variables)
- Use HTTPS for all production endpoints
- Validate all webhook requests
- Sanitize user inputs
- Regular security updates

## 📈 Scaling

- App supports multiple concurrent sessions
- File-based storage works for development
- Consider database for production scale
- Monitor resource usage and optimize

The app is now ready for deployment as a proper MentraOS application!