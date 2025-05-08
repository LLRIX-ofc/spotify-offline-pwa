import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EQPreset } from '../../types/spotify';
import { audioPlayer } from '../../services/audioService';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  volume: number;
  eqPresets: EQPreset[];
  currentEQPreset: string;
  homeScreenPromptShown: boolean;
  customEQ: {
    bass: number;
    mid: number;
    treble: number;
  };
}

// Default EQ presets
const defaultEQPresets: EQPreset[] = [
  {
    id: 'default',
    name: 'Default',
    bass: 0,
    mid: 0,
    treble: 0,
    isDefault: true,
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    bass: 7,
    mid: 0,
    treble: -2,
  },
  {
    id: 'vocal-boost',
    name: 'Vocal Clarity',
    bass: -3,
    mid: 5,
    treble: 2,
  },
  {
    id: 'treble-boost',
    name: 'Treble Boost',
    bass: -2,
    mid: 0,
    treble: 6,
  },
];

const initialState: SettingsState = {
  theme: 'dark',
  volume: 0.8,
  eqPresets: defaultEQPresets,
  currentEQPreset: 'default',
  homeScreenPromptShown: false,
  customEQ: {
    bass: 0,
    mid: 0,
    treble: 0,
  },
};

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.theme = action.payload;
      
      // Apply theme to the document
      const documentEl = document.documentElement;
      
      if (action.payload === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        documentEl.classList.toggle('dark', isSystemDark);
      } else {
        documentEl.classList.toggle('dark', action.payload === 'dark');
      }
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
      audioPlayer.setVolume(action.payload);
    },
    saveEQPreset(state, action: PayloadAction<Omit<EQPreset, 'id'>>) {
      const id = Date.now().toString();
      const newPreset: EQPreset = {
        id,
        ...action.payload,
      };
      
      state.eqPresets.push(newPreset);
      state.currentEQPreset = id;
      
      // Apply the preset
      audioPlayer.applyEQPreset(newPreset);
    },
    deleteEQPreset(state, action: PayloadAction<string>) {
      // Can't delete default preset
      const preset = state.eqPresets.find(p => p.id === action.payload);
      if (preset?.isDefault) return;
      
      state.eqPresets = state.eqPresets.filter(p => p.id !== action.payload);
      
      // If current preset was deleted, revert to default
      if (state.currentEQPreset === action.payload) {
        state.currentEQPreset = 'default';
        const defaultPreset = state.eqPresets.find(p => p.id === 'default');
        if (defaultPreset) {
          audioPlayer.applyEQPreset(defaultPreset);
        }
      }
    },
    applyEQPreset(state, action: PayloadAction<string>) {
      state.currentEQPreset = action.payload;
      const preset = state.eqPresets.find(p => p.id === action.payload);
      
      if (preset) {
        state.customEQ = {
          bass: preset.bass,
          mid: preset.mid,
          treble: preset.treble,
        };
        audioPlayer.applyEQPreset(preset);
      }
    },
    updateCustomEQ(state, action: PayloadAction<{ band: 'bass' | 'mid' | 'treble'; value: number }>) {
      state.customEQ[action.payload.band] = action.payload.value;
      
      // Set current preset to custom if not already
      if (state.currentEQPreset !== 'custom') {
        const customPreset = state.eqPresets.find(p => p.id === 'custom');
        if (!customPreset) {
          state.eqPresets.push({
            id: 'custom',
            name: 'Custom',
            bass: state.customEQ.bass,
            mid: state.customEQ.mid,
            treble: state.customEQ.treble,
          });
        }
        state.currentEQPreset = 'custom';
      } else {
        // Update the custom preset
        const customPresetIndex = state.eqPresets.findIndex(p => p.id === 'custom');
        if (customPresetIndex >= 0) {
          state.eqPresets[customPresetIndex] = {
            ...state.eqPresets[customPresetIndex],
            [action.payload.band]: action.payload.value,
          };
        }
      }
      
      // Apply the EQ settings to the audio player
      audioPlayer.setEQBands(
        state.customEQ.bass,
        state.customEQ.mid,
        state.customEQ.treble
      );
    },
    setHomeScreenPromptShown(state, action: PayloadAction<boolean>) {
      state.homeScreenPromptShown = action.payload;
    },
  },
});

export const {
  setTheme,
  setVolume,
  saveEQPreset,
  deleteEQPreset,
  applyEQPreset,
  updateCustomEQ,
  setHomeScreenPromptShown,
} = settingsSlice.actions;

export default settingsSlice.reducer;