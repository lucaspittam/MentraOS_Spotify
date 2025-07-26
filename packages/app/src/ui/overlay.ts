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

    if (this.state.isOverlayVisible) {
      this.session.layouts.showTextWall('Overlay is visible!\n\nSay "Hide Media" to hide');
    } else {
      this.session.layouts.showTextWall('Say "Show Media" to show overlay');
    }
  }

}
