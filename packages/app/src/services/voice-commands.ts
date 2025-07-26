import { MediaOverlay } from '../ui/overlay';
import { AppSession } from '@mentra/sdk';

export class VoiceCommandService {
  private overlay: MediaOverlay;
  private session: AppSession | null = null;

  constructor(overlay: MediaOverlay) {
    this.overlay = overlay;
  }

  setSession(session: AppSession): void {
    this.session = session;
  }

  async initialize(): Promise<void> {
    if (this.session) {
      this.session.logger.info('🎤 VoiceCommandService initialized for MentraOS');
    }
  }

  async processVoiceInput(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase().trim();
    if (this.session) {
      this.session.logger.info('🎤 Voice input:', text);
    }

    if (lowerText.includes('show media')) {
      this.overlay.show();
      return true;
    }
    
    if (lowerText.includes('hide media')) {
      this.overlay.hide();
      return true;
    }
    
    return false;
  }
}
