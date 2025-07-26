"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SpotifySettings = () => {
    const [status, setStatus] = (0, react_1.useState)({
        connected: false,
        authUrl: null,
        message: 'Loading...'
    });
    const [currentTrack, setCurrentTrack] = (0, react_1.useState)({
        track: null,
        isPlaying: false
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isDisconnecting, setIsDisconnecting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Get base API URL based on environment
    const getApiBaseUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return process.env.NODE_ENV === 'production'
            ? 'https://your-render-app.onrender.com' // Replace with actual Render URL
            : 'http://localhost:3000';
    };
    const apiBaseUrl = getApiBaseUrl();
    // Fetch Spotify connection status
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/spotify/status`);
            if (!response.ok) {
                throw new Error('Failed to fetch status');
            }
            const data = await response.json();
            setStatus(data);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching Spotify status:', err);
            setError('Failed to check Spotify connection');
            setStatus({
                connected: false,
                authUrl: null,
                message: 'Unable to check connection status'
            });
        }
    };
    // Fetch current track if connected
    const fetchCurrentTrack = async () => {
        if (!status.connected)
            return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/spotify/current-track`);
            if (response.ok) {
                const data = await response.json();
                setCurrentTrack(data);
            }
        }
        catch (err) {
            console.error('Error fetching current track:', err);
        }
    };
    // Handle Spotify connection
    const handleConnect = () => {
        if (status.authUrl) {
            // Open OAuth popup window
            const popup = window.open(status.authUrl, 'spotify-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');
            // Poll for popup closure (indicates auth completion)
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    // Refresh status after auth
                    setTimeout(() => {
                        fetchStatus();
                    }, 1000);
                }
            }, 1000);
        }
    };
    // Handle Spotify disconnection
    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/spotify/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to disconnect');
            }
            await fetchStatus();
            setCurrentTrack({ track: null, isPlaying: false });
            setError(null);
        }
        catch (err) {
            console.error('Error disconnecting from Spotify:', err);
            setError('Failed to disconnect from Spotify');
        }
        finally {
            setIsDisconnecting(false);
        }
    };
    // Initial load and periodic status updates
    (0, react_1.useEffect)(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            await fetchStatus();
            setIsLoading(false);
        };
        loadInitialData();
        // Poll for status updates every 30 seconds
        const statusInterval = setInterval(fetchStatus, 30000);
        return () => clearInterval(statusInterval);
    }, []);
    // Fetch current track when connected
    (0, react_1.useEffect)(() => {
        if (status.connected) {
            fetchCurrentTrack();
            // Poll for current track updates every 10 seconds
            const trackInterval = setInterval(fetchCurrentTrack, 10000);
            return () => clearInterval(trackInterval);
        }
    }, [status.connected]);
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "mentra-settings-panel", children: (0, jsx_runtime_1.jsxs)("div", { className: "loading-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "loading-spinner" }), (0, jsx_runtime_1.jsx)("p", { children: "Loading Spotify settings..." })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mentra-settings-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "settings-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Spotify Integration" }), (0, jsx_runtime_1.jsx)("div", { className: `connection-status ${status.connected ? 'connected' : 'disconnected'}`, children: status.connected ? '✅ Connected' : '❌ Not connected' })] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "error-message", children: [(0, jsx_runtime_1.jsx)("span", { className: "error-icon", children: "\u26A0\uFE0F" }), error] })), (0, jsx_runtime_1.jsxs)("div", { className: "settings-content", children: [(0, jsx_runtime_1.jsx)("p", { className: "status-message", children: status.message }), status.connected ? ((0, jsx_runtime_1.jsxs)("div", { className: "connected-section", children: [currentTrack.track && ((0, jsx_runtime_1.jsxs)("div", { className: "current-track-preview", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Currently Playing" }), (0, jsx_runtime_1.jsxs)("div", { className: "track-info", children: [currentTrack.track.album.images[0] && ((0, jsx_runtime_1.jsx)("img", { src: currentTrack.track.album.images[0].url, alt: "Album Art", className: "album-art" })), (0, jsx_runtime_1.jsxs)("div", { className: "track-details", children: [(0, jsx_runtime_1.jsx)("div", { className: "track-name", children: currentTrack.track.name }), (0, jsx_runtime_1.jsx)("div", { className: "artist-name", children: currentTrack.track.artists.map(artist => artist.name).join(', ') }), (0, jsx_runtime_1.jsx)("div", { className: "album-name", children: currentTrack.track.album.name }), (0, jsx_runtime_1.jsx)("div", { className: `playback-status ${currentTrack.isPlaying ? 'playing' : 'paused'}`, children: currentTrack.isPlaying ? '▶️ Playing' : '⏸️ Paused' })] })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "settings-actions", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleDisconnect, disabled: isDisconnecting, className: "disconnect-button", children: isDisconnecting ? 'Disconnecting...' : 'Disconnect from Spotify' }) }), (0, jsx_runtime_1.jsxs)("div", { className: "usage-info", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Voice Commands Available" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsx)("li", { children: "\"Show Spotify\" - Toggle music overlay" }), (0, jsx_runtime_1.jsx)("li", { children: "\"Next song\" or \"Skip\" - Skip to next track" }), (0, jsx_runtime_1.jsx)("li", { children: "\"Pause music\" - Pause playback" }), (0, jsx_runtime_1.jsx)("li", { children: "\"Play music\" - Resume playback" }), (0, jsx_runtime_1.jsx)("li", { children: "\"Like this song\" - Add to library" }), (0, jsx_runtime_1.jsx)("li", { children: "\"Previous song\" - Go to previous track" })] })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "disconnected-section", children: [(0, jsx_runtime_1.jsx)("div", { className: "settings-actions", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleConnect, disabled: !status.authUrl, className: "connect-button", children: "Connect to Spotify" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "connection-info", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Setup Instructions" }), (0, jsx_runtime_1.jsxs)("ol", { children: [(0, jsx_runtime_1.jsx)("li", { children: "Click \"Connect to Spotify\" above" }), (0, jsx_runtime_1.jsx)("li", { children: "Log in to your Spotify account" }), (0, jsx_runtime_1.jsx)("li", { children: "Grant permissions for the app" }), (0, jsx_runtime_1.jsx)("li", { children: "Return to MentraOS and start using voice commands!" })] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Note:" }), " You need a Spotify Premium account to control playback."] })] })] }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
        .mentra-settings-panel {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .settings-header h2 {
          margin: 0;
          color: #1db954;
          font-size: 24px;
        }

        .connection-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .connection-status.connected {
          background-color: #d4edda;
          color: #155724;
        }

        .connection-status.disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .loading-state {
          text-align: center;
          padding: 40px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-left: 4px solid #1db954;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }

        .error-icon {
          margin-right: 8px;
        }

        .status-message {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }

        .current-track-preview {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .current-track-preview h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .track-info {
          display: flex;
          align-items: center;
        }

        .album-art {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          margin-right: 15px;
          object-fit: cover;
        }

        .track-details {
          flex: 1;
        }

        .track-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .artist-name {
          font-size: 14px;
          color: #666;
          margin-bottom: 3px;
        }

        .album-name {
          font-size: 13px;
          color: #888;
          margin-bottom: 8px;
        }

        .playback-status {
          font-size: 14px;
          font-weight: 500;
        }

        .playback-status.playing {
          color: #1db954;
        }

        .playback-status.paused {
          color: #666;
        }

        .settings-actions {
          margin: 25px 0;
        }

        .connect-button, .disconnect-button {
          background-color: #1db954;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .connect-button:hover {
          background-color: #1aa34a;
        }

        .disconnect-button {
          background-color: #dc3545;
        }

        .disconnect-button:hover {
          background-color: #c82333;
        }

        .connect-button:disabled, .disconnect-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .usage-info, .connection-info {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .usage-info h3, .connection-info h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .usage-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .usage-info li {
          margin-bottom: 8px;
          color: #555;
        }

        .connection-info ol {
          margin: 0 0 15px 0;
          padding-left: 20px;
        }

        .connection-info li {
          margin-bottom: 8px;
          color: #555;
        }

        .connection-info p {
          margin: 15px 0 0 0;
          color: #666;
          font-style: italic;
        }
      ` })] }));
};
exports.default = SpotifySettings;
//# sourceMappingURL=SpotifySettings.js.map