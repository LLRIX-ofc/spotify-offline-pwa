import localforage from 'localforage';
import { 
  SpotifyTrack, 
  SpotifyAlbum, 
  SpotifyPlaylist,
  DownloadedTrack,
  DownloadedAlbum,
  DownloadedPlaylist,
  OfflineLibrary
} from '../types/spotify';
import { getAlbum, getPlaylist } from './apiService';

// Initialize IndexedDB stores
const tracksStore = localforage.createInstance({
  name: 'spotify-offline',
  storeName: 'tracks'
});

const metadataStore = localforage.createInstance({
  name: 'spotify-offline',
  storeName: 'metadata'
});

// Mock download function that simulates accessing a proxy service
// In a real app, this would connect to a backend proxy for downloading
const mockDownloadTrack = async (track: SpotifyTrack): Promise<ArrayBuffer> => {
  // This is a placeholder that returns a small audio buffer
  // In a real implementation, this would call your backend proxy
  console.log(`Downloading track: ${track.name} by ${track.artists[0].name}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create a small audio buffer (this would be real audio data in production)
  const buffer = new ArrayBuffer(1024 * 50); // 50KB mock buffer
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  
  return buffer;
};

// Save track audio data to IndexedDB
export const downloadTrack = async (track: SpotifyTrack): Promise<DownloadedTrack> => {
  try {
    // Check if track is already downloaded
    const existingTrack = await metadataStore.getItem<DownloadedTrack>(track.id);
    if (existingTrack) {
      return existingTrack;
    }
    
    // Download the track (in real implementation, this calls the proxy)
    const audioBuffer = await mockDownloadTrack(track);
    
    // Save audio data to IndexedDB
    await tracksStore.setItem(track.id, audioBuffer);
    
    // Create downloaded track metadata
    const downloadedTrack: DownloadedTrack = {
      ...track,
      offline_url: `idb://${track.id}`,
      downloaded_at: Date.now(),
      size_bytes: audioBuffer.byteLength
    };
    
    // Save metadata
    await metadataStore.setItem(track.id, downloadedTrack);
    
    // Update library cache
    await updateLibraryCache('tracks', downloadedTrack);
    
    return downloadedTrack;
  } catch (error) {
    console.error('Error downloading track:', error);
    throw new Error(`Failed to download track: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Download all tracks from an album
export const downloadAlbum = async (albumId: string): Promise<DownloadedAlbum> => {
  try {
    // Check if album is already downloaded
    const existingAlbum = await metadataStore.getItem<DownloadedAlbum>(`album:${albumId}`);
    if (existingAlbum) {
      return existingAlbum;
    }
    
    // Get album with tracks
    const album = await getAlbum(albumId);
    
    // Download all tracks
    const downloadedTracks: DownloadedTrack[] = [];
    let totalSize = 0;
    
    for (const trackItem of album.tracks.items) {
      const downloadedTrack = await downloadTrack(trackItem);
      downloadedTracks.push(downloadedTrack);
      totalSize += downloadedTrack.size_bytes;
    }
    
    // Create downloaded album metadata
    const downloadedAlbum: DownloadedAlbum = {
      ...album,
      tracks: downloadedTracks,
      downloaded_at: Date.now(),
      size_bytes: totalSize
    };
    
    // Save album metadata
    await metadataStore.setItem(`album:${albumId}`, downloadedAlbum);
    
    // Update library cache
    await updateLibraryCache('albums', downloadedAlbum);
    
    return downloadedAlbum;
  } catch (error) {
    console.error('Error downloading album:', error);
    throw new Error(`Failed to download album: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Download all tracks from a playlist
export const downloadPlaylist = async (playlistId: string): Promise<DownloadedPlaylist> => {
  try {
    // Check if playlist is already downloaded
    const existingPlaylist = await metadataStore.getItem<DownloadedPlaylist>(`playlist:${playlistId}`);
    if (existingPlaylist) {
      return existingPlaylist;
    }
    
    // Get playlist with tracks
    const playlist = await getPlaylist(playlistId);
    
    // Download all tracks
    const downloadedTracks: DownloadedTrack[] = [];
    let totalSize = 0;
    
    for (const item of playlist.tracks.items) {
      const downloadedTrack = await downloadTrack(item.track);
      downloadedTracks.push(downloadedTrack);
      totalSize += downloadedTrack.size_bytes;
    }
    
    // Create downloaded playlist metadata
    const downloadedPlaylist: DownloadedPlaylist = {
      ...playlist,
      tracks: downloadedTracks,
      downloaded_at: Date.now(),
      size_bytes: totalSize
    };
    
    // Save playlist metadata
    await metadataStore.setItem(`playlist:${playlistId}`, downloadedPlaylist);
    
    // Update library cache
    await updateLibraryCache('playlists', downloadedPlaylist);
    
    return downloadedPlaylist;
  } catch (error) {
    console.error('Error downloading playlist:', error);
    throw new Error(`Failed to download playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get track audio data from IndexedDB
export const getTrackAudio = async (trackId: string): Promise<ArrayBuffer | null> => {
  try {
    return await tracksStore.getItem<ArrayBuffer>(trackId);
  } catch (error) {
    console.error('Error getting track audio:', error);
    return null;
  }
};

// Delete a downloaded track
export const deleteTrack = async (trackId: string): Promise<void> => {
  try {
    // Get track metadata
    const track = await metadataStore.getItem<DownloadedTrack>(trackId);
    if (!track) return;
    
    // Delete audio data and metadata
    await tracksStore.removeItem(trackId);
    await metadataStore.removeItem(trackId);
    
    // Update library cache
    await removeFromLibraryCache('tracks', trackId);
  } catch (error) {
    console.error('Error deleting track:', error);
    throw new Error(`Failed to delete track: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete a downloaded album
export const deleteAlbum = async (albumId: string): Promise<void> => {
  try {
    // Get album metadata
    const album = await metadataStore.getItem<DownloadedAlbum>(`album:${albumId}`);
    if (!album) return;
    
    // Delete all tracks
    for (const track of album.tracks) {
      await tracksStore.removeItem(track.id);
      await metadataStore.removeItem(track.id);
      await removeFromLibraryCache('tracks', track.id);
    }
    
    // Delete album metadata
    await metadataStore.removeItem(`album:${albumId}`);
    
    // Update library cache
    await removeFromLibraryCache('albums', albumId);
  } catch (error) {
    console.error('Error deleting album:', error);
    throw new Error(`Failed to delete album: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete a downloaded playlist
export const deletePlaylist = async (playlistId: string): Promise<void> => {
  try {
    // Get playlist metadata
    const playlist = await metadataStore.getItem<DownloadedPlaylist>(`playlist:${playlistId}`);
    if (!playlist) return;
    
    // Delete all tracks that are only in this playlist
    for (const track of playlist.tracks) {
      // Check if track is in any other playlists or albums before deleting
      const isInOtherCollections = await isTrackInOtherCollections(track.id, playlistId);
      if (!isInOtherCollections) {
        await tracksStore.removeItem(track.id);
        await metadataStore.removeItem(track.id);
        await removeFromLibraryCache('tracks', track.id);
      }
    }
    
    // Delete playlist metadata
    await metadataStore.removeItem(`playlist:${playlistId}`);
    
    // Update library cache
    await removeFromLibraryCache('playlists', playlistId);
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw new Error(`Failed to delete playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Check if a track is in collections other than the specified one
const isTrackInOtherCollections = async (trackId: string, excludeId: string): Promise<boolean> => {
  const library = await getLibrary();
  
  // Check albums
  for (const albumId in library.albums) {
    if (library.albums[albumId].tracks.some(track => track.id === trackId)) {
      return true;
    }
  }
  
  // Check playlists (excluding the one being deleted)
  for (const playlistId in library.playlists) {
    if (playlistId !== excludeId && 
        library.playlists[playlistId].tracks.some(track => track.id === trackId)) {
      return true;
    }
  }
  
  return false;
};

// Library cache management
const LIBRARY_CACHE_KEY = 'library_cache';

// Initialize or get the library cache
export const getLibrary = async (): Promise<OfflineLibrary> => {
  try {
    const cachedLibrary = await metadataStore.getItem<OfflineLibrary>(LIBRARY_CACHE_KEY);
    return cachedLibrary || { tracks: {}, albums: {}, playlists: {} };
  } catch (error) {
    console.error('Error getting library cache:', error);
    return { tracks: {}, albums: {}, playlists: {} };
  }
};

// Update the library cache with a new item
const updateLibraryCache = async (
  type: 'tracks' | 'albums' | 'playlists',
  item: DownloadedTrack | DownloadedAlbum | DownloadedPlaylist
): Promise<void> => {
  try {
    const library = await getLibrary();
    
    if (type === 'tracks') {
      library.tracks[item.id] = item as DownloadedTrack;
    } else if (type === 'albums') {
      library.albums[item.id] = item as DownloadedAlbum;
    } else if (type === 'playlists') {
      library.playlists[item.id] = item as DownloadedPlaylist;
    }
    
    await metadataStore.setItem(LIBRARY_CACHE_KEY, library);
  } catch (error) {
    console.error('Error updating library cache:', error);
  }
};

// Remove an item from the library cache
const removeFromLibraryCache = async (
  type: 'tracks' | 'albums' | 'playlists',
  itemId: string
): Promise<void> => {
  try {
    const library = await getLibrary();
    
    if (type === 'tracks' && library.tracks[itemId]) {
      delete library.tracks[itemId];
    } else if (type === 'albums' && library.albums[itemId]) {
      delete library.albums[itemId];
    } else if (type === 'playlists' && library.playlists[itemId]) {
      delete library.playlists[itemId];
    }
    
    await metadataStore.setItem(LIBRARY_CACHE_KEY, library);
  } catch (error) {
    console.error('Error removing from library cache:', error);
  }
};

// Calculate total cache size
export const getCacheSize = async (): Promise<{ 
  tracks: number; 
  albums: number; 
  playlists: number; 
  total: number; 
}> => {
  const library = await getLibrary();
  
  let tracksSize = 0;
  let albumsSize = 0;
  let playlistsSize = 0;
  
  // Sum up track sizes
  Object.values(library.tracks).forEach(track => {
    tracksSize += track.size_bytes;
  });
  
  // Sum up album sizes
  Object.values(library.albums).forEach(album => {
    albumsSize += album.size_bytes;
  });
  
  // Sum up playlist sizes
  Object.values(library.playlists).forEach(playlist => {
    playlistsSize += playlist.size_bytes;
  });
  
  return {
    tracks: tracksSize,
    albums: albumsSize,
    playlists: playlistsSize,
    total: tracksSize + albumsSize + playlistsSize
  };
};

// Clear all cache
export const clearAllCache = async (): Promise<void> => {
  try {
    await tracksStore.clear();
    await metadataStore.clear();
    await metadataStore.setItem(LIBRARY_CACHE_KEY, { tracks: {}, albums: {}, playlists: {} });
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw new Error(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};