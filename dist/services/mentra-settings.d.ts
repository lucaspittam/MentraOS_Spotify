import { AppSession } from '@mentra/sdk';
import { SpotifyApiService } from './spotify-api';
import { StorageService } from './storage';
import { SpotifyAuthService } from './spotify-auth';
export declare class MentraSettingsService {
    private session;
    private spotifyApi;
    private storage;
    private auth;
    private isInitialized;
    constructor(session: AppSession, spotifyApi: SpotifyApiService, storage: StorageService, auth: SpotifyAuthService);
    initialize(): Promise<void>;
    private handleSettingsChange;
    private applyCurrentSettings;
    private handleConnectSpotify;
    private handleDisconnectSpotify;
    updateConnectionStatus(): Promise<void>;
    getSetting<T>(key: string, defaultValue?: T): T;
    isFeatureEnabled(key: string): boolean;
    getNumericSetting(key: string, defaultValue?: number): number;
    getStringSetting(key: string, defaultValue?: string): string;
    shouldShowAlbumArt(): boolean;
    shouldAutoShowOverlay(): boolean;
    getOverlayTimeout(): number;
    shouldProvideVoiceFeedback(): boolean;
    shouldProvideHapticFeedback(): boolean;
    startPeriodicUpdates(): void;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=mentra-settings.d.ts.map