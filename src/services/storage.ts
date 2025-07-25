import { SpotifyTokens } from '../types';

export class StorageService {
  private static readonly TOKENS_KEY = 'spotify_tokens';
  private static readonly USER_PREFS_KEY = 'user_preferences';

  async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      const mentra = await import('@mentra/sdk');
      await (mentra as any).storage.set(StorageService.TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  async getTokens(): Promise<SpotifyTokens | null> {
    try {
      const mentra = await import('@mentra/sdk');
      const tokensJson = await (mentra as any).storage.get(StorageService.TOKENS_KEY);
      
      if (!tokensJson) {
        return null;
      }

      const tokens = JSON.parse(tokensJson) as SpotifyTokens;
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      const mentra = await import('@mentra/sdk');
      await (mentra as any).storage.remove(StorageService.TOKENS_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async storeUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      const mentra = await import('@mentra/sdk');
      await (mentra as any).storage.set(StorageService.USER_PREFS_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to store user preferences:', error);
    }
  }

  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const mentra = await import('@mentra/sdk');
      const prefsJson = await (mentra as any).storage.get(StorageService.USER_PREFS_KEY);
      
      if (!prefsJson) {
        return {};
      }

      return JSON.parse(prefsJson);
    } catch (error) {
      console.error('Failed to retrieve user preferences:', error);
      return {};
    }
  }
}