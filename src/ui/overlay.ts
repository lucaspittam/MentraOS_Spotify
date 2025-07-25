import { SpotifyTrack, UIState } from '../types';

export class SpotifyOverlay {
  private container: HTMLElement | null = null;
  private state: UIState = {
    isOverlayVisible: false,
    currentTrack: null,
    isLoading: false,
    error: null
  };

  async initialize(): Promise<void> {
    await this.createOverlay();
    this.setupStyles();
  }

  private async createOverlay(): Promise<void> {
    const mentra = await import('@mentra/sdk');
    
    this.container = document.createElement('div');
    this.container.id = 'spotify-overlay';
    this.container.className = 'spotify-overlay hidden';
    
    this.container.innerHTML = `
      <div class="overlay-content">
        <div class="track-info">
          <div class="album-art-container">
            <img id="album-art" src="" alt="Album Art" class="album-art" />
            <div id="loading-spinner" class="loading-spinner hidden">♪</div>
          </div>
          <div class="track-details">
            <div id="track-name" class="track-name">No track playing</div>
            <div id="artist-name" class="artist-name">---</div>
          </div>
        </div>
        <div class="controls">
          <button id="play-pause-btn" class="control-btn">⏸️</button>
          <button id="next-btn" class="control-btn">⏭️</button>
          <button id="like-btn" class="control-btn">♡</button>
        </div>
        <div id="error-message" class="error-message hidden"></div>
      </div>
    `;

    document.body.appendChild(this.container);
    
    await mentra.ui.registerOverlay('spotify-overlay', this.container);
  }

  private setupStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .spotify-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-family: 'SF Pro Display', -apple-system, sans-serif;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        z-index: 1000;
      }

      .spotify-overlay.hidden {
        opacity: 0;
        transform: translateX(320px);
        pointer-events: none;
      }

      .overlay-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .track-info {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .album-art-container {
        position: relative;
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        background: #333;
      }

      .album-art {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }

      .track-details {
        flex: 1;
        min-width: 0;
      }

      .track-name {
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }

      .artist-name {
        font-size: 14px;
        color: #b3b3b3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .controls {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .control-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
      }

      .control-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .control-btn:active {
        background: rgba(255, 255, 255, 0.2);
      }

      .error-message {
        background: #ff4444;
        color: white;
        padding: 8px;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
      }

      .error-message.hidden {
        display: none;
      }
    `;
    
    document.head.appendChild(style);
  }

  show(): void {
    if (this.container) {
      this.state.isOverlayVisible = true;
      this.container.classList.remove('hidden');
    }
  }

  hide(): void {
    if (this.container) {
      this.state.isOverlayVisible = false;
      this.container.classList.add('hidden');
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
    
    const trackNameEl = document.getElementById('track-name');
    const artistNameEl = document.getElementById('artist-name');
    const albumArtEl = document.getElementById('album-art') as HTMLImageElement;
    
    if (track) {
      if (trackNameEl) trackNameEl.textContent = track.name;
      if (artistNameEl) artistNameEl.textContent = track.artists.map(a => a.name).join(', ');
      if (albumArtEl && track.album.images.length > 0) {
        albumArtEl.src = track.album.images[0].url;
        albumArtEl.alt = `${track.album.name} cover`;
      }
    } else {
      if (trackNameEl) trackNameEl.textContent = 'No track playing';
      if (artistNameEl) artistNameEl.textContent = '---';
      if (albumArtEl) {
        albumArtEl.src = '';
        albumArtEl.alt = 'No album art';
      }
    }
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.classList.toggle('hidden', !loading);
    }
  }

  showError(error: string | null): void {
    this.state.error = error;
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      if (error) {
        errorEl.textContent = error;
        errorEl.classList.remove('hidden');
        setTimeout(() => {
          errorEl.classList.add('hidden');
        }, 5000);
      } else {
        errorEl.classList.add('hidden');
      }
    }
  }

  getState(): UIState {
    return { ...this.state };
  }
}