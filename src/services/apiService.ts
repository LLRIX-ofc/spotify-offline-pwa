import axios from 'axios';
import { getToken } from './authService';
import { 
  SpotifySearchResults, 
  SpotifyTrack, 
  SpotifyAlbum, 
  SpotifyArtist, 
  SpotifyPlaylist, 
  SpotifyUser
} from '../types/spotify';

const API_BASE_URL = 'https://api.spotify.com/v1';

// Create axios instance with interceptor to handle auth
const spotifyApi = axios.create({
  baseURL: API_BASE_URL,
});

spotifyApi.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// API methods
export const getCurrentUser = async (): Promise<SpotifyUser> => {
  const response = await spotifyApi.get('/me');
  return response.data;
};

export const searchSpotify = async (
  query: string, 
  types: ('track' | 'album' | 'artist' | 'playlist')[] = ['track', 'album', 'artist', 'playlist'],
  limit: number = 20
): Promise<SpotifySearchResults> => {
  const response = await spotifyApi.get('/search', {
    params: {
      q: query,
      type: types.join(','),
      limit,
    },
  });
  return response.data;
};

export const getTrack = async (trackId: string): Promise<SpotifyTrack> => {
  const response = await spotifyApi.get(`/tracks/${trackId}`);
  return response.data;
};

export const getAlbum = async (albumId: string): Promise<SpotifyAlbum & { tracks: { items: SpotifyTrack[] } }> => {
  const response = await spotifyApi.get(`/albums/${albumId}`);
  return response.data;
};

export const getAlbumTracks = async (albumId: string, limit: number = 50, offset: number = 0): Promise<{ items: SpotifyTrack[] }> => {
  const response = await spotifyApi.get(`/albums/${albumId}/tracks`, {
    params: { limit, offset },
  });
  return response.data;
};

export const getArtist = async (artistId: string): Promise<SpotifyArtist> => {
  const response = await spotifyApi.get(`/artists/${artistId}`);
  return response.data;
};

export const getArtistAlbums = async (
  artistId: string, 
  includeGroups: ('album' | 'single' | 'appears_on' | 'compilation')[] = ['album'],
  limit: number = 20, 
  offset: number = 0
): Promise<{ items: SpotifyAlbum[] }> => {
  const response = await spotifyApi.get(`/artists/${artistId}/albums`, {
    params: {
      include_groups: includeGroups.join(','),
      limit,
      offset,
    },
  });
  return response.data;
};

export const getArtistTopTracks = async (artistId: string, market: string = 'US'): Promise<{ tracks: SpotifyTrack[] }> => {
  const response = await spotifyApi.get(`/artists/${artistId}/top-tracks`, {
    params: { market },
  });
  return response.data;
};

export const getRelatedArtists = async (artistId: string): Promise<{ artists: SpotifyArtist[] }> => {
  const response = await spotifyApi.get(`/artists/${artistId}/related-artists`);
  return response.data;
};

export const getPlaylist = async (playlistId: string): Promise<SpotifyPlaylist & { tracks: { items: { track: SpotifyTrack }[] } }> => {
  const response = await spotifyApi.get(`/playlists/${playlistId}`);
  return response.data;
};

export const getUserPlaylists = async (limit: number = 20, offset: number = 0): Promise<{ items: SpotifyPlaylist[] }> => {
  const response = await spotifyApi.get('/me/playlists', {
    params: { limit, offset },
  });
  return response.data;
};

export const getUserSavedTracks = async (limit: number = 20, offset: number = 0): Promise<{ items: { track: SpotifyTrack }[] }> => {
  const response = await spotifyApi.get('/me/tracks', {
    params: { limit, offset },
  });
  return response.data;
};

export const getUserSavedAlbums = async (limit: number = 20, offset: number = 0): Promise<{ items: { album: SpotifyAlbum }[] }> => {
  const response = await spotifyApi.get('/me/albums', {
    params: { limit, offset },
  });
  return response.data;
};