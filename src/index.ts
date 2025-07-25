import express from 'express';
import { AppConfig, SpotifyCurrentlyPlaying } from './types';
import { SpotifyAuthService } from './services/spotify-auth';
import { SpotifyApiService } from './services/spotify-api';
import { StorageService } from './services/storage';
import { VoiceCommandService } from './services/voice-commands';
import { SpotifyOverlay } from './ui/overlay';
import { ErrorHandler, ErrorType } from './utils/error-handler';

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
    this.overlay = new SpotifyOverlay();
    this.voiceService = new VoiceCommandService(this.apiService, this.overlay);
    this.errorHandler = ErrorHandler.getInstance();

    this.setupErrorHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Mentra Spotify Controller...');

      await this.overlay.initialize();
      await this.voiceService.initialize();

      const tokens = await this.storageService.getTokens();
      if (tokens) {
        console.log('Found existing tokens, starting polling...');
        this.startPolling();
      } else {
        console.log('No tokens found, user needs to authenticate');
        this.overlay.showError('Please authenticate with Spotify first');
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
      this.overlay.showError(error.message);
      this.stopPolling();
    });

    this.errorHandler.onError(ErrorType.NETWORK, (error) => {
      this.overlay.showError(error.message);
    });

    this.errorHandler.onError(ErrorType.API, (error) => {
      this.overlay.showError(error.message);
    });
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      return;
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const currentTrack = await this.errorHandler.retryOperation(
          () => this.apiService.getCurrentlyPlaying(),
          2,
          1000
        );

        if (currentTrack?.item) {
          this.overlay.updateTrack(currentTrack.item);
          this.voiceService.setCurrentTrackId(currentTrack.item.id);
        } else {
          this.overlay.updateTrack(null);
          this.voiceService.setCurrentTrackId(null);
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
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>✅ Authentication Successful!</h2>
              <p>You can now close this window and return to your smart glasses.</p>
              <p>Try saying "Show Spotify" to see your music!</p>
            </body>
          </html>
        `);
      } catch (error) {
        console.error('Authentication callback error:', error);
        res.status(500).send('Authentication failed. Please try again.');
      }
    });

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
      console.log(`Auth server running on http://localhost:${port}`);
      console.log(`Visit http://localhost:${port}/auth to authenticate with Spotify`);
    });

    return app;
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up Mentra Spotify Controller...');
    
    this.stopPolling();
    await this.voiceService.cleanup();
    
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