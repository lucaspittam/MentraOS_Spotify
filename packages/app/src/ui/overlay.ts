import { UIState } from '../types';
import { AppSession } from '@mentra/sdk';

export class MediaOverlay {
  private session: AppSession | null = null;
  private state: UIState = {
    isOverlayVisible: false,
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

  private render(): void {
    if (!this.session) return;

    // Get custom message from settings if available
    const customMessage = this.session.settings?.get('custom_message') || 'Say "Show Media" to show overlay';
    const displayMode = this.session.settings?.get('display_mode') || 'standard';

    if (this.state.isOverlayVisible) {
      let text = 'Overlay is visible!\n\nSay "Hide Media" to hide';
      
      if (displayMode === 'minimal') {
        text = 'Overlay ON';
      } else if (displayMode === 'detailed') {
        text = 'Overlay Status: VISIBLE\n\nVoice Commands:\n• "Hide Media" - Hide overlay\n• Try other voice commands!';
      }
      
      this.session.layouts.showTextWall(text);
    } else {
      this.session.layouts.showTextWall(customMessage);
    }
  }

}
