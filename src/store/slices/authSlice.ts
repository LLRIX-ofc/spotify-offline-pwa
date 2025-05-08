import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SpotifyToken, SpotifyUser } from '../../types/spotify';
import { isAuthenticated, initiateLogin, handleCallback, logout } from '../../services/authService';
import { getCurrentUser } from '../../services/apiService';

interface AuthState {
  isLoggedIn: boolean;
  token: SpotifyToken | null;
  user: SpotifyUser | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: isAuthenticated(),
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk('auth/login', async () => {
  await initiateLogin();
  return null; // The redirect happens in the service
});

export const handleAuthCallback = createAsyncThunk(
  'auth/handleCallback',
  async ({ code, state }: { code: string; state: string }) => {
    const token = await handleCallback(code, state);
    const user = await getCurrentUser();
    return { token, user };
  }
);

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async () => {
  return await getCurrentUser();
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  logout();
  return null;
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Handle callback
      .addCase(handleAuthCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleAuthCallback.fulfilled, (state, action) => {
        if (action.payload) {
          state.isLoggedIn = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
        state.isLoading = false;
      })
      .addCase(handleAuthCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Authentication failed';
      })
      
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;