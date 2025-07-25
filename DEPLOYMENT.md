# MentraOS Spotify Controller - Testing & Deployment Guide

## Prerequisites

Before you start, make sure you have:
- **Node.js v18+** installed
- **MentraOS smart glasses** (or access to one)
- **Spotify Premium account**
- **MentraOS phone app** installed and paired with glasses

## Step 1: Initial Setup

### 1.1 Install Dependencies
```bash
cd MentraOS_Spotify
npm install
```

### 1.2 Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values (see sections below)
nano .env
```

## Step 2: Get Required API Keys

### 2.1 MentraOS Setup
1. Go to [MentraOS Developer Console](https://console.mentra.glass)
2. Create account or sign in
3. Create a new app:
   - **App Name**: Spotify Controller
   - **Package Name**: `com.yourname.spotify-controller` (replace "yourname" with your actual name)
   - **Description**: Control Spotify hands-free on smart glasses
4. Copy your **API Key** from the console
5. Update your `.env` file:
   ```bash
   MENTRAOS_API_KEY=your_actual_api_key_here
   PACKAGE_NAME=com.yourname.spotify-controller
   ```

### 2.2 Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create account or sign in
3. Click **"Create App"**:
   - **App Name**: Mentra Spotify Controller
   - **App Description**: Smart glasses Spotify controller
   - **Website**: http://localhost:3000 (for now)
   - **Redirect URI**: `http://localhost:3000/callback`
   - **API/SDKs**: Web API
4. Save the app
5. Go to **Settings** and copy:
   - **Client ID**
   - **Client Secret**
6. Update your `.env` file:
   ```bash
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

## Step 3: Local Development & Testing

### 3.1 Install ngrok (for OAuth callbacks)
```bash
# Install ngrok globally
npm install -g ngrok

# Or use homebrew on Mac
brew install ngrok
```

### 3.2 Start Development Server
```bash
# Terminal 1: Start your app
npm run dev
```

```bash
# Terminal 2: Start ngrok tunnel
ngrok http 3000
```

### 3.3 Update Spotify Redirect URI
1. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Go back to Spotify Developer Dashboard → Your App → Settings
3. Update **Redirect URI** to: `https://abc123.ngrok.io/callback`
4. Update your `.env` file:
   ```bash
   SPOTIFY_REDIRECT_URI=https://abc123.ngrok.io/callback
   ```
5. Restart your development server

### 3.4 Test Authentication
1. Open browser to: `https://abc123.ngrok.io/auth`
2. Login to Spotify and authorize the app
3. You should see "Authentication Successful!" message
4. Check your app logs - should show "Successfully authenticated with Spotify"

### 3.5 Test API Endpoints
```bash
# Check app status
curl https://abc123.ngrok.io/status

# Should return JSON with authentication status and current track
```

## Step 4: Install on MentraOS Glasses

### 4.1 Register App in MentraOS Console
1. Go to [MentraOS Developer Console](https://console.mentra.glass)
2. Find your app and update:
   - **Production URL**: Your ngrok URL (e.g., `https://abc123.ngrok.io`)
   - **Status**: Set to "Active"

### 4.2 Install on Glasses via Phone App
1. Open **MentraOS phone app**
2. Make sure glasses are connected
3. Go to **"Apps"** or **"Developer"** section
4. Find your **"Spotify Controller"** app
5. Tap **"Install"**
6. Wait for installation to complete

### 4.3 Test Voice Commands
With glasses on and app installed:

1. **"Show Spotify"** - Should show/hide music overlay
2. Start playing music on Spotify (any device)
3. **"Next song"** - Should skip to next track
4. **"Pause music"** - Should pause playback
5. **"Play music"** - Should resume playback
6. **"Like this song"** - Should add track to your library

## Step 5: Production Deployment

### 5.1 Choose Hosting Platform
Options recommended by MentraOS:
- **Railway** (easiest)
- **Ubuntu server**
- **Heroku**
- **DigitalOcean**

### 5.2 Deploy to Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables in Railway dashboard:
   ```
   MENTRAOS_API_KEY=your_api_key
   PACKAGE_NAME=com.yourname.spotify-controller
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=https://your-app.railway.app/callback
   PORT=3000
   ```
6. Deploy and copy your production URL

### 5.3 Update Spotify App Settings
1. Go to Spotify Developer Dashboard
2. Update **Redirect URI** to: `https://your-app.railway.app/callback`

### 5.4 Update MentraOS Console
1. Go to MentraOS Developer Console
2. Update your app's **Production URL** to: `https://your-app.railway.app`

## Step 6: Final Testing

### 6.1 Test Production Authentication
1. Visit: `https://your-app.railway.app/auth`
2. Complete Spotify OAuth flow
3. Verify authentication works

### 6.2 Test on Glasses
1. Restart MentraOS app on phone
2. Test all voice commands
3. Verify overlay shows current track info
4. Test playback controls

## Troubleshooting

### Common Issues

**"No tokens found"**
- Complete Spotify OAuth flow first
- Check redirect URI matches exactly
- Verify ngrok tunnel is active

**"Authentication failed"**
- Check Spotify client ID/secret are correct
- Verify redirect URI in Spotify dashboard
- Check ngrok URL hasn't changed

**"No active device"**
- Start playing music on any Spotify device
- App requires active playback session

**Voice commands not working**
- Check app is installed on glasses
- Verify MentraOS phone app is connected
- Try restarting the app

**"Network error"**
- Check internet connection
- Verify production server is running
- Check MentraOS API key is valid

### Debug Commands
```bash
# Check app status
curl https://your-app-url/status

# Check logs (Railway)
railway logs

# Check local logs
npm run dev  # Look for error messages
```

### Getting Help
- [MentraOS Discord](https://discord.gg/mentraos)
- [MentraOS Documentation](https://docs.mentra.glass)
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)

## Summary

You now have a fully functional MentraOS Spotify controller! Users can:
- Install your app from MentraOS store
- Authenticate with their own Spotify Premium account
- Control Spotify hands-free using voice commands
- See current track info in AR overlay

The app scales to unlimited users since each person uses their own Spotify account and authentication.