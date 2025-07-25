import { AppConfig, SpotifyTokens } from '../types';
import { StorageService } from './storage';

export class SpotifyAuthService {
  private config: AppConfig;
  private storage: StorageService;

  constructor(config: AppConfig, storage: StorageService) {
    this.config = config;
    this.storage = storage;
  }

  getAuthUrl(): string {
    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-library-modify'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      scope: scopes,
      redirect_uri: this.config.redirectUri,
      state: this.generateState()
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for tokens: ${response.statusText}`);
    }

    const data = await response.json();
    
    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    };

    await this.storage.storeTokens(tokens);
    return tokens;
  }

  async refreshAccessToken(): Promise<SpotifyTokens> {
    const currentTokens = await this.storage.getTokens();
    if (!currentTokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentTokens.refresh_token
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    
    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || currentTokens.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    };

    await this.storage.storeTokens(tokens);
    return tokens;
  }

  async getValidAccessToken(): Promise<string> {
    const tokens = await this.storage.getTokens();
    
    if (!tokens) {
      throw new Error('No tokens available, user needs to authenticate');
    }

    if (Date.now() >= tokens.expires_at) {
      const refreshedTokens = await this.refreshAccessToken();
      return refreshedTokens.access_token;
    }

    return tokens.access_token;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(7);
  }
}