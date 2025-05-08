import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchSpotify } from '../../services/apiService';
import { SpotifySearchResults } from '../../types/spotify';

interface SearchState {
  query: string;
  results: SpotifySearchResults;
  filteredType: 'all' | 'track' | 'album' | 'artist' | 'playlist';
  isLoading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: {},
  filteredType: 'all',
  isLoading: false,
  error: null,
};

// Async thunk for search
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (query: string) => {
    if (!query.trim()) return {} as SpotifySearchResults;
    return await searchSpotify(query, ['track', 'album', 'artist', 'playlist']);
  }
);

// Search slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setFilteredType(state, action: PayloadAction<'all' | 'track' | 'album' | 'artist' | 'playlist'>) {
      state.filteredType = action.payload;
    },
    clearSearch(state) {
      state.query = '';
      state.results = {};
      state.filteredType = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.results = action.payload;
        state.isLoading = false;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      });
  },
});

export const { setQuery, setFilteredType, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;