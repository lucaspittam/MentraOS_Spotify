import { MediaOverlay } from '../ui/overlay';
import { AppSession } from '@mentra/sdk';
import { MobileCommunicationService } from './mobile-communication';

// This would be defined in a shared core package in a real app
interface MediaCommand {
  command: 'play' | 'pause' | 'next' | 'previous' | 'volume_up' | 'volume_down' | 'seek_forward' | 'seek_backward';
}

export class VoiceCommandService {
  private overlay: MediaOverlay;
  private session: AppSession | null = null;
  private mobileComm: MobileCommunicationService;

  constructor(overlay: MediaOverlay) {
    this.overlay = overlay;
    this.mobileComm = new MobileCommunicationService();
  }

  setSession(session: AppSession): void {
    this.session = session;
    this.mobileComm.setSession(session);
  }

  async initialize(): Promise<void> {
    if (this.session) {
      this.session.logger.info('🎤 VoiceCommandService initialized for MentraOS');
    }
    await this.mobileComm.initialize();
  }

  async processVoiceInput(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase().trim();
    if (this.session) {
      this.session.logger.info('🎤 Processing voice input:', text, '→', lowerText);
    }

    if (lowerText.includes('show media') || lowerText.includes('show music')) {
      this.overlay.show();
      return true;
    }
    
    if (lowerText.includes('hide media') || lowerText.includes('hide music')) {
      this.overlay.hide();
      return true;
    }
    
    if (lowerText.includes('next track') || lowerText.includes('next song') || lowerText.includes('skip')) {
      await this.handleVoiceCommand('next');
      return true;
    }
    
    if (lowerText.includes('previous track') || lowerText.includes('previous song')) {
      await this.handleVoiceCommand('previous');
      return true;
    }
    
    if (lowerText.includes('pause')) {
      await this.handleVoiceCommand('pause');
      return true;
    }
    
    if (lowerText.includes('play') || lowerText.includes('resume')) {
      await this.handleVoiceCommand('play');
      return true;
    }

    if (lowerText.includes('volume up')) {
        await this.handleVoiceCommand('volume_up');
        return true;
    }

    if (lowerText.includes('volume down')) {
        await this.handleVoiceCommand('volume_down');
        return true;
    }

    if (lowerText.includes('seek forward')) {
        await this.handleVoiceCommand('seek_forward');
        return true;
    }

    if (lowerText.includes('seek backward')) {
        await this.handleVoiceCommand('seek_backward');
        return true;
    }
    
    return false; // Command not recognized
  }

  private async handleVoiceCommand(action: MediaCommand['command']): Promise<void> {
    try {
      this.overlay.setLoading(true);

      // Send command to mobile companion app via MentraOS mobile communication
      const success = await this.mobileComm.sendMediaCommand(action);
      if (!success) {
        throw new Error('Failed to send command to mobile app');
      }

      await this.handleFeedback(`Command sent: ${action}`);

    } catch (error) {
      if (this.session) {
        this.session.logger.error(`Error handling voice command ${action}:`, error);
      }
      const errorMessage = `Failed to send command. Check phone connection.`;
      this.overlay.showError(errorMessage);
    } finally {
      this.overlay.setLoading(false);
    }
  }

  private async handleFeedback(message: string): Promise<void> {
    try {
      if (this.session) {
        this.session.logger.info(`✅ Voice command executed: ${message}`);
      }
      // Here you could use session.feedback.vibrate() or similar
    } catch (error) {
      if (this.session) {
        this.session.logger.warn('Failed to provide feedback:', error);
      }
    }
  }
}
