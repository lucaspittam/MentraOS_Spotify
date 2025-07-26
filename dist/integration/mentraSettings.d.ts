declare global {
    interface Window {
        mentra?: any;
        registerSpotifySettings?: () => void;
    }
}
/**
 * Register the Spotify settings with MentraOS
 * This function provides a simple HTML-based settings interface
 */
export declare function registerSpotifySettingsPanel(): Promise<void>;
/**
 * Manual registration function for external use
 * This can be called by other parts of the application if needed
 */
export declare function initializeSpotifySettings(): void;
/**
 * Check if MentraOS is available and settings can be registered
 */
export declare function checkMentraOSAvailability(): Promise<boolean>;
export default registerSpotifySettingsPanel;
//# sourceMappingURL=mentraSettings.d.ts.map