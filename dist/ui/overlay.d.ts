import { SpotifyTrack, UIState } from '../types';
import { AppSession } from '@mentra/sdk';
export declare class SpotifyOverlay {
    private session;
    private state;
    initialize(): Promise<void>;
    setSession(session: AppSession): void;
    show(): void;
    hide(): void;
    toggle(): void;
    updateTrack(track: SpotifyTrack | null): void;
    private displayCurrentTrack;
    setLoading(loading: boolean): void;
    showError(error: string | null): void;
    getState(): UIState;
}
//# sourceMappingURL=overlay.d.ts.map