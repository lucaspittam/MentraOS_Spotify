import { AppServer, AppSession } from '@mentra/sdk';
import { SpotifyAuthService } from './services/spotify-auth';
import { SpotifyApiService } from './services/spotify-api';
import { StorageService } from './services/storage';
import { VoiceCommandService } from './services/voice-commands';
import { SpotifyOverlay } from './ui/overlay';
import { ErrorHandler, ErrorType } from './utils/error-handler';
import { MentraSettingsService } from './services/mentra-settings';
import { AppConfig } from './types';

class SpotifyControllerApp extends AppServer {
  private spotifyConfig: AppConfig;
  private authService: SpotifyAuthService;
  private apiService: SpotifyApiService;
  private storageService: StorageService;
  private errorHandler: ErrorHandler;

  constructor() {
    super({
      packageName: process.env.PACKAGE_NAME || 'com.yourname.spotify-controller',
      apiKey: process.env.MENTRAOS_API_KEY || '',
      port: parseInt(process.env.PORT || '3000'),
      appInstructions: 'Say "Show Spotify" to see music controls, or go to Settings to connect your Spotify account.'
    });
    
    this.spotifyConfig = {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
    };

    this.storageService = new StorageService();
    this.authService = new SpotifyAuthService(this.spotifyConfig, this.storageService);
    this.apiService = new SpotifyApiService(this.authService);
    this.errorHandler = ErrorHandler.getInstance();

    this.setupErrorHandlers();
  }

  /**
   * Called when a user session starts on MentraOS glasses
   * This is where the main app logic lives
   */
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    console.log('🚀 Spotify Controller session started for user:', session.userId);

    try {
      // Initialize services for this session
      const overlay = new SpotifyOverlay();
      const voiceService = new VoiceCommandService(this.apiService, overlay);
      const settingsService = new MentraSettingsService(
        session,
        this.apiService,
        this.storageService,
        this.authService
      );

      // Initialize all services
      await overlay.initialize();
      await voiceService.initialize();
      await settingsService.initialize();

      // Start periodic updates
      settingsService.startPeriodicUpdates();

      // Check if user is authenticated with Spotify
      const tokens = await this.storageService.getTokens();
      if (tokens) {
        console.log('✅ User has Spotify tokens, starting music integration');
        await this.startMusicIntegration(session, overlay, voiceService);
      } else {
        console.log('❌ User needs to authenticate with Spotify');
        await this.showAuthenticationPrompt(session);
      }

      // Handle session lifecycle
      session.events.onButtonPress((button) => {
        console.log('🔘 Button pressed:', button);
        // Handle button interactions
      });

      session.events.onTranscription((data) => {
        console.log('🎤 Voice input:', data.text);
        // Voice commands are handled by VoiceCommandService
      });

      // Clean up when session ends (handled by AppServer automatically)

    } catch (error) {
      console.error('❌ Error in session handler:', error);
      await this.showErrorDisplay(session, 'Failed to initialize Spotify Controller');
    }
  }

  /**
   * Called when a user session is stopped
   */
  protected async onStop(sessionId: string, userId: string, reason: string): Promise<void> {
    console.log(`🛑 Session stopped for user ${userId}: ${reason}`);
    // Cleanup is handled automatically by AppServer
  }

  private async startMusicIntegration(
    session: AppSession, 
    overlay: SpotifyOverlay,
    voiceService: VoiceCommandService
  ): Promise<void> {
    try {
      // Get currently playing track
      const currentTrack = await this.apiService.getCurrentlyPlaying();
      
      if (currentTrack?.item) {
        // Show initial track info
        await this.showTrackInfo(session, currentTrack.item);
        
        // Start polling for track changes
        this.startTrackPolling(session, overlay);
      } else {
        await this.showNoMusicDisplay(session);
      }

    } catch (error) {
      console.error('❌ Error starting music integration:', error);
      await this.showErrorDisplay(session, 'Failed to connect to Spotify');
    }
  }

  private async showTrackInfo(session: AppSession, track: any): Promise<void> {
    const text = `🎵 Now Playing\n\n${track.name}\nby ${track.artists.map((a: any) => a.name).join(', ')}\n\nSay "Show Spotify" for overlay\nSay "Next song" to skip`;
    
    session.layouts.showTextWall(text);
  }

  private async showNoMusicDisplay(session: AppSession): Promise<void> {
    const text = '🎵 Spotify Controller\n\nNo music playing\n\nStart playing music on Spotify\nthen say "Show Spotify"\n\nVoice commands:\n• Next song\n• Pause music\n• Play music';
    
    session.layouts.showTextWall(text);
  }

  private async showAuthenticationPrompt(session: AppSession): Promise<void> {
    const authUrl = this.authService.getAuthUrl();
    const text = `🔗 Connect Spotify\n\nVisit this URL to authenticate:\n\n${authUrl}\n\nOr go to Settings → App Settings → Spotify Controller`;
    
    session.layouts.showTextWall(text);
  }

  private async showErrorDisplay(session: AppSession, message: string): Promise<void> {
    const text = `❌ Error\n\n${message}`;
    
    session.layouts.showTextWall(text);
  }

  private startTrackPolling(session: AppSession, overlay: SpotifyOverlay): void {
    setInterval(async () => {
      try {
        const currentTrack = await this.apiService.getCurrentlyPlaying();
        
        if (currentTrack?.item) {
          // Update overlay if visible
          if (overlay) {
            overlay.updateTrack(currentTrack.item);
          }
        }
      } catch (error) {
        console.error('❌ Error polling for track updates:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  private setupErrorHandlers(): void {
    this.errorHandler.onError(ErrorType.AUTHENTICATION, (error) => {
      console.error('🔐 Authentication error:', error);
    });

    this.errorHandler.onError(ErrorType.NETWORK, (error) => {
      console.error('🌐 Network error:', error);
    });

    this.errorHandler.onError(ErrorType.API, (error) => {
      console.error('📡 API error:', error);
    });
  }
}

// Start the MentraOS app
const app = new SpotifyControllerApp();
app.start().catch(console.error);