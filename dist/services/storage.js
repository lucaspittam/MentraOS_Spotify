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
exports.StorageService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const isServer = typeof window === 'undefined';
const TOKENS_FILE_PATH = path_1.default.join(process.cwd(), 'spotify_tokens.json');
class StorageService {
    constructor() {
        this.tokenCache = null;
        this.lastTokenCheck = 0;
        this.TOKEN_CACHE_TTL = 2000; // Cache for 2 seconds to reduce file I/O
    }
    async storeTokens(tokens) {
        try {
            console.log('💾 Storing Spotify tokens...', {
                hasAccessToken: !!tokens.access_token,
                hasRefreshToken: !!tokens.refresh_token,
                expiresIn: tokens.expires_in
            });
            if (isServer) {
                await promises_1.default.writeFile(TOKENS_FILE_PATH, JSON.stringify(tokens, null, 2));
                console.log('✅ Tokens stored to file:', TOKENS_FILE_PATH);
            }
            else {
                const mentra = await Promise.resolve().then(() => __importStar(require('@mentra/sdk')));
                await mentra.storage.set(StorageService.TOKENS_KEY, JSON.stringify(tokens));
                console.log('✅ Tokens stored to MentraOS storage');
            }
            // Update cache immediately
            this.tokenCache = tokens;
            this.lastTokenCheck = Date.now();
        }
        catch (error) {
            console.error('❌ Failed to store tokens:', error);
            throw new Error('Failed to store authentication tokens');
        }
    }
    async getTokens() {
        try {
            const now = Date.now();
            // Use cache if recent (reduces file I/O race conditions)
            if (this.tokenCache && (now - this.lastTokenCheck) < this.TOKEN_CACHE_TTL) {
                console.log('📖 Using cached tokens:', { hasTokens: !!this.tokenCache.access_token });
                return this.tokenCache;
            }
            if (isServer) {
                try {
                    const tokensJson = await promises_1.default.readFile(TOKENS_FILE_PATH, 'utf-8');
                    const tokens = JSON.parse(tokensJson);
                    console.log('📖 Retrieved tokens from file:', { hasTokens: !!tokens.access_token });
                    // Update cache
                    this.tokenCache = tokens;
                    this.lastTokenCheck = now;
                    return tokens;
                }
                catch (error) {
                    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                        console.log('📖 No token file found');
                        this.tokenCache = null;
                        this.lastTokenCheck = now;
                        return null; // File doesn't exist
                    }
                    throw error;
                }
            }
            else {
                const mentra = await Promise.resolve().then(() => __importStar(require('@mentra/sdk')));
                const tokensJson = await mentra.storage.get(StorageService.TOKENS_KEY);
                if (!tokensJson) {
                    console.log('📖 No tokens in MentraOS storage');
                    this.tokenCache = null;
                    this.lastTokenCheck = now;
                    return null;
                }
                const tokens = JSON.parse(tokensJson);
                console.log('📖 Retrieved tokens from MentraOS storage:', { hasTokens: !!tokens.access_token });
                // Update cache
                this.tokenCache = tokens;
                this.lastTokenCheck = now;
                return tokens;
            }
        }
        catch (error) {
            console.error('❌ Failed to retrieve tokens:', error);
            return null;
        }
    }
    async clearTokens() {
        try {
            if (isServer) {
                await promises_1.default.unlink(TOKENS_FILE_PATH);
            }
            else {
                const mentra = await Promise.resolve().then(() => __importStar(require('@mentra/sdk')));
                await mentra.storage.remove(StorageService.TOKENS_KEY);
            }
        }
        catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }
    async storeUserPreferences(preferences) {
        try {
            if (isServer) {
                // For simplicity, storing user prefs in the same token file. 
                // In a real app, you might want a separate file.
                const existingData = await this.getUserPreferences();
                const newData = { ...existingData, ...preferences };
                await promises_1.default.writeFile(TOKENS_FILE_PATH, JSON.stringify(newData, null, 2));
            }
            else {
                const mentra = await Promise.resolve().then(() => __importStar(require('@mentra/sdk')));
                await mentra.storage.set(StorageService.USER_PREFS_KEY, JSON.stringify(preferences));
            }
        }
        catch (error) {
            console.error('Failed to store user preferences:', error);
        }
    }
    async getUserPreferences() {
        try {
            if (isServer) {
                try {
                    const prefsJson = await promises_1.default.readFile(TOKENS_FILE_PATH, 'utf-8');
                    return JSON.parse(prefsJson);
                }
                catch (error) {
                    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                        return {};
                    }
                    throw error;
                }
            }
            else {
                const mentra = await Promise.resolve().then(() => __importStar(require('@mentra/sdk')));
                const prefsJson = await mentra.storage.get(StorageService.USER_PREFS_KEY);
                if (!prefsJson) {
                    return {};
                }
                return JSON.parse(prefsJson);
            }
        }
        catch (error) {
            console.error('Failed to retrieve user preferences:', error);
            return {};
        }
    }
}
exports.StorageService = StorageService;
StorageService.TOKENS_KEY = 'spotify_tokens';
StorageService.USER_PREFS_KEY = 'user_preferences';
//# sourceMappingURL=storage.js.map