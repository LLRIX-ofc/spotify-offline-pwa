import axios from 'axios';
import { SpotifyToken } from '../types/spotify';

// Constants
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'YOUR_CLIENT_ID';
const REDIRECT_URI = `${window.location.origin}/spotify-offline-pwa/callback`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played'
].join(' ');

// Local storage keys
const TOKEN_KEY = 'spotify_token';
const CODE_VERIFIER_KEY = 'code_verifier';
const STATE_KEY = 'auth_state';

// Helper functions
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map(x => possible[x % possible.length])
    .join('');
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
};

const base64URLEncode = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const getLocalToken = (): SpotifyToken | null => {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  if (!tokenStr) return null;
  
  try {
    const token = JSON.parse(tokenStr) as SpotifyToken;
    if (Date.now() >= token.expires_at) {
      return null;
    }
    return token;
  } catch (error) {
    return null;
  }
};

// Authorization functions
export const initiateLogin = async (): Promise<void> => {
  // Generate and store PKCE code verifier
  const codeVerifier = generateRandomString(64);
  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
  
  // Generate state parameter
  const state = generateRandomString(16);
  localStorage.setItem(STATE_KEY, state);
  
  // Generate code challenge
  const buffer = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(buffer);
  
  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
    scope: SCOPES,
  });
  
  // Redirect to Spotify authorization
  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
};

export const handleCallback = async (code: string, state: string): Promise<SpotifyToken> => {
  // Verify state parameter
  const storedState = localStorage.getItem(STATE_KEY);
  if (!state || state !== storedState) {
    throw new Error('State mismatch');
  }
  
  // Retrieve code verifier
  const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }
  
  // Exchange code for token
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });
    
    const response = await axios.post(SPOTIFY_TOKEN_ENDPOINT, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Calculate expiration time
    const expiresAt = Date.now() + response.data.expires_in * 1000;
    const token: SpotifyToken = {
      ...response.data,
      expires_at: expiresAt,
    };
    
    // Store token
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    
    // Clean up
    localStorage.removeItem(CODE_VERIFIER_KEY);
    localStorage.removeItem(STATE_KEY);
    
    return token;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw new Error('Failed to exchange code for token');
  }
};

export const refreshToken = async (): Promise<SpotifyToken> => {
  const token = getLocalToken();
  if (!token?.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    });
    
    const response = await axios.post(SPOTIFY_TOKEN_ENDPOINT, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Calculate expiration time
    const expiresAt = Date.now() + response.data.expires_in * 1000;
    const newToken: SpotifyToken = {
      ...response.data,
      refresh_token: response.data.refresh_token || token.refresh_token,
      expires_at: expiresAt,
    };
    
    // Store updated token
    localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
    
    return newToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh token');
  }
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/spotify-offline-pwa/';
};

export const getToken = async (): Promise<string> => {
  let token = getLocalToken();
  
  // If token exists but is expired, refresh it
  if (token && Date.now() >= token.expires_at - 60000) { // 1 minute buffer
    try {
      token = await refreshToken();
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error('Token expired and refresh failed');
    }
  }
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  return token.access_token;
};

export const isAuthenticated = (): boolean => {
  const token = getLocalToken();
  return !!token && Date.now() < token.expires_at;
};