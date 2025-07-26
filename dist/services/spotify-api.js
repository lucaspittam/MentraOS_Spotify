"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyApiService = void 0;
class SpotifyApiService {
    constructor(authService) {
        this.baseUrl = 'https://api.spotify.com/v1';
        this.authService = authService;
    }
    async getCurrentlyPlaying() {
        console.log('🎧 SpotifyApiService: Getting currently playing track...');
        try {
            console.log('🔑 Getting valid access token...');
            const accessToken = await this.authService.getValidAccessToken();
            console.log('✅ Access token obtained:', accessToken ? 'Present' : 'Missing');
            console.log(`📞 Making API call to ${this.baseUrl}/me/player/currently-playing`);
            const response = await fetch(`${this.baseUrl}/me/player/currently-playing`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('📈 API Response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            if (response.status === 204) {
                console.log('🔇 No content (204) - no music currently playing');
                return null;
            }
            if (!response.ok) {
                console.error('❌ API request failed:', response.status, response.statusText);
                throw new Error(`Failed to get currently playing track: ${response.statusText}`);
            }
            console.log('📦 Parsing JSON response...');
            const data = await response.json();
            console.log('🎵 Track data received:', {
                hasItem: !!data.item,
                trackName: data.item?.name || 'No name',
                isPlaying: data.is_playing
            });
            return data;
        }
        catch (error) {
            console.error('❌ Error fetching currently playing:', error);
            console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
    async playTrack() {
        // Check if there are any available devices first
        const devices = await this.getAvailableDevices();
        if (devices.length === 0) {
            throw new Error('No Spotify devices available. Please open Spotify on your phone, computer, or another device first.');
        }
        const activeDevices = devices.filter(d => d.is_active);
        if (activeDevices.length === 0) {
            throw new Error('No active Spotify device found. Please start playing music on Spotify first, then try again.');
        }
        await this.makePlayerRequest('PUT', '/me/player/play');
    }
    async pauseTrack() {
        // Check for active devices before pausing
        const devices = await this.getAvailableDevices();
        const activeDevices = devices.filter(d => d.is_active);
        if (activeDevices.length === 0) {
            throw new Error('No active Spotify device found. Please start playing music on Spotify first.');
        }
        await this.makePlayerRequest('PUT', '/me/player/pause');
    }
    async nextTrack() {
        // Check for active devices before skipping
        const devices = await this.getAvailableDevices();
        const activeDevices = devices.filter(d => d.is_active);
        if (activeDevices.length === 0) {
            throw new Error('No active Spotify device found. Please start playing music on Spotify first.');
        }
        await this.makePlayerRequest('POST', '/me/player/next');
    }
    async previousTrack() {
        // Check for active devices before going to previous track
        const devices = await this.getAvailableDevices();
        const activeDevices = devices.filter(d => d.is_active);
        if (activeDevices.length === 0) {
            throw new Error('No active Spotify device found. Please start playing music on Spotify first.');
        }
        await this.makePlayerRequest('POST', '/me/player/previous');
    }
    async likeCurrentTrack(trackId) {
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
        }
        catch (error) {
            console.error('Error liking track:', error);
            throw error;
        }
    }
    async getAvailableDevices() {
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
            const data = await response.json();
            return data.devices || [];
        }
        catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    }
    async makePlayerRequest(method, endpoint, body) {
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
        }
        catch (error) {
            console.error(`Error making player request ${method} ${endpoint}:`, error);
            throw error;
        }
    }
}
exports.SpotifyApiService = SpotifyApiService;
//# sourceMappingURL=spotify-api.js.map