import { SpotifyTokens } from '../types';
export declare class StorageService {
    private static readonly TOKENS_KEY;
    private static readonly USER_PREFS_KEY;
    storeTokens(tokens: SpotifyTokens): Promise<void>;
    private tokenCache;
    private lastTokenCheck;
    private readonly TOKEN_CACHE_TTL;
    getTokens(): Promise<SpotifyTokens | null>;
    clearTokens(): Promise<void>;
    storeUserPreferences(preferences: Record<string, any>): Promise<void>;
    getUserPreferences(): Promise<Record<string, any>>;
}
//# sourceMappingURL=storage.d.ts.map