export interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  expires_at: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  product: string;
  country: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  genres?: string[];
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  release_date: string;
  artists: SpotifyArtist[];
  total_tracks: number;
  album_type: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
  popularity: number;
  explicit: boolean;
  track_number: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

export interface SpotifySearchResults {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
  };
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export interface DownloadedTrack extends SpotifyTrack {
  offline_url: string;
  downloaded_at: number;
  size_bytes: number;
}

export interface DownloadedAlbum extends SpotifyAlbum {
  tracks: DownloadedTrack[];
  downloaded_at: number;
  size_bytes: number;
}

export interface DownloadedPlaylist extends SpotifyPlaylist {
  tracks: DownloadedTrack[];
  downloaded_at: number;
  size_bytes: number;
}

export interface OfflineLibrary {
  tracks: Record<string, DownloadedTrack>;
  albums: Record<string, DownloadedAlbum>;
  playlists: Record<string, DownloadedPlaylist>;
}

export interface EQPreset {
  id: string;
  name: string;
  bass: number;
  mid: number;
  treble: number;
  isDefault?: boolean;
}