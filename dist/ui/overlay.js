"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyOverlay = void 0;
class SpotifyOverlay {
    constructor() {
        this.session = null;
        this.state = {
            isOverlayVisible: false,
            currentTrack: null,
            isLoading: false,
            error: null
        };
    }
    async initialize() {
        console.log('🎨 SpotifyOverlay initialized for MentraOS');
    }
    setSession(session) {
        this.session = session;
    }
    show() {
        console.log('🎨 Overlay: show() called');
        this.state.isOverlayVisible = true;
        console.log('🎨 Overlay state after show:', {
            isVisible: this.state.isOverlayVisible,
            hasSession: !!this.session,
            hasCurrentTrack: !!this.state.currentTrack,
            trackName: this.state.currentTrack?.name || 'No track'
        });
        if (this.session && this.state.currentTrack) {
            console.log('🎨 Displaying current track');
            this.displayCurrentTrack();
        }
        else if (this.session) {
            console.log('🎨 No current track, displaying no music display');
            this.displayCurrentTrack(); // This will show "No Music Playing"
        }
        else {
            console.log('🎨 No session available');
        }
    }
    hide() {
        console.log('🎨 Overlay: hide() called');
        this.state.isOverlayVisible = false;
        if (this.session) {
            const text = `Spotify Controller

Say "Show Spotify" for controls

Commands available:
- "next song"
- "pause music" 
- "play music"`;
            this.session.layouts.showTextWall(text);
        }
    }
    toggle() {
        console.log('🎨 Overlay: toggle() called, current visibility:', this.state.isOverlayVisible);
        if (this.state.isOverlayVisible) {
            console.log('🎨 Overlay currently visible, hiding it');
            this.hide();
        }
        else {
            console.log('🎨 Overlay currently hidden, showing it');
            this.show();
        }
    }
    updateTrack(track) {
        console.log('🎨 Overlay: updateTrack called', {
            hasTrack: !!track,
            trackName: track?.name || 'No track',
            isOverlayVisible: this.state.isOverlayVisible,
            hasSession: !!this.session
        });
        this.state.currentTrack = track;
        if (this.session && this.state.isOverlayVisible) {
            console.log('🎨 Overlay: Displaying current track');
            this.displayCurrentTrack();
        }
        else {
            console.log('🎨 Overlay: Not displaying - overlay not visible or no session');
        }
    }
    displayCurrentTrack() {
        if (!this.session)
            return;
        if (this.state.currentTrack) {
            const track = this.state.currentTrack;
            const artists = track.artists.map(a => a.name).join(', ');
            const text = `Now Playing:
${track.name}
by ${artists}

Commands:
- "next song"
- "pause music"
- "play music"`;
            this.session.layouts.showTextWall(text);
        }
        else {
            const text = `Spotify Controller

No music playing

Start music on Spotify first

Commands:
- "next song" 
- "pause music"
- "play music"`;
            this.session.layouts.showTextWall(text);
        }
    }
    setLoading(loading) {
        this.state.isLoading = loading;
        if (this.session && this.state.isOverlayVisible && loading) {
            const text = `Loading...

Processing command...`;
            this.session.layouts.showTextWall(text);
        }
    }
    showError(error) {
        this.state.error = error;
        if (this.session && error) {
            const text = `Error

${error}

Try again`;
            this.session.layouts.showTextWall(text);
        }
    }
    getState() {
        return { ...this.state };
    }
}
exports.SpotifyOverlay = SpotifyOverlay;
//# sourceMappingURL=overlay.js.map