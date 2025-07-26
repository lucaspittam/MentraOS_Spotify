import { MediaState, UIState } from '../types';
import { AppSession } from '@mentra/sdk';
import { SettingsManager } from '../services/settings-manager';

export class MediaOverlay {
  private session: AppSession | null = null;
  private settingsManager: SettingsManager | null = null;
  private state: UIState = {
    isOverlayVisible: false,
    mediaState: {
      track: null,
      isPlaying: false,
      progressMs: 0,
      durationMs: 0,
    },
    isLoading: false,
    error: null,
  };

  async initialize(): Promise<void> {
    if (this.session) {
      this.session.logger.info('🎨 MediaOverlay initialized for MentraOS');
    }
  }

  setSession(session: AppSession): void {
    this.session = session;
  }

  show(): void {
    this.state.isOverlayVisible = true;
    this.render();
  }

  hide(): void {
    this.state.isOverlayVisible = false;
    this.render();
  }

  toggle(): void {
    this.state.isOverlayVisible = !this.state.isOverlayVisible;
    this.render();
  }

  updateMediaState(mediaState: MediaState): void {
    this.state.mediaState = mediaState;
    if (this.state.isOverlayVisible) {
      this.render();
    }
  }

  private render(): void {
    if (!this.session) return;

    if (this.state.isOverlayVisible) {
      if (this.state.mediaState.track) {
        const { track, isPlaying, progressMs, durationMs } = this.state.mediaState;
        const progress = Math.floor((progressMs / durationMs) * 100);
        const text = `Now Playing:\n${track.title}\nby ${track.artist}\n\n${isPlaying ? 'Playing' : 'Paused'} [${progress}%]`;
        this.session.layouts.showTextWall(text);
      } else {
        this.session.layouts.showTextWall('No media playing');
      }
    } else {
      this.session.layouts.showTextWall('Say "Show Media" to see controls');
    }
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.render();
  }

  showError(error: string | null): void {
    this.state.error = error;
    this.render();
  }

  getState(): UIState {
    return { ...this.state };
  }
}
