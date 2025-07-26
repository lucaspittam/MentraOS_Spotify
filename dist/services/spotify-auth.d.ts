import { AppConfig, SpotifyTokens } from '../types';
import { StorageService } from './storage';
export declare class SpotifyAuthService {
    private config;
    private storage;
    constructor(config: AppConfig, storage: StorageService);
    getAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<SpotifyTokens>;
    refreshAccessToken(): Promise<SpotifyTokens>;
    getValidAccessToken(): Promise<string>;
    private generateState;
}
//# sourceMappingURL=spotify-auth.d.ts.map