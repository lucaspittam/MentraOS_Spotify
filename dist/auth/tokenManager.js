"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
const storage_1 = require("../services/storage");
class TokenManager {
    constructor() {
        this.storageService = new storage_1.StorageService();
    }
    /**
     * Check if valid tokens exist in storage
     * @returns Promise<boolean> - true if valid tokens exist
     */
    async checkStoredTokens() {
        try {
            const tokens = await this.storageService.getTokens();
            if (!tokens) {
                return false;
            }
            // Check if access token is still valid (not expired)
            const now = Date.now();
            const tokenAge = now - tokens.obtained_at;
            const expiresIn = tokens.expires_in * 1000; // Convert to milliseconds
            // Token is valid if it's not expired (with 5 minute buffer)
            const isValid = tokenAge < (expiresIn - 300000); // 5 minutes buffer
            if (!isValid) {
                console.log('Stored tokens are expired');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error checking stored tokens:', error);
            return false;
        }
    }
    /**
     * Clear all stored tokens
     * @returns Promise<void>
     */
    async clearStoredTokens() {
        try {
            await this.storageService.clearTokens();
            console.log('Successfully cleared stored tokens');
        }
        catch (error) {
            console.error('Error clearing stored tokens:', error);
            throw new Error('Failed to clear authentication tokens');
        }
    }
    /**
     * Save new tokens to storage
     * @param tokens - The Spotify tokens to save
     * @returns Promise<void>
     */
    async saveTokens(tokens) {
        try {
            // Add timestamp when tokens were obtained
            const tokensWithTimestamp = {
                ...tokens,
                obtained_at: Date.now()
            };
            await this.storageService.storeTokens(tokensWithTimestamp);
            console.log('Successfully saved tokens to storage');
        }
        catch (error) {
            console.error('Error saving tokens:', error);
            throw new Error('Failed to save authentication tokens');
        }
    }
    /**
     * Retrieve stored tokens
     * @returns Promise<SpotifyTokens | null> - The stored tokens or null if not found
     */
    async getStoredTokens() {
        try {
            return await this.storageService.getTokens();
        }
        catch (error) {
            console.error('Error retrieving stored tokens:', error);
            return null;
        }
    }
    /**
     * Check if tokens need to be refreshed (within 10 minutes of expiry)
     * @returns Promise<boolean> - true if tokens should be refreshed
     */
    async shouldRefreshTokens() {
        try {
            const tokens = await this.storageService.getTokens();
            if (!tokens || !tokens.obtained_at) {
                return false;
            }
            const now = Date.now();
            const tokenAge = now - tokens.obtained_at;
            const expiresIn = tokens.expires_in * 1000; // Convert to milliseconds
            // Refresh if within 10 minutes of expiry
            const shouldRefresh = tokenAge > (expiresIn - 600000); // 10 minutes buffer
            return shouldRefresh;
        }
        catch (error) {
            console.error('Error checking if tokens should refresh:', error);
            return false;
        }
    }
    /**
     * Get token expiry information
     * @returns Promise<{isExpired: boolean, expiresAt: number, expiresIn: number} | null>
     */
    async getTokenInfo() {
        try {
            const tokens = await this.storageService.getTokens();
            if (!tokens || !tokens.obtained_at) {
                return null;
            }
            const now = Date.now();
            const expiresAt = tokens.obtained_at + (tokens.expires_in * 1000);
            const expiresIn = expiresAt - now;
            const isExpired = expiresIn <= 0;
            return {
                isExpired,
                expiresAt,
                expiresIn: Math.max(0, expiresIn)
            };
        }
        catch (error) {
            console.error('Error getting token info:', error);
            return null;
        }
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=tokenManager.js.map