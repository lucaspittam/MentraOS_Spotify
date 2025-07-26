import { AppServer, AppSession } from '@mentra/sdk';
import { VoiceCommandService } from './services/voice-commands';
import { MediaOverlay } from './ui/overlay';
import { ErrorHandler, ErrorType } from './utils/error-handler';

class MediaControllerApp extends AppServer {
  private errorHandler: ErrorHandler;

  constructor() {
    super({
      packageName: process.env.PACKAGE_NAME || 'com.yourname.media-controller',
      apiKey: process.env.MENTRAOS_API_KEY || '',
      port: parseInt(process.env.PORT || '3000'),
      appInstructions: 'Say "Show Media" to see music controls.',
      permissions: ['microphone'],
    });

    this.errorHandler = ErrorHandler.getInstance();
    this.setupErrorHandlers();
  }

  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    session.logger.info('🚀 Basic MentraOS app started');

    try {
      const overlay = new MediaOverlay();
      overlay.setSession(session);

      const voiceService = new VoiceCommandService(overlay);
      voiceService.setSession(session);

      await overlay.initialize();
      await voiceService.initialize();

      session.events.onTranscription(async (data) => {
        session.logger.info('🎤 Voice input:', data.text);
        const wasHandled = await voiceService.processVoiceInput(data.text);
        if (wasHandled) {
          session.logger.info('✅ Voice command processed:', data.text);
        }
      });
    } catch (error) {
      session.logger.error('❌ Error in session handler:', error);
    }
  }

  protected async onStop(sessionId: string, userId: string, reason: string): Promise<void> {
    console.log(`🛑 Session stopped for user ${userId}: ${reason}`);
  }

  private setupErrorHandlers(): void {
    this.errorHandler.onError(ErrorType.NETWORK, (error) => {
      console.error('🌐 Network error:', error);
    });

    this.errorHandler.onError(ErrorType.API, (error) => {
      console.error('📡 API error:', error);
    });
  }

}

const app = new MediaControllerApp();
app.start().catch(console.error);