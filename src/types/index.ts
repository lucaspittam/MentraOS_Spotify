export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  is_playing: boolean;
}

export interface SpotifyCurrentlyPlaying {
  item: SpotifyTrack | null;
  is_playing: boolean;
  progress_ms: number;
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AppConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface VoiceCommand {
  phrase: string;
  action: string;
}

export interface UIState {
  isOverlayVisible: boolean;
  currentTrack: SpotifyTrack | null;
  isLoading: boolean;
  error: string | null;
}