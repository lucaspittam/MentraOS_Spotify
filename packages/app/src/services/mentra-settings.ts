import { AppSession } from '@mentra/sdk';
import { SpotifyApiService } from './spotify-api';
import { StorageService } from './storage';
import { SpotifyAuthService } from './spotify-auth';

export class MentraSettingsService {
  private session: AppSession;
  private spotifyApi: SpotifyApiService;
  private storage: StorageService;
  private auth: SpotifyAuthService;
  private isInitialized = false;

  constructor(
    session: AppSession,
    spotifyApi: SpotifyApiService,
    storage: StorageService,
    auth: SpotifyAuthService
  ) {
    this.session = session;
    this.spotifyApi = spotifyApi;
    this.storage = storage;
    this.auth = auth;
  }

  async initialize(): Promise<void> {
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
    } catch (error) {
      console.error('❌ Failed to initialize MentraOS Settings Service:', error);
      throw error;
    }
  }

  private async handleSettingsChange(changes: Record<string, any>): Promise<void> {
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
            } else if (newValue === 'disconnect') {
              await this.handleDisconnectSpotify();
            }
            break;

          default:
            console.log(`🤷 Unknown setting changed: ${key} = ${newValue}`);
        }
      } catch (error) {
        console.error(`❌ Error handling setting change for ${key}:`, error);
      }
    }
  }

  private async applyCurrentSettings(): Promise<void> {
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

    } catch (error) {
      console.error('❌ Error applying current settings:', error);
    }
  }

  private async handleConnectSpotify(): Promise<void> {
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
      
    } catch (error) {
      console.error('❌ Error handling Spotify connect:', error);
      
      // Show error to user
      const errorText = `❌ Connection Error\n\nFailed to initiate Spotify connection.\nPlease try again.`;
      this.session.layouts.showTextWall(errorText);
    }
  }

  private async handleDisconnectSpotify(): Promise<void> {
    try {
      console.log('❌ Handling Spotify disconnect request...');
      
      await this.storage.clearTokens();
      await this.updateConnectionStatus();
      
      console.log('✅ Successfully disconnected from Spotify');
      
    } catch (error) {
      console.error('❌ Error handling Spotify disconnect:', error);
    }
  }

  async updateConnectionStatus(): Promise<void> {
    try {
      const tokens = await this.storage.getTokens();
      const isConnected = !!tokens;
      
      console.log(`🔍 Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
      
      // The connection status would be reflected in the MentraOS Settings app
      // The 'spotify_connected' setting would show this status
      
    } catch (error) {
      console.error('❌ Error updating connection status:', error);
    }
  }

  // Get current setting value with type safety and default
  getSetting<T>(key: string, defaultValue?: T): T {
    try {
      return this.session.settings.get<T>(key, defaultValue);
    } catch (error) {
      console.error(`❌ Error getting setting ${key}:`, error);
      return defaultValue as T;
    }
  }

  // Check if a feature is enabled
  isFeatureEnabled(key: string): boolean {
    return this.getSetting(key, false);
  }

  // Get numeric setting value
  getNumericSetting(key: string, defaultValue: number = 0): number {
    return this.getSetting(key, defaultValue);
  }

  // Get string setting value
  getStringSetting(key: string, defaultValue: string = ''): string {
    return this.getSetting(key, defaultValue);
  }

  // Check if Spotify features should be enabled based on settings
  shouldShowAlbumArt(): boolean {
    return this.isFeatureEnabled('show_album_art');
  }

  shouldAutoShowOverlay(): boolean {
    return this.isFeatureEnabled('auto_show_overlay');
  }

  getOverlayTimeout(): number {
    return this.getNumericSetting('overlay_timeout', 15);
  }

  shouldProvideVoiceFeedback(): boolean {
    return this.isFeatureEnabled('voice_feedback');
  }

  shouldProvideHapticFeedback(): boolean {
    return this.isFeatureEnabled('haptic_feedback');
  }

  // Start periodic status updates
  startPeriodicUpdates(): void {
    // Update connection status every 30 seconds
    setInterval(async () => {
      await this.updateConnectionStatus();
    }, 30000);
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
    console.log('🧹 MentraOS Settings Service cleaned up');
  }
}