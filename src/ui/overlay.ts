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
      // Show minimal interface when overlay is hidden
      const text = `
     ╭─────────────────────────────────────────╮
     │                                         │
     │  🎵  Spotify Controller                 │
     │      Say "Show Spotify" for music       │
     │                                         │
     │  Voice commands: Next • Pause • Play    │
     │                                         │
     │  ♪ ________ ______ ________ ______ ♪   │
     │                                         │
     ╰─────────────────────────────────────────╯
      `.trim();
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

  private generateWaveform(isPlaying: boolean = true): string {
    if (!isPlaying) {
      return '________ ______ ________ ______';
    }
    
    // Generate dynamic waveform bars with different heights
    const bars = ['|', '||', '|||', '||||', '|||||'];
    const segments: string[] = [];
    
    // Create 4 segments of waveform
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 8; j++) {
        // Vary the bar heights with some randomness but keep it musical
        const height = Math.floor(Math.random() * bars.length);
        segment += bars[height];
      }
      segments.push(segment);
    }
    
    return segments.join(' ');
  }

  private displayCurrentTrack(): void {
    if (!this.session) return;

    if (this.state.currentTrack) {
      const track = this.state.currentTrack;
      const artists = track.artists.map(a => a.name).join(', ');
      
      // Create clean, minimal music card
      const songTitle = track.name.length > 32 ? track.name.substring(0, 32) + '...' : track.name;
      const artistName = artists.length > 38 ? artists.substring(0, 38) + '...' : artists;
      const waveform = this.generateWaveform(true);
      
      const text = `
     ╭─────────────────────────────────────────╮
     │                                         │
     │  🎵  ${songTitle}${' '.repeat(Math.max(0, 32 - songTitle.length))}  │
     │      ${artistName}${' '.repeat(Math.max(0, 32 - artistName.length))}      │
     │                                         │
     │  [●●●●●●○○○○] 3:24 / 5:55               │
     │                                         │
     │  ♪ ${waveform} ♪   │
     │                                         │
     ╰─────────────────────────────────────────╯
      `.trim();
      
      this.session.layouts.showTextWall(text);
    } else {
      const waveform = this.generateWaveform(false);
      const text = `
     ╭─────────────────────────────────────────╮
     │                                         │
     │  🎵  No Music Playing                   │
     │      Start playing on Spotify          │
     │                                         │
     │  [○○○○○○○○○○] 0:00 / 0:00               │
     │                                         │
     │  ♪ ${waveform} ♪   │
     │                                         │
     ╰─────────────────────────────────────────╯
      `.trim();
      this.session.layouts.showTextWall(text);
    }
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    
    if (this.session && this.state.isOverlayVisible && loading) {
      const text = `
     ╭─────────────────────────────────────────╮
     │                                         │
     │  🎵  Loading...                         │
     │      Processing command                 │
     │                                         │
     │  [○○○○○○○○○○] --:-- / --:--             │
     │                                         │
     │  ♪ ________ ______ ________ ______ ♪   │
     │                                         │
     ╰─────────────────────────────────────────╯
      `.trim();
      this.session.layouts.showTextWall(text);
    }
  }

  showError(error: string | null): void {
    this.state.error = error;
    
    if (this.session && error) {
      const errorMsg = error.length > 35 ? error.substring(0, 35) + '...' : error;
      const text = `
     ╭─────────────────────────────────────────╮
     │                                         │
     │  ❌  Error                              │
     │      ${errorMsg}${' '.repeat(Math.max(0, 32 - errorMsg.length))}      │
     │                                         │
     │  [○○○○○○○○○○] --:-- / --:--             │
     │                                         │
     │  ♪ ________ ______ ________ ______ ♪   │
     │                                         │
     ╰─────────────────────────────────────────╯
      `.trim();
      this.session.layouts.showTextWall(text);
    }
  }

  getState(): UIState {
    return { ...this.state };
  }
}