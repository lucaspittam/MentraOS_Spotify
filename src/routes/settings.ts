import express from 'express';
import { SpotifyAuthService } from '../services/spotify-auth';
import { StorageService } from '../services/storage';
import { AppConfig } from '../types';

export class SettingsRouter {
  private router: express.Router;
  private authService: SpotifyAuthService;
  private storageService: StorageService;

  constructor() {
    this.router = express.Router();
    this.storageService = new StorageService();
    
    const config: AppConfig = {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
    };
    
    this.authService = new SpotifyAuthService(config, this.storageService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // CORS middleware for settings API
    this.router.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Get Spotify connection status and auth URL
    this.router.get('/status', async (req, res) => {
      try {
        const tokens = await this.storageService.getTokens();
        const isConnected = !!tokens;
        
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://your-render-app.onrender.com'  // Replace with actual Render URL
          : `http://localhost:${process.env.PORT || 3000}`;

        res.json({
          connected: isConnected,
          authUrl: `${baseUrl}/auth`,
          message: isConnected 
            ? 'Spotify is connected and ready to use'
            : 'Click Connect to authenticate with Spotify'
        });
      } catch (error) {
        console.error('Error checking Spotify status:', error);
        res.status(500).json({
          error: 'Failed to check connection status',
          connected: false,
          authUrl: null,
          message: 'Unable to check Spotify connection'
        });
      }
    });

    // Disconnect from Spotify
    this.router.post('/disconnect', async (req, res) => {
      try {
        await this.storageService.clearTokens();
        res.json({
          success: true,
          message: 'Successfully disconnected from Spotify'
        });
      } catch (error) {
        console.error('Error disconnecting from Spotify:', error);
        res.status(500).json({
          error: 'Failed to disconnect from Spotify',
          success: false
        });
      }
    });

    // Get current playing track (for settings panel preview)
    this.router.get('/current-track', async (req, res) => {
      try {
        const tokens = await this.storageService.getTokens();
        if (!tokens) {
          return res.status(401).json({
            error: 'Not authenticated with Spotify',
            track: null
          });
        }

        // Import SpotifyApiService here to avoid circular dependencies
        const { SpotifyApiService } = await import('../services/spotify-api');
        const apiService = new SpotifyApiService(this.authService);
        
        const currentTrack = await apiService.getCurrentlyPlaying();
        
        res.json({
          track: currentTrack?.item || null,
          isPlaying: currentTrack?.is_playing || false
        });
      } catch (error) {
        console.error('Error getting current track:', error);
        res.status(500).json({
          error: 'Failed to get current track',
          track: null
        });
      }
    });

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'spotify-settings',
        timestamp: new Date().toISOString()
      });
    });
  }

  getRouter(): express.Router {
    return this.router;
  }
}