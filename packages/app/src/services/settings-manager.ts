import { AppSession } from '@mentra/sdk';

export interface AppSettings {
  show_album_art: boolean;
  display_mode: 'minimal' | 'standard' | 'detailed';
}

export class SettingsManager {
  private session: AppSession | null = null;
  private settings: Partial<AppSettings> = {};
  private changeListeners: ((settings: Partial<AppSettings>) => void)[] = [];

  setSession(session: AppSession): void {
    this.session = session;
    this.loadSettings();
    this.setupChangeListeners();
  }

  private loadSettings(): void {
    if (!this.session) return;

    // Load only the settings that actually work in MentraOS
    this.settings = {
      show_album_art: this.session.settings.get('show_album_art') ?? true,
      display_mode: this.session.settings.get('display_mode') || 'standard',
    };

    this.session.logger.info('📋 Settings loaded:', this.settings);
  }

  private setupChangeListeners(): void {
    if (!this.session) return;

    // Listen to all setting changes
    this.session.settings.onChange((key: string, value: any) => {
      this.session!.logger.info(`📋 Setting changed: ${key} = ${value}`);
      
      // Update local settings cache
      (this.settings as any)[key] = value;
      
      // Notify listeners
      this.changeListeners.forEach(listener => {
        try {
          listener(this.settings);
        } catch (error) {
          this.session!.logger.error('📋 Error in settings change listener:', error);
        }
      });
    });
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    return this.settings[key];
  }

  getAll(): Partial<AppSettings> {
    return { ...this.settings };
  }


  onChange(listener: (settings: Partial<AppSettings>) => void): void {
    this.changeListeners.push(listener);
  }

  removeChangeListener(listener: (settings: Partial<AppSettings>) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  // Helper methods for confirmed working settings
  shouldShowAlbumArt(): boolean {
    return this.get('show_album_art') ?? true;
  }

  getDisplayMode(): 'minimal' | 'standard' | 'detailed' {
    return this.get('display_mode') || 'standard';
  }
}