# MentraOS Settings Integration

This document explains how the Spotify Controller integrates with the MentraOS Settings system.

## 🏗️ Architecture

The app integrates with MentraOS Settings through:

1. **MentraOS Developer Console** - Settings configured at [console.mentra.glass/apps](https://console.mentra.glass/apps)
2. **`MentraSettingsService`** - Handles settings changes and updates  
3. **`AppSession`** - Connects to MentraOS SDK for settings management

## 📱 Settings Location

Settings appear in: **MentraOS Settings → App Settings → Spotify Controller**

## ⚙️ Settings Available

Configure these settings in the MentraOS Developer Console:

### Connection
- **Spotify Connection** - Shows connection status (read-only display)
- **Spotify Account** - Dropdown to Connect/Disconnect account

### Display  
- **Show Album Art** - Toggle to display album artwork in overlay
- **Auto-Show Music Overlay** - Toggle to automatically show overlay with music
- **Overlay Timeout** - Slider for how long overlay stays visible (5-60 seconds)

### Feedback
- **Voice Feedback** - Toggle for audio confirmation sounds
- **Haptic Feedback** - Toggle for vibration confirmations

See `MENTRA_CONSOLE_SETTINGS.md` for detailed configuration instructions.

## 🚀 How It Works

1. **Settings Configuration**: 
   - Settings defined in MentraOS Developer Console
   - Settings appear in MentraOS Settings → App Settings → Spotify Controller
   - `AppSession` connects to MentraOS SDK

2. **Settings Changes**:
   - User modifies settings in MentraOS Settings app
   - `session.settings.onChange()` fires in app
   - `MentraSettingsService.handleSettingsChange()` processes changes
   - App behavior updates based on new values

3. **Real-time Updates**:
   - Connection status updates when auth changes
   - Settings values applied immediately  
   - Voice/haptic feedback controlled by user preferences

## 🔧 Environment Variables

Set these in your MentraOS environment:

```bash
# Spotify OAuth (existing)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=your_callback_url

# MentraOS Integration (new)
MENTRA_PACKAGE_NAME=com.yourname.spotify-controller
MENTRA_API_KEY=your_mentra_api_key
MENTRA_USER_ID=your_mentra_user_id
```

## 🎯 User Experience

1. **Install** the app on MentraOS glasses
2. **Open Settings** → Find "Spotify Controller" 
3. **Connect Account** - Follow auth instructions shown in settings
4. **Configure Preferences** - Toggle features on/off
5. **Use Voice Commands** - Control playback hands-free

## 🔄 Settings Behavior

- **Connect to Spotify**: Shows auth URL when not connected
- **Disconnect**: Only enabled when connected
- **Current Track**: Updates automatically during playback  
- **Status Indicators**: Real-time connection and playback state
- **Voice Commands**: Always available list for reference

## 🎤 Voice Commands

Available after authentication:
- "Show Spotify" - Toggle music overlay
- "Next song" / "Skip" - Skip to next track  
- "Pause music" - Pause playback
- "Play music" - Resume playback
- "Like this song" - Add current track to library
- "Previous song" - Go to previous track

## 🧪 Testing

When developing:
1. Build the app: `npm run build`
2. Deploy to MentraOS 
3. Check Settings app for "Spotify Controller"
4. Verify all settings groups appear correctly
5. Test authentication flow through settings
6. Confirm voice commands work after connection

## 📝 Notes

- Settings are managed by MentraOS system
- App responds to settings changes via event handlers  
- Real-time updates keep status info current
- Web interface removed - all interaction through MentraOS
- Fallback handling for development without MentraOS connection