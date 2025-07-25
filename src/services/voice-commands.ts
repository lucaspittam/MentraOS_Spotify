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
    
    if (lowerText.includes('connect') && !lowerText.includes('disconnect')) {
      await this.handleVoiceCommand('connectSpotify');
      return true;
    }
    
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

        case 'connectSpotify':
          if (this.session) {
            const authUrl = 'https://mentraos-spotify-vhjh.onrender.com/auth';
            
            // Try to generate a notification to the phone if possible
            try {
              // This will show the URL prominently for easy access
              const text = `🔗 Connecting Spotify...\n\n📱 Open this on your phone:\n${authUrl}\n\n(Link will open Spotify login)`;
              this.session.layouts.showTextWall(text);
              
              // Provide haptic feedback to indicate action
              await this.handleFeedback('Spotify login link displayed. Open the URL on your phone to continue.');
            } catch (error) {
              console.error('Error showing auth URL:', error);
              this.overlay.showError('Failed to display authentication URL');
            }
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
      await (mentra as any).feedback.haptic('light');
      await (mentra as any).feedback.audio('success');
      
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
      await (mentra as any).voice.unregisterAllCommands();
    } catch (error) {
      console.error('Error cleaning up voice commands:', error);
    }
  }
}