"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRouter = void 0;
const express_1 = __importDefault(require("express"));
const spotify_auth_1 = require("../services/spotify-auth");
const storage_1 = require("../services/storage");
class SettingsRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.storageService = new storage_1.StorageService();
        const config = {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
            redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
        };
        this.authService = new spotify_auth_1.SpotifyAuthService(config, this.storageService);
        this.setupRoutes();
    }
    setupRoutes() {
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
                    ? 'https://your-render-app.onrender.com' // Replace with actual Render URL
                    : `http://localhost:${process.env.PORT || 3000}`;
                res.json({
                    connected: isConnected,
                    authUrl: `${baseUrl}/auth`,
                    message: isConnected
                        ? 'Spotify is connected and ready to use'
                        : 'Click Connect to authenticate with Spotify'
                });
            }
            catch (error) {
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
            }
            catch (error) {
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
                const { SpotifyApiService } = await Promise.resolve().then(() => __importStar(require('../services/spotify-api')));
                const apiService = new SpotifyApiService(this.authService);
                const currentTrack = await apiService.getCurrentlyPlaying();
                res.json({
                    track: currentTrack?.item || null,
                    isPlaying: currentTrack?.is_playing || false
                });
            }
            catch (error) {
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
    getRouter() {
        return this.router;
    }
}
exports.SettingsRouter = SettingsRouter;
//# sourceMappingURL=settings.js.map