import { SpotifyTokens } from '../types';
export declare class TokenManager {
    private storageService;
    constructor();
    /**
     * Check if valid tokens exist in storage
     * @returns Promise<boolean> - true if valid tokens exist
     */
    checkStoredTokens(): Promise<boolean>;
    /**
     * Clear all stored tokens
     * @returns Promise<void>
     */
    clearStoredTokens(): Promise<void>;
    /**
     * Save new tokens to storage
     * @param tokens - The Spotify tokens to save
     * @returns Promise<void>
     */
    saveTokens(tokens: SpotifyTokens): Promise<void>;
    /**
     * Retrieve stored tokens
     * @returns Promise<SpotifyTokens | null> - The stored tokens or null if not found
     */
    getStoredTokens(): Promise<SpotifyTokens | null>;
    /**
     * Check if tokens need to be refreshed (within 10 minutes of expiry)
     * @returns Promise<boolean> - true if tokens should be refreshed
     */
    shouldRefreshTokens(): Promise<boolean>;
    /**
     * Get token expiry information
     * @returns Promise<{isExpired: boolean, expiresAt: number, expiresIn: number} | null>
     */
    getTokenInfo(): Promise<{
        isExpired: boolean;
        expiresAt: number;
        expiresIn: number;
    } | null>;
}
//# sourceMappingURL=tokenManager.d.ts.map