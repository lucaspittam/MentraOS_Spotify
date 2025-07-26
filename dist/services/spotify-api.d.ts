import { SpotifyCurrentlyPlaying } from '../types';
import { SpotifyAuthService } from './spotify-auth';
export declare class SpotifyApiService {
    private authService;
    private baseUrl;
    constructor(authService: SpotifyAuthService);
    getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null>;
    playTrack(): Promise<void>;
    pauseTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    previousTrack(): Promise<void>;
    likeCurrentTrack(trackId: string): Promise<void>;
    getAvailableDevices(): Promise<any[]>;
    private makePlayerRequest;
}
//# sourceMappingURL=spotify-api.d.ts.map