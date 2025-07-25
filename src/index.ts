import express from 'express';
import { AppConfig, SpotifyCurrentlyPlaying } from './types';
import { SpotifyAuthService } from './services/spotify-auth';
import { SpotifyApiService } from './services/spotify-api';
import { StorageService } from './services/storage';
import { VoiceCommandService } from './services/voice-commands';
import { SpotifyOverlay } from './ui/overlay';
import { ErrorHandler, ErrorType } from './utils/error-handler';
import { SettingsRouter } from './routes/settings';

class MentraSpotifyApp {
  private config: AppConfig;
  private authService: SpotifyAuthService;
  private apiService: SpotifyApiService;
  private storageService: StorageService;
  private voiceService: VoiceCommandService;
  private overlay: SpotifyOverlay;
  private errorHandler: ErrorHandler;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.config = {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
    };

    this.storageService = new StorageService();
    this.authService = new SpotifyAuthService(this.config, this.storageService);
    this.apiService = new SpotifyApiService(this.authService);
    this.errorHandler = ErrorHandler.getInstance();
    // Conditionally initialize UI components only in a browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.overlay = new SpotifyOverlay();
      this.voiceService = new VoiceCommandService(this.apiService, this.overlay);
    } else {
      // In a server environment, these services might not be needed or should be mocked
      this.overlay = null as any; // or a mock implementation
      this.voiceService = null as any; // or a mock implementation
    }

    this.setupErrorHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Mentra Spotify Controller...');

      if (this.overlay) {
        await this.overlay.initialize();
      }
      if (this.voiceService) {
        await this.voiceService.initialize();
      }

      const tokens = await this.storageService.getTokens();
      if (tokens) {
        console.log('Found existing tokens, starting polling...');
        this.startPolling();
      } else {
        console.log('No tokens found, user needs to authenticate');
        if (this.overlay) {
          this.overlay.showError('Please authenticate with Spotify first');
        }
      }

      this.isInitialized = true;
      console.log('Mentra Spotify Controller initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error, 'App initialization');
      throw error;
    }
  }

  private setupErrorHandlers(): void {
    this.errorHandler.onError(ErrorType.AUTHENTICATION, (error) => {
      if (this.overlay) {
        this.overlay.showError(error.message);
      }
      this.stopPolling();
    });

    this.errorHandler.onError(ErrorType.NETWORK, (error) => {
      if (this.overlay) {
        this.overlay.showError(error.message);
      }
    });

    this.errorHandler.onError(ErrorType.API, (error) => {
      if (this.overlay) {
        this.overlay.showError(error.message);
      }
    });
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      return;
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const currentTrack = await this.apiService.getCurrentlyPlaying();

        if (currentTrack?.item) {
          if (this.overlay) {
            this.overlay.updateTrack(currentTrack.item);
          }
          if (this.voiceService) {
            this.voiceService.setCurrentTrackId(currentTrack.item.id);
          }
        } else {
          if (this.overlay) {
            this.overlay.updateTrack(null);
          }
          if (this.voiceService) {
            this.voiceService.setCurrentTrackId(null);
          }
        }
      } catch (error) {
        this.errorHandler.handleError(error, 'Polling currently playing');
      }
    }, 5000);

    console.log('Started polling for currently playing track');
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped polling for currently playing track');
    }
  }

  async startAuthServer(): Promise<express.Application> {
    const app = express();
    const port = process.env.PORT || 3000;

    // Add middleware for parsing JSON and serving static files
    app.use(express.json());
    app.use(express.static('public'));

    // Add settings API routes
    const settingsRouter = new SettingsRouter();
    app.use('/api/spotify', settingsRouter.getRouter());

    // Main landing page with visual status
    app.get('/', async (req, res) => {
      try {
        const tokens = await this.storageService.getTokens();
        const isConnected = !!tokens;
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? req.get('host') ? `https://${req.get('host')}` : 'https://your-render-app.onrender.com'
          : `http://localhost:${port}`;

        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MentraOS Spotify Controller</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background: linear-gradient(135deg, #1db954 0%, #1aa34a 100%);
                  min-height: 100vh;
                  color: white;
                }
                .container {
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 20px;
                  padding: 40px;
                  color: #333;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 40px;
                }
                .logo {
                  font-size: 48px;
                  margin-bottom: 10px;
                }
                .status {
                  display: inline-block;
                  padding: 12px 24px;
                  border-radius: 25px;
                  font-weight: 600;
                  margin: 20px 0;
                }
                .connected {
                  background-color: #d4edda;
                  color: #155724;
                }
                .disconnected {
                  background-color: #f8d7da;
                  color: #721c24;
                }
                .auth-button {
                  background-color: #1db954;
                  color: white;
                  border: none;
                  border-radius: 25px;
                  padding: 15px 30px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
                  transition: background-color 0.2s;
                }
                .auth-button:hover {
                  background-color: #1aa34a;
                }
                .api-docs {
                  background: #f8f9fa;
                  border-radius: 12px;
                  padding: 25px;
                  margin-top: 30px;
                }
                .endpoint {
                  margin: 15px 0;
                  font-family: monospace;
                  background: white;
                  padding: 10px;
                  border-radius: 5px;
                  border-left: 4px solid #1db954;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🎵</div>
                  <h1>MentraOS Spotify Controller</h1>
                  <p>Hands-free Spotify control for smart glasses</p>
                  <div class="status ${isConnected ? 'connected' : 'disconnected'}">
                    ${isConnected ? '✅ Spotify Connected' : '❌ Not Connected'}
                  </div>
                </div>

                ${!isConnected ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="/auth" class="auth-button">Connect to Spotify</a>
                    <p style="margin-top: 15px; color: #666;">
                      Click above to authenticate with your Spotify account
                    </p>
                  </div>
                ` : `
                  <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #1db954; font-weight: 600; font-size: 18px;">
                      🎉 Ready to use! Try voice commands on your MentraOS glasses.
                    </p>
                  </div>
                `}

                <div class="api-docs">
                  <h3>🔧 API Endpoints</h3>
                  <div class="endpoint">GET ${baseUrl}/api/spotify/status</div>
                  <div class="endpoint">POST ${baseUrl}/api/spotify/disconnect</div>
                  <div class="endpoint">GET ${baseUrl}/api/spotify/current-track</div>
                  <div class="endpoint">GET ${baseUrl}/api/spotify/health</div>
                  
                  <h3 style="margin-top: 25px;">🎤 Voice Commands</h3>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>"Show Spotify" - Toggle music overlay</li>
                    <li>"Next song" / "Skip" - Skip to next track</li>
                    <li>"Pause music" - Pause playback</li>
                    <li>"Play music" - Resume playback</li>
                    <li>"Like this song" - Add to library</li>
                    <li>"Previous song" - Go to previous track</li>
                  </ul>
                </div>
              </div>
            </body>
          </html>
        `);
      } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Internal server error');
      }
    });

    app.get('/auth', (req, res) => {
      const authUrl = this.authService.getAuthUrl();
      res.redirect(authUrl);
    });

    app.get('/callback', async (req, res) => {
      try {
        const { code, error } = req.query;

        if (error || !code) {
          return res.status(400).send(`Authentication error: ${error || 'No code provided'}`);
        }

        const tokens = await this.authService.exchangeCodeForTokens(code as string);
        console.log('Successfully authenticated with Spotify');
        
        this.startPolling();
        
        res.send(`
          <html>
            <head>
              <title>Spotify Connected - MentraOS</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  text-align: center;
                  padding: 50px;
                  background: linear-gradient(135deg, #1db954 0%, #1aa34a 100%);
                  color: white;
                  min-height: 100vh;
                  margin: 0;
                }
                .success-container {
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 20px;
                  padding: 40px;
                  color: #333;
                  max-width: 500px;
                  margin: 0 auto;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .success-icon {
                  font-size: 64px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="success-container">
                <div class="success-icon">✅</div>
                <h2>Authentication Successful!</h2>
                <p>Your MentraOS glasses are now connected to Spotify.</p>
                <p><strong>You can close this window and return to your smart glasses.</strong></p>
                <p style="margin-top: 30px; color: #1db954;">
                  Try saying <em>"Show Spotify"</em> to see your music!
                </p>
              </div>
            </body>
          </html>
        `);
      } catch (error) {
        console.error('Authentication callback error:', error);
        res.status(500).send('Authentication failed. Please try again.');
      }
    });

    // Legacy status endpoint (keeping for backward compatibility)
    app.get('/status', async (req, res) => {
      try {
        const tokens = await this.storageService.getTokens();
        const hasAuth = !!tokens;
        const currentTrack = hasAuth ? await this.apiService.getCurrentlyPlaying() : null;
        
        res.json({
          authenticated: hasAuth,
          currentTrack: currentTrack?.item || null,
          isPlaying: currentTrack?.is_playing || false
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
      }
    });

    app.listen(port, () => {
      console.log(`🚀 MentraOS Spotify Controller running on port ${port}`);
      console.log(`📱 Settings API available at: http://localhost:${port}/api/spotify/`);
      console.log(`🔗 Visit http://localhost:${port}/ for setup and status`);
    });

    return app;
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up Mentra Spotify Controller...');
    
    this.stopPolling();
    if (this.voiceService) {
      await this.voiceService.cleanup();
    }
    
    console.log('Cleanup completed');
  }
}

async function main() {
  const app = new MentraSpotifyApp();
  
  try {
    await app.initialize();
    await app.startAuthServer();
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await app.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await app.cleanup();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

export { MentraSpotifyApp };