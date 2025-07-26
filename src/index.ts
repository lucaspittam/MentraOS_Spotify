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
    this.setupOAuthCallback();
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
      overlay.setSession(session); // Pass session to overlay
      
      const voiceService = new VoiceCommandService(this.apiService, overlay);
      voiceService.setSession(session); // Pass session to voice service
      
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

      // Start authentication state monitoring
      await this.startAuthStateMonitoring(session, overlay, voiceService);

      // Handle session lifecycle
      session.events.onButtonPress((button) => {
        console.log('🔘 Button pressed:', button);
        // Handle button interactions
      });

      session.events.onTranscription(async (data) => {
        console.log('🎤 Voice input:', data.text);
        const wasHandled = await voiceService.processVoiceInput(data.text);
        if (wasHandled) {
          console.log('✅ Voice command processed:', data.text);
        }
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
    const text = `🎵 Spotify Controller\n\nConnect your Spotify account:\n\nSettings → App Settings → Spotify Controller\n→ Account Connection → Connect Account\n\nYour music will appear here automatically\nonce connected.`;
    
    session.layouts.showTextWall(text);
  }

  private async showErrorDisplay(session: AppSession, message: string): Promise<void> {
    const text = `❌ Error\n\n${message}`;
    
    session.layouts.showTextWall(text);
  }

  private async startAuthStateMonitoring(
    session: AppSession, 
    overlay: SpotifyOverlay,
    voiceService: VoiceCommandService
  ): Promise<void> {
    let isAuthenticated = false;
    
    const checkAuthState = async () => {
      try {
        const tokens = await this.storageService.getTokens();
        const hasTokens = !!tokens;
        
        if (hasTokens && !isAuthenticated) {
          // Just became authenticated
          console.log('✅ User just authenticated with Spotify, starting music integration');
          isAuthenticated = true;
          await this.startMusicIntegration(session, overlay, voiceService);
        } else if (!hasTokens && isAuthenticated) {
          // Just lost authentication
          console.log('❌ User lost Spotify authentication');
          isAuthenticated = false;
          await this.showAuthenticationPrompt(session);
        } else if (!hasTokens && !isAuthenticated) {
          // Still not authenticated, show prompt
          await this.showAuthenticationPrompt(session);
        }
        // If hasTokens && isAuthenticated, continue normal operation
        
      } catch (error) {
        console.error('❌ Error checking authentication state:', error);
      }
    };
    
    // Initial check
    await checkAuthState();
    
    // Check every 3 seconds for auth state changes
    setInterval(checkAuthState, 3000);
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

  private setupOAuthCallback(): void {
    const app = this.getExpressApp();
    
    // Spotify auth redirect endpoint - user-friendly short URL
    app.get('/auth', (req, res) => {
      const authUrl = this.authService.getAuthUrl();
      console.log('🔗 Redirecting user to Spotify OAuth:', authUrl);
      res.redirect(authUrl);
    });
    
    // Spotify OAuth callback endpoint
    app.get('/callback', async (req, res) => {
      try {
        const { code, error, state } = req.query;
        
        if (error) {
          console.error('❌ Spotify OAuth error:', error);
          res.send(`
            <html>
              <body style="font-family: system-ui; text-align: center; margin-top: 50px;">
                <h2>❌ Authentication Failed</h2>
                <p>Error: ${error}</p>
                <p>Please return to your MentraOS glasses and try again.</p>
              </body>
            </html>
          `);
          return;
        }

        if (!code) {
          console.error('❌ No authorization code received');
          res.send(`
            <html>
              <body style="font-family: system-ui; text-align: center; margin-top: 50px;">
                <h2>❌ Authentication Failed</h2>
                <p>No authorization code received from Spotify.</p>
                <p>Please return to your MentraOS glasses and try again.</p>
              </body>
            </html>
          `);
          return;
        }

        console.log('🔐 Received Spotify authorization code, exchanging for tokens...');
        
        // Exchange code for tokens
        const tokens = await this.authService.exchangeCodeForTokens(code as string);
        
        // Store tokens
        await this.storageService.storeTokens(tokens);
        
        console.log('✅ Spotify authentication successful!');
        
        res.send(`
          <html>
            <body style="font-family: system-ui; text-align: center; margin-top: 50px;">
              <h2>✅ Spotify Connected Successfully!</h2>
              <p>You can now return to your MentraOS glasses.</p>
              <p>Say "Show Spotify" to see your music controls.</p>
              <script>
                // Auto-close after 3 seconds
                setTimeout(() => {
                  window.close();
                }, 3000);
              </script>
            </body>
          </html>
        `);
        
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.send(`
          <html>
            <body style="font-family: system-ui; text-align: center; margin-top: 50px;">
              <h2>❌ Authentication Error</h2>
              <p>Failed to complete Spotify authentication.</p>
              <p>Please return to your MentraOS glasses and try again.</p>
            </body>
          </html>
        `);
      }
    });

    console.log('🔗 OAuth callback endpoint set up at /callback');
  }
}

// Start the MentraOS app
const app = new SpotifyControllerApp();
app.start().catch(console.error);