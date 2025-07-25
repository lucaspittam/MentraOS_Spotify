import { SpotifyCurrentlyPlaying, SpotifyTrack } from '../types';
import { SpotifyAuthService } from './spotify-auth';

export class SpotifyApiService {
  private authService: SpotifyAuthService;
  private baseUrl = 'https://api.spotify.com/v1';

  constructor(authService: SpotifyAuthService) {
    this.authService = authService;
  }

  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(`${this.baseUrl}/me/player/currently-playing`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 204) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get currently playing track: ${response.statusText}`);
      }

      const data = await response.json();
      return data as SpotifyCurrentlyPlaying;
    } catch (error) {
      console.error('Error fetching currently playing:', error);
      throw error;
    }
  }

  async playTrack(): Promise<void> {
    await this.makePlayerRequest('PUT', '/me/player/play');
  }

  async pauseTrack(): Promise<void> {
    await this.makePlayerRequest('PUT', '/me/player/pause');
  }

  async nextTrack(): Promise<void> {
    await this.makePlayerRequest('POST', '/me/player/next');
  }

  async previousTrack(): Promise<void> {
    await this.makePlayerRequest('POST', '/me/player/previous');
  }

  async likeCurrentTrack(trackId: string): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(`${this.baseUrl}/me/tracks`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: [trackId]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to like track: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  }

  async getAvailableDevices(): Promise<any[]> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(`${this.baseUrl}/me/player/devices`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.devices || [];
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  private async makePlayerRequest(method: string, endpoint: string, body?: any): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok && response.status !== 204) {
        if (response.status === 404) {
          throw new Error('No active Spotify device found. Please start playing music on Spotify first.');
        }
        throw new Error(`Player request failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error making player request ${method} ${endpoint}:`, error);
      throw error;
    }
  }
}