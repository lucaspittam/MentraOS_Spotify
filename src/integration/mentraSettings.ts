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
export async function registerSpotifySettingsPanel(): Promise<void> {
  try {
    // Check if MentraOS SDK is available
    if (typeof window === 'undefined') {
      console.log('MentraOS integration: Running in server environment, skipping registration');
      return;
    }

    // Dynamic import of MentraOS SDK to avoid issues in server environment
    let mentra: any;
    try {
      mentra = await import('@mentra/sdk');
    } catch (error) {
      console.warn('MentraOS SDK not available, settings panel will not be registered:', error);
      return;
    }

    // Create simple HTML-based settings interface
    const createSettingsHTML = async (): Promise<string> => {
      // Get current status from API
      const baseUrl = window.location.origin;
      let statusData: any = { connected: false, authUrl: null, message: 'Loading...' };
      
      try {
        const response = await fetch(`${baseUrl}/api/spotify/status`);
        if (response.ok) {
          statusData = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch status for settings:', error);
      }

      return `
        <div id="spotify-settings-container" style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1db954; margin: 0 0 10px 0;">🎵 Spotify Integration</h2>
            <div id="connection-status" style="
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              ${statusData.connected ? 
                'background-color: #d4edda; color: #155724;' : 
                'background-color: #f8d7da; color: #721c24;'
              }
            ">
              ${statusData.connected ? '✅ Connected' : '❌ Not connected'}
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <p id="status-message" style="color: #666; margin-bottom: 20px;">
              ${statusData.message}
            </p>

            ${!statusData.connected ? `
              <button id="connect-spotify-btn" onclick="connectSpotify()" style="
                background-color: #1db954;
                color: white;
                border: none;
                border-radius: 25px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.backgroundColor='#1aa34a'" 
                 onmouseout="this.style.backgroundColor='#1db954'">
                Connect to Spotify
              </button>
            ` : `
              <button id="disconnect-spotify-btn" onclick="disconnectSpotify()" style="
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 25px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.backgroundColor='#c82333'" 
                 onmouseout="this.style.backgroundColor='#dc3545'">
                Disconnect from Spotify
              </button>
            `}
          </div>

          <div style="
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          ">
            <h3 style="margin: 0 0 15px 0; color: #333;">🎤 Voice Commands</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 5px;">"Show Spotify" - Toggle music overlay</li>
              <li style="margin-bottom: 5px;">"Next song" or "Skip" - Skip to next track</li>
              <li style="margin-bottom: 5px;">"Pause music" - Pause playback</li>
              <li style="margin-bottom: 5px;">"Play music" - Resume playback</li>
              <li style="margin-bottom: 5px;">"Like this song" - Add to library</li>
              <li style="margin-bottom: 5px;">"Previous song" - Go to previous track</li>
            </ul>
          </div>
        </div>

        <script>
          window.connectSpotify = function() {
            const authUrl = '${statusData.authUrl || baseUrl + '/auth'}';
            const popup = window.open(authUrl, 'spotify-auth', 'width=500,height=600');
            
            const checkClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkClosed);
                setTimeout(() => location.reload(), 1000);
              }
            }, 1000);
          };

          window.disconnectSpotify = function() {
            const btn = document.getElementById('disconnect-spotify-btn');
            if (btn) {
              btn.textContent = 'Disconnecting...';
              btn.disabled = true;
            }

            fetch('${baseUrl}/api/spotify/disconnect', { method: 'POST' })
              .then(response => response.json())
              .then(() => {
                setTimeout(() => location.reload(), 500);
              })
              .catch(error => {
                console.error('Disconnect failed:', error);
                if (btn) {
                  btn.textContent = 'Disconnect from Spotify';
                  btn.disabled = false;
                }
              });
          };
        </script>
      `;
    };

    // Register the settings panel with MentraOS
    const settingsConfig = {
      id: 'spotify-integration',
      title: 'Spotify',
      description: 'Control Spotify playback with voice commands',
      icon: '🎵',
      category: 'integrations',
      render: async () => {
        return await createSettingsHTML();
      }
    };

    // Try different registration approaches based on available APIs
    if (mentra.default && typeof mentra.default.registerSettingsPanel === 'function') {
      await mentra.default.registerSettingsPanel(settingsConfig);
      console.log('✅ Spotify settings panel registered successfully with MentraOS');
    } else if (mentra.ui && typeof mentra.ui.registerSettingsPanel === 'function') {
      await mentra.ui.registerSettingsPanel(settingsConfig);
      console.log('✅ Spotify settings panel registered successfully with MentraOS (ui API)');
    } else if (mentra.registerComponent && typeof mentra.registerComponent === 'function') {
      await mentra.registerComponent('spotify-settings', settingsConfig);
      console.log('✅ Spotify settings registered using component API');
    } else {
      console.warn('⚠️ MentraOS settings registration API not found. Available methods:', Object.keys(mentra));
      console.log('Available in mentra.default:', mentra.default ? Object.keys(mentra.default) : 'none');
      
      // Store the config for manual registration
      (window as any).spotifySettingsConfig = settingsConfig;
      console.log('📦 Spotify settings config stored in window.spotifySettingsConfig for manual registration');
    }

  } catch (error) {
    console.error('❌ Failed to register Spotify settings panel with MentraOS:', error);
    throw error;
  }
}

/**
 * Auto-register the settings panel when the DOM is loaded
 * This ensures the settings panel is available as soon as the page loads
 */
function autoRegisterOnDOMLoad(): void {
  if (typeof window === 'undefined') {
    return; // Skip in server environment
  }

  const registerWhenReady = async () => {
    try {
      await registerSpotifySettingsPanel();
    } catch (error) {
      console.error('Auto-registration failed:', error);
      // Retry after a delay
      setTimeout(registerWhenReady, 5000);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerWhenReady);
  } else {
    // DOM is already loaded
    registerWhenReady();
  }
}

/**
 * Manual registration function for external use
 * This can be called by other parts of the application if needed
 */
export function initializeSpotifySettings(): void {
  registerSpotifySettingsPanel().catch(error => {
    console.error('Manual Spotify settings initialization failed:', error);
  });
}

/**
 * Check if MentraOS is available and settings can be registered
 */
export async function checkMentraOSAvailability(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    const mentra = await import('@mentra/sdk');
    return !!(mentra);
  } catch (error) {
    return false;
  }
}

// Auto-register when this module is loaded in a browser environment
autoRegisterOnDOMLoad();

// Make registration function globally available for debugging
if (typeof window !== 'undefined') {
  window.registerSpotifySettings = initializeSpotifySettings;
}

// Export the main registration function as default
export default registerSpotifySettingsPanel;