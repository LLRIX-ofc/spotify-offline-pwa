import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  OfflineLibrary, 
  DownloadedTrack, 
  DownloadedAlbum, 
  DownloadedPlaylist,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist
} from '../../types/spotify';
import { 
  getLibrary, 
  downloadTrack, 
  downloadAlbum, 
  downloadPlaylist,
  deleteTrack,
  deleteAlbum,
  deletePlaylist,
  getCacheSize,
  clearAllCache
} from '../../services/downloadService';

interface LibraryState {
  library: OfflineLibrary;
  currentlyPlaying: DownloadedTrack | null;
  currentTrackIndex: number;
  currentPlaylist: DownloadedTrack[] | null;
  isLoading: boolean;
  cacheSize: {
    tracks: number;
    albums: number;
    playlists: number;
    total: number;
  };
  downloadProgress: {
    isDownloading: boolean;
    total: number;
    completed: number;
    currentItem: string;
  };
  error: string | null;
}

const initialState: LibraryState = {
  library: { tracks: {}, albums: {}, playlists: {} },
  currentlyPlaying: null,
  currentTrackIndex: -1,
  currentPlaylist: null,
  isLoading: false,
  cacheSize: {
    tracks: 0,
    albums: 0,
    playlists: 0,
    total: 0,
  },
  downloadProgress: {
    isDownloading: false,
    total: 0,
    completed: 0,
    currentItem: '',
  },
  error: null,
};

// Async thunks
export const fetchLibrary = createAsyncThunk('library/fetchLibrary', async () => {
  return await getLibrary();
});

export const fetchCacheSize = createAsyncThunk('library/fetchCacheSize', async () => {
  return await getCacheSize();
});

export const downloadTrackThunk = createAsyncThunk(
  'library/downloadTrack',
  async (track: SpotifyTrack, { dispatch }) => {
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: 1,
      completed: 0,
      currentItem: track.name,
    }));
    
    const downloadedTrack = await downloadTrack(track);
    
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: 1,
      completed: 1,
      currentItem: track.name,
    }));
    
    return downloadedTrack;
  }
);

export const downloadAlbumThunk = createAsyncThunk(
  'library/downloadAlbum',
  async ({ albumId, trackCount }: { albumId: string; trackCount: number }, { dispatch }) => {
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: trackCount,
      completed: 0,
      currentItem: 'Album',
    }));
    
    const downloadedAlbum = await downloadAlbum(albumId);
    
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: trackCount,
      completed: trackCount,
      currentItem: downloadedAlbum.name,
    }));
    
    return downloadedAlbum;
  }
);

export const downloadPlaylistThunk = createAsyncThunk(
  'library/downloadPlaylist',
  async ({ playlistId, trackCount }: { playlistId: string; trackCount: number }, { dispatch }) => {
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: trackCount,
      completed: 0,
      currentItem: 'Playlist',
    }));
    
    const downloadedPlaylist = await downloadPlaylist(playlistId);
    
    dispatch(setDownloadProgress({
      isDownloading: true,
      total: trackCount,
      completed: trackCount,
      currentItem: downloadedPlaylist.name,
    }));
    
    return downloadedPlaylist;
  }
);

export const deleteTrackThunk = createAsyncThunk(
  'library/deleteTrack',
  async (trackId: string) => {
    await deleteTrack(trackId);
    return trackId;
  }
);

export const deleteAlbumThunk = createAsyncThunk(
  'library/deleteAlbum',
  async (albumId: string) => {
    await deleteAlbum(albumId);
    return albumId;
  }
);

export const deletePlaylistThunk = createAsyncThunk(
  'library/deletePlaylist',
  async (playlistId: string) => {
    await deletePlaylist(playlistId);
    return playlistId;
  }
);

export const clearAllCacheThunk = createAsyncThunk(
  'library/clearAllCache',
  async () => {
    await clearAllCache();
    return true;
  }
);

// Library slice
const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setCurrentlyPlaying(state, action: PayloadAction<DownloadedTrack | null>) {
      state.currentlyPlaying = action.payload;
    },
    setCurrentPlaylist(state, action: PayloadAction<DownloadedTrack[] | null>) {
      state.currentPlaylist = action.payload;
      state.currentTrackIndex = state.currentlyPlaying ? 
        state.currentPlaylist?.findIndex(t => t.id === state.currentlyPlaying?.id) ?? -1 : -1;
    },
    playNext(state) {
      if (state.currentPlaylist && state.currentTrackIndex < state.currentPlaylist.length - 1) {
        state.currentTrackIndex += 1;
        state.currentlyPlaying = state.currentPlaylist[state.currentTrackIndex];
      }
    },
    playPrevious(state) {
      if (state.currentPlaylist && state.currentTrackIndex > 0) {
        state.currentTrackIndex -= 1;
        state.currentlyPlaying = state.currentPlaylist[state.currentTrackIndex];
      }
    },
    setDownloadProgress(state, action: PayloadAction<{
      isDownloading: boolean;
      total: number;
      completed: number;
      currentItem: string;
    }>) {
      state.downloadProgress = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch library
      .addCase(fetchLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.library = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch library';
      })
      
      // Fetch cache size
      .addCase(fetchCacheSize.fulfilled, (state, action) => {
        state.cacheSize = action.payload;
      })
      
      // Download track
      .addCase(downloadTrackThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(downloadTrackThunk.fulfilled, (state, action) => {
        const track = action.payload;
        state.library.tracks[track.id] = track;
        state.downloadProgress.isDownloading = false;
      })
      .addCase(downloadTrackThunk.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to download track';
        state.downloadProgress.isDownloading = false;
      })
      
      // Download album
      .addCase(downloadAlbumThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(downloadAlbumThunk.fulfilled, (state, action) => {
        const album = action.payload;
        state.library.albums[album.id] = album;
        state.downloadProgress.isDownloading = false;
      })
      .addCase(downloadAlbumThunk.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to download album';
        state.downloadProgress.isDownloading = false;
      })
      
      // Download playlist
      .addCase(downloadPlaylistThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(downloadPlaylistThunk.fulfilled, (state, action) => {
        const playlist = action.payload;
        state.library.playlists[playlist.id] = playlist;
        state.downloadProgress.isDownloading = false;
      })
      .addCase(downloadPlaylistThunk.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to download playlist';
        state.downloadProgress.isDownloading = false;
      })
      
      // Delete track
      .addCase(deleteTrackThunk.fulfilled, (state, action) => {
        const trackId = action.payload;
        delete state.library.tracks[trackId];
        
        // Also remove from currently playing if applicable
        if (state.currentlyPlaying?.id === trackId) {
          state.currentlyPlaying = null;
        }
      })
      
      // Delete album
      .addCase(deleteAlbumThunk.fulfilled, (state, action) => {
        const albumId = action.payload;
        delete state.library.albums[albumId];
      })
      
      // Delete playlist
      .addCase(deletePlaylistThunk.fulfilled, (state, action) => {
        const playlistId = action.payload;
        delete state.library.playlists[playlistId];
      })
      
      // Clear all cache
      .addCase(clearAllCacheThunk.fulfilled, (state) => {
        state.library = { tracks: {}, albums: {}, playlists: {} };
        state.currentlyPlaying = null;
        state.currentPlaylist = null;
        state.currentTrackIndex = -1;
        state.cacheSize = {
          tracks: 0,
          albums: 0,
          playlists: 0,
          total: 0,
        };
      });
  },
});

export const {
  setCurrentlyPlaying,
  setCurrentPlaylist,
  playNext,
  playPrevious,
  setDownloadProgress,
  resetError,
} = librarySlice.actions;

export default librarySlice.reducer;