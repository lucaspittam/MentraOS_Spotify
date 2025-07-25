import { SpotifyTokens } from '../types';
import fs from 'fs/promises';
import path from 'path';

const isServer = typeof window === 'undefined';
const TOKENS_FILE_PATH = path.join(process.cwd(), 'spotify_tokens.json');

export class StorageService {
  private static readonly TOKENS_KEY = 'spotify_tokens';
  private static readonly USER_PREFS_KEY = 'user_preferences';

  async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      if (isServer) {
        await fs.writeFile(TOKENS_FILE_PATH, JSON.stringify(tokens, null, 2));
      } else {
        const mentra = await import('@mentra/sdk');
        await (mentra as any).storage.set(StorageService.TOKENS_KEY, JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  async getTokens(): Promise<SpotifyTokens | null> {
    try {
      if (isServer) {
        try {
          const tokensJson = await fs.readFile(TOKENS_FILE_PATH, 'utf-8');
          return JSON.parse(tokensJson) as SpotifyTokens;
        } catch (error) {
          if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
            return null; // File doesn't exist
          }
          throw error;
        }
      } else {
        const mentra = await import('@mentra/sdk');
        const tokensJson = await (mentra as any).storage.get(StorageService.TOKENS_KEY);
        
        if (!tokensJson) {
          return null;
        }

        return JSON.parse(tokensJson) as SpotifyTokens;
      }
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      if (isServer) {
        await fs.unlink(TOKENS_FILE_PATH);
      } else {
        const mentra = await import('@mentra/sdk');
        await (mentra as any).storage.remove(StorageService.TOKENS_KEY);
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async storeUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      if (isServer) {
        // For simplicity, storing user prefs in the same token file. 
        // In a real app, you might want a separate file.
        const existingData = await this.getUserPreferences();
        const newData = { ...existingData, ...preferences };
        await fs.writeFile(TOKENS_FILE_PATH, JSON.stringify(newData, null, 2));
      } else {
        const mentra = await import('@mentra/sdk');
        await (mentra as any).storage.set(StorageService.USER_PREFS_KEY, JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Failed to store user preferences:', error);
    }
  }

  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      if (isServer) {
        try {
          const prefsJson = await fs.readFile(TOKENS_FILE_PATH, 'utf-8');
          return JSON.parse(prefsJson);
        } catch (error) {
          if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
            return {};
          }
          throw error;
        }
      } else {
        const mentra = await import('@mentra/sdk');
        const prefsJson = await (mentra as any).storage.get(StorageService.USER_PREFS_KEY);
        
        if (!prefsJson) {
          return {};
        }

        return JSON.parse(prefsJson);
      }
    } catch (error) {
      console.error('Failed to retrieve user preferences:', error);
      return {};
    }
  }
}
