# Deploy to Render - Quick Setup Guide

Your MentraOS Spotify Controller is now configured for Render deployment at: **https://mentraos-spotify.onrender.com**

## Step 1: Get Your API Keys

### MentraOS API Key
1. Go to [MentraOS Developer Console](https://console.mentra.glass)
2. Create/login to your account
3. Create new app:
   - **App Name**: Spotify Controller
   - **Package Name**: `com.yourname.spotify-controller`
   - **Production URL**: `https://mentraos-spotify.onrender.com`
4. Copy your **API Key**

### Spotify API Keys
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app:
   - **App Name**: MentraOS Spotify Controller
   - **Redirect URI**: `https://mentraos-spotify.onrender.com/callback`
3. Copy **Client ID** and **Client Secret**

## Step 2: Deploy to Render

### Option A: Deploy from GitHub (Recommended)
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `MentraOS_Spotify`
4. Render will auto-detect the `render.yaml` configuration
5. Add environment variables:
   ```
   MENTRAOS_API_KEY=your_mentraos_api_key_here
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```
6. Click **"Deploy Web Service"**

### Option B: Manual Deployment
1. Push your code to GitHub
2. In Render dashboard:
   - **Name**: mentraos-spotify
   - **Environment**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
3. Add the same environment variables as above

## Step 3: Verify Deployment

### Test Authentication
1. Visit: https://mentraos-spotify.onrender.com/auth
2. Complete Spotify login
3. Should see "Authentication Successful!" message

### Test Status Endpoint
```bash
curl https://mentraos-spotify.onrender.com/status
```
Should return JSON with app status.

## Step 4: Install on MentraOS Glasses

1. **Update MentraOS Console**:
   - Set Production URL to: `https://mentraos-spotify.onrender.com`
   - Mark app as "Active"

2. **Install via MentraOS Phone App**:
   - Open MentraOS app
   - Go to Apps/Developer section
   - Install "Spotify Controller"

3. **Test Voice Commands**:
   - "Show Spotify" - Toggle overlay
   - "Next song" - Skip track
   - "Pause music" - Pause playback

## Render Configuration Details

The `render.yaml` file automatically configures:
- ✅ **Node.js environment**
- ✅ **Free tier hosting**
- ✅ **Auto-deploy on git push**
- ✅ **Health check endpoint** (`/status`)
- ✅ **Environment variables**
- ✅ **Build and start commands**

## Environment Variables Required

Set these in your Render dashboard:

| Variable | Value | Where to Get |
|----------|--------|--------------|
| `MENTRAOS_API_KEY` | Your API key | MentraOS Console |
| `SPOTIFY_CLIENT_ID` | Your client ID | Spotify Dashboard |
| `SPOTIFY_CLIENT_SECRET` | Your client secret | Spotify Dashboard |

The following are pre-configured:
- `PACKAGE_NAME`: com.yourname.spotify-controller
- `SPOTIFY_REDIRECT_URI`: https://mentraos-spotify.onrender.com/callback
- `PORT`: 10000 (Render standard)

## Troubleshooting

**Deployment fails?**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Make sure your GitHub repo is up to date

**Authentication not working?**
- Verify Spotify redirect URI matches exactly
- Check Spotify app is not in "Development Mode"
- Confirm MentraOS API key is valid

**Voice commands not responding?**
- Restart MentraOS phone app
- Check app installation on glasses
- Verify production URL in MentraOS console

## Free Tier Limitations

Render free tier includes:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Auto-sleep after 15min inactivity
- ✅ Custom domain support
- ⚠️ Cold starts (2-3 second delay after sleep)

For production with many users, consider upgrading to paid tier for zero cold starts.

## Next Steps

1. **Deploy**: Push to GitHub and deploy via Render
2. **Test**: Verify authentication and API endpoints
3. **Install**: Add to your MentraOS glasses
4. **Share**: Your app is ready for other users!

Each user will authenticate with their own Spotify Premium account, so your app scales automatically. 🎉