# MentraOS Console Settings Configuration

This guide explains how to configure app settings in the MentraOS Developer Console at [console.mentra.glass/apps](https://console.mentra.glass/apps) so they appear in **Settings → App Settings** on MentraOS glasses.

## 🎯 Overview

The Spotify Controller needs these settings configured in the MentraOS console to appear in the Settings app on glasses:

## ⚙️ Settings to Configure

### 1. Connection Status (Read-Only Display)
```json
{
  "type": "text",
  "key": "spotify_connected", 
  "label": "Spotify Connection",
  "defaultValue": "Not Connected"
}
```

### 2. Show Album Art Toggle
```json
{
  "type": "toggle",
  "key": "show_album_art",
  "label": "Show Album Art",
  "defaultValue": true
}
```

### 3. Auto-Show Overlay Toggle  
```json
{
  "type": "toggle",
  "key": "auto_show_overlay",
  "label": "Auto-Show Music Overlay", 
  "defaultValue": true
}
```

### 4. Overlay Timeout Slider
```json
{
  "type": "slider",
  "key": "overlay_timeout",
  "label": "Overlay Timeout (seconds)",
  "defaultValue": 15,
  "min": 5,
  "max": 60
}
```

### 5. Voice Feedback Toggle
```json
{
  "type": "toggle", 
  "key": "voice_feedback",
  "label": "Voice Feedback",
  "defaultValue": true
}
```

### 6. Haptic Feedback Toggle
```json
{
  "type": "toggle",
  "key": "haptic_feedback", 
  "label": "Haptic Feedback",
  "defaultValue": true
}
```

### 7. Authentication Action (Optional)
```json
{
  "type": "select",
  "key": "auth_action",
  "label": "Spotify Account",
  "defaultValue": "none",
  "options": [
    {"label": "No Action", "value": "none"},
    {"label": "Connect Account", "value": "connect"},
    {"label": "Disconnect Account", "value": "disconnect"}
  ]
}
```

## 🔧 Console Configuration Steps

1. **Login** to [console.mentra.glass/apps](https://console.mentra.glass/apps)

2. **Find Your App** - Select "Spotify Controller" from your apps list

3. **Go to Settings Tab** - Click on the "Settings" or "App Settings" section

4. **Add Each Setting** - For each setting above:
   - Click "Add New Setting"
   - Fill in the JSON configuration
   - Set the type, key, label, and defaultValue
   - Add any additional properties (min/max for sliders, options for selects)
   - Save the setting

5. **Publish Changes** - Deploy the updated settings configuration

6. **Test on Device** - Install/update the app on MentraOS glasses and check Settings → App Settings

## 📱 User Experience

Once configured, users will see:

**Settings → App Settings → Spotify Controller**

- **Spotify Connection**: Shows "Connected" or "Not Connected" 
- **Show Album Art**: Toggle ON/OFF
- **Auto-Show Music Overlay**: Toggle ON/OFF  
- **Overlay Timeout**: Slider from 5-60 seconds
- **Voice Feedback**: Toggle ON/OFF
- **Haptic Feedback**: Toggle ON/OFF
- **Spotify Account**: Dropdown to Connect/Disconnect

## 🔄 How Settings Work

1. **User Changes Setting** in MentraOS Settings app
2. **App Receives Event** via `session.settings.onChange()`
3. **App Processes Change** in `MentraSettingsService.handleSettingsChange()`
4. **Behavior Updates** based on new setting value
5. **Status Reflects** in real-time (connection status, etc.)

## 🎤 Voice Commands Integration

Settings affect voice command behavior:

- **Voice Feedback ON** → Audio confirmations for commands
- **Haptic Feedback ON** → Vibration confirmations  
- **Auto-Show Overlay ON** → Overlay appears automatically with music
- **Show Album Art ON** → Album artwork displayed in overlay

## 🔍 Troubleshooting

### Settings Don't Appear
- ✅ Check settings are saved in MentraOS console
- ✅ Verify app is updated/redeployed after settings changes  
- ✅ Confirm app is properly installed on glasses
- ✅ Check app logs for initialization errors

### Settings Don't Update App Behavior
- ✅ Verify setting keys match exactly (case-sensitive)
- ✅ Check `MentraSettingsService.handleSettingsChange()` handles the setting
- ✅ Look for error logs in app console output
- ✅ Test with `session.settings.get()` to read current values

### Connection Status Not Updating
- ✅ Ensure `updateConnectionStatus()` is called after auth changes
- ✅ Check that settings service is initialized properly
- ✅ Verify storage service is working correctly

## 🚀 Testing Flow

1. **Configure Settings** in MentraOS console as shown above
2. **Deploy App** to MentraOS glasses  
3. **Open Settings** → App Settings → Spotify Controller
4. **Verify All Settings** appear with correct labels and default values
5. **Test Changes** - toggle settings and confirm app behavior updates
6. **Check Logs** - confirm app receives and processes setting changes

## 📝 Code Integration

The app uses these settings via:

```typescript
// Get setting values
const showAlbumArt = settingsService.shouldShowAlbumArt();
const overlayTimeout = settingsService.getOverlayTimeout();

// React to setting changes  
session.settings.onChange((changes) => {
  // Handle changes automatically
});
```

This creates a seamless integration where users can configure Spotify behavior directly through the standard MentraOS Settings interface.