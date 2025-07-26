"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentraSettingsService = void 0;
class MentraSettingsService {
    constructor(session, spotifyApi, storage, auth) {
        this.isInitialized = false;
        this.session = session;
        this.spotifyApi = spotifyApi;
        this.storage = storage;
        this.auth = auth;
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            console.log('🔧 Initializing MentraOS Settings Service...');
            // Listen for settings changes from MentraOS Settings app
            this.session.settings.onChange((changes) => {
                console.log('📱 Settings changed from MentraOS Settings app:', changes);
                this.handleSettingsChange(changes);
            });
            // Apply current settings on startup
            await this.applyCurrentSettings();
            this.isInitialized = true;
            console.log('✅ MentraOS Settings Service initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize MentraOS Settings Service:', error);
            throw error;
        }
    }
    async handleSettingsChange(changes) {
        for (const [key, change] of Object.entries(changes)) {
            const { newValue, oldValue } = change;
            try {
                console.log(`⚙️ Setting '${key}' changed: ${oldValue} → ${newValue}`);
                switch (key) {
                    case 'spotify_connected':
                        // This is a read-only setting that shows connection status
                        // No action needed - it's updated by our service
                        break;
                    case 'show_album_art':
                        console.log(`🎨 Album art display: ${newValue ? 'enabled' : 'disabled'}`);
                        // This setting affects overlay display
                        break;
                    case 'auto_show_overlay':
                        console.log(`📱 Auto-show overlay: ${newValue ? 'enabled' : 'disabled'}`);
                        // This affects when overlay appears automatically
                        break;
                    case 'overlay_timeout':
                        console.log(`⏱️ Overlay timeout set to: ${newValue} seconds`);
                        // This affects how long overlay stays visible
                        break;
                    case 'voice_feedback':
                        console.log(`🔊 Voice feedback: ${newValue ? 'enabled' : 'disabled'}`);
                        // This affects audio confirmations for voice commands
                        break;
                    case 'haptic_feedback':
                        console.log(`📳 Haptic feedback: ${newValue ? 'enabled' : 'disabled'}`);
                        // This affects vibration confirmations for voice commands
                        break;
                    case 'auth_action':
                        if (newValue === 'connect') {
                            await this.handleConnectSpotify();
                        }
                        else if (newValue === 'disconnect') {
                            await this.handleDisconnectSpotify();
                        }
                        break;
                    default:
                        console.log(`🤷 Unknown setting changed: ${key} = ${newValue}`);
                }
            }
            catch (error) {
                console.error(`❌ Error handling setting change for ${key}:`, error);
            }
        }
    }
    async applyCurrentSettings() {
        try {
            // Read current settings and apply them
            const showAlbumArt = this.getSetting('show_album_art', true);
            const autoShowOverlay = this.getSetting('auto_show_overlay', true);
            const overlayTimeout = this.getSetting('overlay_timeout', 15);
            const voiceFeedback = this.getSetting('voice_feedback', true);
            const hapticFeedback = this.getSetting('haptic_feedback', true);
            console.log('📋 Current settings applied:');
            console.log(`  🎨 Show album art: ${showAlbumArt}`);
            console.log(`  📱 Auto-show overlay: ${autoShowOverlay}`);
            console.log(`  ⏱️ Overlay timeout: ${overlayTimeout}s`);
            console.log(`  🔊 Voice feedback: ${voiceFeedback}`);
            console.log(`  📳 Haptic feedback: ${hapticFeedback}`);
            // Update connection status display
            await this.updateConnectionStatus();
        }
        catch (error) {
            console.error('❌ Error applying current settings:', error);
        }
    }
    async handleConnectSpotify() {
        try {
            console.log('🔗 Handling Spotify connect request...');
            // Check if already connected
            const tokens = await this.storage.getTokens();
            if (tokens) {
                console.log('✅ Already connected to Spotify');
                return;
            }
            // Generate shorter auth URL for user
            const shortUrl = 'https://mentraos-spotify-vhjh.onrender.com/auth';
            // Display the auth URL on the glasses for the user
            const text = `🔗 Spotify Authentication\n\n📱 On your phone, visit:\n${shortUrl}\n\nThis will redirect to Spotify login\nand connect your account automatically.`;
            this.session.layouts.showTextWall(text);
            console.log('📍 Auth URL displayed to user:', shortUrl);
        }
        catch (error) {
            console.error('❌ Error handling Spotify connect:', error);
            // Show error to user
            const errorText = `❌ Connection Error\n\nFailed to initiate Spotify connection.\nPlease try again.`;
            this.session.layouts.showTextWall(errorText);
        }
    }
    async handleDisconnectSpotify() {
        try {
            console.log('❌ Handling Spotify disconnect request...');
            await this.storage.clearTokens();
            await this.updateConnectionStatus();
            console.log('✅ Successfully disconnected from Spotify');
        }
        catch (error) {
            console.error('❌ Error handling Spotify disconnect:', error);
        }
    }
    async updateConnectionStatus() {
        try {
            const tokens = await this.storage.getTokens();
            const isConnected = !!tokens;
            console.log(`🔍 Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
            // The connection status would be reflected in the MentraOS Settings app
            // The 'spotify_connected' setting would show this status
        }
        catch (error) {
            console.error('❌ Error updating connection status:', error);
        }
    }
    // Get current setting value with type safety and default
    getSetting(key, defaultValue) {
        try {
            return this.session.settings.get(key, defaultValue);
        }
        catch (error) {
            console.error(`❌ Error getting setting ${key}:`, error);
            return defaultValue;
        }
    }
    // Check if a feature is enabled
    isFeatureEnabled(key) {
        return this.getSetting(key, false);
    }
    // Get numeric setting value
    getNumericSetting(key, defaultValue = 0) {
        return this.getSetting(key, defaultValue);
    }
    // Get string setting value
    getStringSetting(key, defaultValue = '') {
        return this.getSetting(key, defaultValue);
    }
    // Check if Spotify features should be enabled based on settings
    shouldShowAlbumArt() {
        return this.isFeatureEnabled('show_album_art');
    }
    shouldAutoShowOverlay() {
        return this.isFeatureEnabled('auto_show_overlay');
    }
    getOverlayTimeout() {
        return this.getNumericSetting('overlay_timeout', 15);
    }
    shouldProvideVoiceFeedback() {
        return this.isFeatureEnabled('voice_feedback');
    }
    shouldProvideHapticFeedback() {
        return this.isFeatureEnabled('haptic_feedback');
    }
    // Start periodic status updates
    startPeriodicUpdates() {
        // Update connection status every 30 seconds
        setInterval(async () => {
            await this.updateConnectionStatus();
        }, 30000);
    }
    async cleanup() {
        this.isInitialized = false;
        console.log('🧹 MentraOS Settings Service cleaned up');
    }
}
exports.MentraSettingsService = MentraSettingsService;
//# sourceMappingURL=mentra-settings.js.map