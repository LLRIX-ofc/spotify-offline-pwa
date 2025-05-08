import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import libraryReducer from './slices/librarySlice';
import settingsReducer from './slices/settingsSlice';

// Configure persist for specific slices
const settingsPersistConfig = {
  key: 'settings',
  storage,
  whitelist: ['theme', 'volume', 'eqPresets', 'currentEQPreset', 'homeScreenPromptShown', 'customEQ'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  library: libraryReducer,
  settings: persistReducer(settingsPersistConfig, settingsReducer),
});

// Create the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;