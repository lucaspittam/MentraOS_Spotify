import { VoiceCommand } from '../types';
import { SpotifyApiService } from './spotify-api';
import { SpotifyOverlay } from '../ui/overlay';

export class VoiceCommandService {
  private spotifyApi: SpotifyApiService;
  private overlay: SpotifyOverlay;
  private currentTrackId: string | null = null;

  constructor(spotifyApi: SpotifyApiService, overlay: SpotifyOverlay) {
    this.spotifyApi = spotifyApi;
    this.overlay = overlay;
  }

  async initialize(): Promise<void> {
    await this.registerCommands();
  }

  private async registerCommands(): Promise<void> {
    const mentra = await import('@mentra/sdk');
    
    const commands: VoiceCommand[] = [
      { phrase: 'show spotify', action: 'toggleOverlay' },
      { phrase: 'hide spotify', action: 'hideOverlay' },
      { phrase: 'next song', action: 'nextTrack' },
      { phrase: 'previous song', action: 'previousTrack' },
      { phrase: 'pause music', action: 'pauseMusic' },
      { phrase: 'play music', action: 'playMusic' },
      { phrase: 'like this song', action: 'likeTrack' },
      { phrase: 'skip', action: 'nextTrack' },
      { phrase: 'skip song', action: 'nextTrack' }
    ];

    for (const command of commands) {
      await mentra.voice.registerCommand(command.phrase, (event) => {
        this.handleVoiceCommand(command.action, event);
      });
    }
  }

  private async handleVoiceCommand(action: string, event?: any): Promise<void> {
    try {
      this.overlay.setLoading(true);

      switch (action) {
        case 'toggleOverlay':
          this.overlay.toggle();
          break;

        case 'hideOverlay':
          this.overlay.hide();
          break;

        case 'nextTrack':
          await this.spotifyApi.nextTrack();
          await this.handleFeedback('Skipping to next track');
          break;

        case 'previousTrack':
          await this.spotifyApi.previousTrack();
          await this.handleFeedback('Going to previous track');
          break;

        case 'pauseMusic':
          await this.spotifyApi.pauseTrack();
          await this.handleFeedback('Music paused');
          break;

        case 'playMusic':
          await this.spotifyApi.playTrack();
          await this.handleFeedback('Music playing');
          break;

        case 'likeTrack':
          if (this.currentTrackId) {
            await this.spotifyApi.likeCurrentTrack(this.currentTrackId);
            await this.handleFeedback('Track liked');
          } else {
            this.overlay.showError('No track currently playing');
          }
          break;

        default:
          console.warn(`Unknown voice command action: ${action}`);
      }
    } catch (error) {
      console.error(`Error handling voice command ${action}:`, error);
      this.overlay.showError(`Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } finally {
      this.overlay.setLoading(false);
    }
  }

  private async handleFeedback(message: string): Promise<void> {
    try {
      const mentra = await import('@mentra/sdk');
      await mentra.feedback.haptic('light');
      await mentra.feedback.audio('success');
      
      setTimeout(() => {
        console.log(`Voice command feedback: ${message}`);
      }, 100);
    } catch (error) {
      console.warn('Failed to provide haptic/audio feedback:', error);
    }
  }

  setCurrentTrackId(trackId: string | null): void {
    this.currentTrackId = trackId;
  }

  async cleanup(): Promise<void> {
    try {
      const mentra = await import('@mentra/sdk');
      await mentra.voice.unregisterAllCommands();
    } catch (error) {
      console.error('Error cleaning up voice commands:', error);
    }
  }
}