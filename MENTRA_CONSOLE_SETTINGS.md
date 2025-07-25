# MentraOS Console Settings Configuration

Configure these settings in the MentraOS Developer Console at [console.mentra.glass/apps](https://console.mentra.glass/apps) for your Spotify Controller app.

## Required Settings

### 1. Connection Status (Read-Only Display)
```json
{
  "key": "spotify_connected",
  "type": "text",
  "title": "Spotify Connection",
  "description": "Shows whether Spotify account is connected",
  "defaultValue": "Not Connected",
  "readOnly": true
}
```

### 2. Connect/Disconnect Action (Primary Authentication)
```json
{
  "key": "auth_action",
  "type": "select",
  "title": "Account Connection",
  "description": "Connect or disconnect your Spotify account",
  "options": [
    {"value": "none", "label": "No Action"},
    {"value": "connect", "label": "Connect Account"},
    {"value": "disconnect", "label": "Disconnect Account"}
  ],
  "defaultValue": "none"
}
```

### 3. Album Art Display
```json
{
  "key": "show_album_art",
  "type": "toggle",
  "title": "Show Album Art",
  "description": "Display album artwork in music overlay",
  "defaultValue": false
}
```

### 4. Auto-Show Overlay
```json
{
  "key": "auto_show_overlay",
  "type": "toggle", 
  "title": "Auto-Show Music Overlay",
  "description": "Automatically show music overlay when song changes",
  "defaultValue": false
}
```

### 5. Overlay Display Duration
```json
{
  "key": "overlay_timeout",
  "type": "slider",
  "title": "Overlay Display Time",
  "description": "How long to show music overlay (seconds)",
  "min": 5,
  "max": 60,
  "step": 1,
  "defaultValue": 15
}
```

### 6. Voice Feedback
```json
{
  "key": "voice_feedback",
  "type": "toggle",
  "title": "Voice Confirmations", 
  "description": "Play audio confirmations for voice commands",
  "defaultValue": true
}
```

### 7. Haptic Feedback
```json
{
  "key": "haptic_feedback",
  "type": "toggle",
  "title": "Haptic Feedback",
  "description": "Vibration confirmations for voice commands", 
  "defaultValue": true
}
```

## How Authentication Works

### Primary Method: MentraOS Settings
1. User goes to **Settings → App Settings → Spotify Controller**
2. Sets **"Account Connection"** to **"Connect Account"**
3. App displays authentication URL on glasses display
4. User visits URL on phone and completes Spotify OAuth
5. **"Spotify Connection"** status updates to "Connected"

### Alternative Method: Voice Command
1. User says **"Connect"** while using the app
2. Same authentication flow as above

## Settings Behavior

- **spotify_connected**: Updates automatically based on token status
- **auth_action**: Triggers authentication when set to "connect"
- **show_album_art**: Controls album art display in overlay
- **auto_show_overlay**: Controls automatic overlay appearance
- **overlay_timeout**: Controls how long overlay stays visible
- **voice_feedback**: Enables/disables audio confirmations
- **haptic_feedback**: Enables/disables vibration confirmations

## Important Notes

- Settings are handled by `MentraSettingsService`
- Authentication URL: `https://mentraos-spotify-vhjh.onrender.com/auth`
- Callback URL: `https://mentraos-spotify-vhjh.onrender.com/callback`
- All settings changes are processed in real-time
- Connection status is automatically updated when tokens are stored/cleared