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
    console.log('🎨 Overlay: show() called');
    this.state.isOverlayVisible = true;
    
    console.log('🎨 Overlay state after show:', {
      isVisible: this.state.isOverlayVisible,
      hasSession: !!this.session,
      hasCurrentTrack: !!this.state.currentTrack,
      trackName: this.state.currentTrack?.name || 'No track'
    });
    
    if (this.session && this.state.currentTrack) {
      console.log('🎨 Displaying current track');
      this.displayCurrentTrack();
    } else if (this.session) {
      console.log('🎨 No current track, displaying no music display');
      this.displayCurrentTrack(); // This will show "No Music Playing"
    } else {
      console.log('🎨 No session available');
    }
  }

  hide(): void {
    console.log('🎨 Overlay: hide() called');
    this.state.isOverlayVisible = false;
    
    if (this.session) {
      console.log('🎨 Showing minimal interface');
      const text = `🎵 SPOTIFY CONTROLLER

Say "Show Spotify" for music

Voice commands:
• Next song
• Pause music  
• Play music

Connected and ready`;
      this.session.layouts.showTextWall(text);
    } else {
      console.log('🎨 No session available for hiding');
    }
  }

  toggle(): void {
    console.log('🎨 Overlay: toggle() called, current visibility:', this.state.isOverlayVisible);
    
    if (this.state.isOverlayVisible) {
      console.log('🎨 Overlay currently visible, hiding it');
      this.hide();
    } else {
      console.log('🎨 Overlay currently hidden, showing it');
      this.show();
    }
  }

  updateTrack(track: SpotifyTrack | null): void {
    console.log('🎨 Overlay: updateTrack called', {
      hasTrack: !!track,
      trackName: track?.name || 'No track',
      isOverlayVisible: this.state.isOverlayVisible,
      hasSession: !!this.session
    });
    
    this.state.currentTrack = track;
    
    if (this.session && this.state.isOverlayVisible) {
      console.log('🎨 Overlay: Displaying current track');
      this.displayCurrentTrack();
    } else {
      console.log('🎨 Overlay: Not displaying - overlay not visible or no session');
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
      
      const songTitle = track.name.length > 30 ? track.name.substring(0, 30) + '...' : track.name;
      const artistName = artists.length > 30 ? artists.substring(0, 30) + '...' : artists;
      const waveform = this.generateWaveform(true);
      
      const text = `🎵 NOW PLAYING

${songTitle}
by ${artistName}

${waveform}

Say "next song" to skip
Say "pause music" to pause`;
      
      this.session.layouts.showTextWall(text);
    } else {
      const waveform = this.generateWaveform(false);
      const text = `🎵 SPOTIFY CONTROLLER

No music playing

Start playing music on Spotify
then say "Show Spotify"

${waveform}

Voice commands:
• Next song
• Pause music  
• Play music`;
      
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