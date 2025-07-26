# MentraOS Console Setup Guide

## App Registration

### 1. Create App in MentraOS Console
Visit [console.mentra.glass/apps](https://console.mentra.glass/apps) and create a new app with these settings:

**Basic Information:**
- **App Name**: `Basic MentraOS App`
- **Package Name**: `com.yourname.basic-app` (must match .env PACKAGE_NAME)
- **Description**: `Basic MentraOS app with voice commands and text display`
- **Version**: `1.0.0`

### 2. App Configuration
**Permissions:**
- ☑️ **Microphone** - Required for voice command processing

**Webhook URL:**
- **Development**: `https://your-ngrok-url.ngrok.io`
- **Production**: `https://your-render-app.onrender.com`

**App Instructions:**
```
Say 'Show Media' or 'Hide Media' to test voice commands.
```

### 3. Environment Variables
Create `.env` file with these values (get API key from console):

```bash
# MentraOS Configuration  
PACKAGE_NAME=com.yourname.basic-app
MENTRAOS_API_KEY=your_api_key_from_console
PORT=3000
```

### 4. App Configuration Import
Import the complete app configuration using the `app_config.json` file:

1. **Go to Console Settings** → **Configuration Management**
2. **Import Configuration** → Upload `app_config.json`
3. **Verify Settings** - Check that all settings imported correctly:
   - Show Overlay on App Start (toggle)
   - Display Mode (select: minimal/standard/detailed)  
   - Custom Welcome Message (text)

**Or Configure Manually:**
If importing doesn't work, add these settings manually in the Console Settings section:

```json
{
  "key": "show_overlay_on_start",
  "label": "Show Overlay on App Start", 
  "type": "toggle",
  "defaultValue": false
},
{
  "key": "display_mode",
  "label": "Display Mode",
  "type": "select", 
  "defaultValue": "standard",
  "options": [
    {"label": "Minimal", "value": "minimal"},
    {"label": "Standard", "value": "standard"},
    {"label": "Detailed", "value": "detailed"}
  ]
},
{
  "key": "custom_message",
  "label": "Custom Welcome Message",
  "type": "text",
  "defaultValue": "Say 'Show Media' to show overlay"
}
```

### 5. Deployment Steps
1. **Local Development:**
   - Set up ngrok: `ngrok http 3000`
   - Update webhook URL in console with ngrok URL
   - Run: `npm run dev`

2. **Production (Render):**
   - Deploy to Render
   - Update webhook URL in console with Render URL
   - Set environment variables in Render dashboard

### 6. Testing
1. Install app on MentraOS glasses from console
2. Activate app on glasses
3. Say "Show Media" - should display overlay
4. Say "Hide Media" - should hide overlay
5. Check logs in console for voice input processing

## Important Notes
- **Package Name** must match exactly between .env and console
- **API Key** is unique per app and must be kept secure
- **Webhook URL** must be accessible from MentraOS servers
- **Permissions** must be declared in console, not in code