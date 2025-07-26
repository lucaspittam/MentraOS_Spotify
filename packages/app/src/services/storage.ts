import fs from 'fs/promises';
import path from 'path';

const isServer = typeof window === 'undefined';
const STORAGE_FILE_PATH = path.join(process.cwd(), 'storage.json');

export class StorageService {
  private cache: Record<string, any> = {};
  private lastRead = 0;
  private readonly CACHE_TTL = 2000; // Cache for 2 seconds

  private async readFile(): Promise<Record<string, any>> {
    const now = Date.now();
    if (Object.keys(this.cache).length > 0 && (now - this.lastRead) < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const data = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
      this.cache = JSON.parse(data);
      this.lastRead = now;
      return this.cache;
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
        return {}; // File doesn't exist, return empty object
      }
      throw error;
    }
  }

  private async writeFile(data: Record<string, any>): Promise<void> {
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(data, null, 2));
    this.cache = data;
    this.lastRead = Date.now();
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      if (isServer) {
        const data = await this.readFile();
        data[key] = value;
        await this.writeFile(data);
      } else {
        const mentra = await import('@mentra/sdk');
        await (mentra as any).storage.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set key "${key}":`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (isServer) {
        const data = await this.readFile();
        return data[key] || null;
      } else {
        const mentra = await import('@mentra/sdk');
        const value = await (mentra as any).storage.get(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error(`Failed to get key "${key}":`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (isServer) {
        const data = await this.readFile();
        delete data[key];
        await this.writeFile(data);
      } else {
        const mentra = await import('@mentra/sdk');
        await (mentra as any).storage.remove(key);
      }
    } catch (error) {
      console.error(`Failed to remove key "${key}":`, error);
    }
  }
}