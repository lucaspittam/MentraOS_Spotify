import { VoiceCommand } from '../types';
import { SpotifyApiService } from './spotify-api';
import { SpotifyOverlay } from '../ui/overlay';
import { AppSession } from '@mentra/sdk';

export class VoiceCommandService {
  private spotifyApi: SpotifyApiService;
  private overlay: SpotifyOverlay;
  private session: AppSession | null = null;
  private currentTrackId: string | null = null;

  constructor(spotifyApi: SpotifyApiService, overlay: SpotifyOverlay) {
    this.spotifyApi = spotifyApi;
    this.overlay = overlay;
  }

  setSession(session: AppSession): void {
    this.session = session;
  }

  async initialize(): Promise<void> {
    console.log('🎤 VoiceCommandService initialized for MentraOS');
    // Voice commands will be handled via session.events.onTranscription in the main app
  }

  async processVoiceInput(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase().trim();
    
    // Check for Spotify commands
    if (lowerText.includes('show spotify')) {
      await this.handleVoiceCommand('toggleOverlay');
      return true;
    }
    
    if (lowerText.includes('hide spotify')) {
      await this.handleVoiceCommand('hideOverlay');
      return true;
    }
    
    if (lowerText.includes('next song') || lowerText.includes('skip')) {
      await this.handleVoiceCommand('nextTrack');
      return true;
    }
    
    if (lowerText.includes('previous song')) {
      await this.handleVoiceCommand('previousTrack');
      return true;
    }
    
    if (lowerText.includes('pause music')) {
      await this.handleVoiceCommand('pauseMusic');
      return true;
    }
    
    if (lowerText.includes('play music')) {
      await this.handleVoiceCommand('playMusic');
      return true;
    }
    
    if (lowerText.includes('like this song')) {
      await this.handleVoiceCommand('likeTrack');
      return true;
    }
    
    // Authentication handled through Settings only
    
    return false; // Command not recognized
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

        // Authentication handled through Settings → App Settings only

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
      // Simple feedback through console for now
      console.log(`✅ Voice command executed: ${message}`);
      
      // TODO: Implement proper MentraOS feedback when SDK methods are available
      // For now, we just log the success
    } catch (error) {
      console.warn('Failed to provide feedback:', error);
    }
  }

  setCurrentTrackId(trackId: string | null): void {
    this.currentTrackId = trackId;
  }

  async cleanup(): Promise<void> {
    // Cleanup handled by AppServer automatically
    console.log('🧹 VoiceCommandService cleanup completed');
  }
}