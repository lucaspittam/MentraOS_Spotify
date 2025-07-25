import { SpotifyTrack, UIState } from '../types';
import { AppSession } from '@mentra/sdk';

export class SpotifyOverlay {
  private session: AppSession | null = null;
  private state: UIState = {
    isOverlayVisible: false,
    currentTrack: null,
    isLoading: false,
    error: null
  };

  async initialize(): Promise<void> {
    console.log('🎨 SpotifyOverlay initialized for MentraOS');
  }

  setSession(session: AppSession): void {
    this.session = session;
  }

  show(): void {
    this.state.isOverlayVisible = true;
    if (this.session && this.state.currentTrack) {
      this.displayCurrentTrack();
    }
  }

  hide(): void {
    this.state.isOverlayVisible = false;
    if (this.session) {
      // Show main app interface when hiding overlay
      const text = '🎵 Spotify Controller\n\nSay "Show Spotify" to see music controls\n\nVoice commands:\n• Next song\n• Pause music\n• Play music\n• Like this song';
      this.session.layouts.showTextWall(text);
    }
  }

  toggle(): void {
    if (this.state.isOverlayVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  updateTrack(track: SpotifyTrack | null): void {
    this.state.currentTrack = track;
    
    if (this.session && this.state.isOverlayVisible) {
      this.displayCurrentTrack();
    }
  }

  private displayCurrentTrack(): void {
    if (!this.session) return;

    if (this.state.currentTrack) {
      const track = this.state.currentTrack;
      const text = `🎵 ${track.name}\n\nby ${track.artists.map(a => a.name).join(', ')}\n\n💿 ${track.album.name}\n\nSay "Next song" to skip\nSay "Pause music" to pause`;
      
      this.session.layouts.showTextWall(text);
    } else {
      const text = '🎵 Spotify Controller\n\nNo music playing\n\nStart playing music on Spotify\nthen say "Show Spotify"';
      this.session.layouts.showTextWall(text);
    }
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    
    if (this.session && this.state.isOverlayVisible && loading) {
      const text = '🎵 Spotify Controller\n\nLoading...';
      this.session.layouts.showTextWall(text);
    }
  }

  showError(error: string | null): void {
    this.state.error = error;
    
    if (this.session && error) {
      const text = `❌ Spotify Error\n\n${error}`;
      this.session.layouts.showTextWall(text);
    }
  }

  getState(): UIState {
    return { ...this.state };
  }
}