import { SpotifyApiService } from './spotify-api';
import { SpotifyOverlay } from '../ui/overlay';
import { AppSession } from '@mentra/sdk';
export declare class VoiceCommandService {
    private spotifyApi;
    private overlay;
    private session;
    private currentTrackId;
    constructor(spotifyApi: SpotifyApiService, overlay: SpotifyOverlay);
    setSession(session: AppSession): void;
    initialize(): Promise<void>;
    processVoiceInput(text: string): Promise<boolean>;
    private handleVoiceCommand;
    private handleFeedback;
    setCurrentTrackId(trackId: string | null): void;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=voice-commands.d.ts.map