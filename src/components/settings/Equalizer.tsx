import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Trash, Check } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { 
  applyEQPreset, 
  updateCustomEQ, 
  saveEQPreset, 
  deleteEQPreset 
} from '../../store/slices/settingsSlice';

const Equalizer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { eqPresets, currentEQPreset, customEQ } = useSelector((state: RootState) => state.settings);
  
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const handleSliderChange = (band: 'bass' | 'mid' | 'treble', value: number) => {
    dispatch(updateCustomEQ({ band, value }));
  };
  
  const handlePresetSelect = (presetId: string) => {
    dispatch(applyEQPreset(presetId));
  };
  
  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      dispatch(saveEQPreset({
        name: newPresetName,
        bass: customEQ.bass,
        mid: customEQ.mid,
        treble: customEQ.treble
      }));
      setNewPresetName('');
      setShowSaveForm(false);
    }
  };
  
  const handleDeletePreset = (presetId: string) => {
    dispatch(deleteEQPreset(presetId));
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Equalizer</h2>
      
      {/* EQ Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <span className="mb-2">Bass</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={customEQ.bass}
            onChange={(e) => handleSliderChange('bass', parseInt(e.target.value))}
            className="h-40 w-4 appearance-none bg-dark-300 rounded-full orientation-vertical"
          />
          <span className="mt-2 text-primary-600 font-semibold">{customEQ.bass > 0 ? `+${customEQ.bass}` : customEQ.bass}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="mb-2">Mid</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={customEQ.mid}
            onChange={(e) => handleSliderChange('mid', parseInt(e.target.value))}
            className="h-40 w-4 appearance-none bg-dark-300 rounded-full orientation-vertical"
          />
          <span className="mt-2 text-primary-600 font-semibold">{customEQ.mid > 0 ? `+${customEQ.mid}` : customEQ.mid}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="mb-2">Treble</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={customEQ.treble}
            onChange={(e) => handleSliderChange('treble', parseInt(e.target.value))}
            className="h-40 w-4 appearance-none bg-dark-300 rounded-full orientation-vertical"
          />
          <span className="mt-2 text-primary-600 font-semibold">{customEQ.treble > 0 ? `+${customEQ.treble}` : customEQ.treble}</span>
        </div>
      </div>
      
      {/* Presets */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Presets</h3>
          
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center text-sm px-3 py-1 rounded-full bg-dark-300 hover:bg-dark-200 transition-colors"
            >
              <Save size={14} className="mr-1" />
              Save Current
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="input-field text-sm px-3 py-1 w-36"
              />
              <button
                onClick={handleSavePreset}
                className="flex items-center text-sm px-3 py-1 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <Check size={14} className="mr-1" />
                Save
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="text-sm px-3 py-1 rounded-full bg-dark-300 hover:bg-dark-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {eqPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`flex justify-between items-center p-3 rounded-md transition-colors ${
                currentEQPreset === preset.id ? 'bg-primary-600 text-white' : 'bg-dark-300 hover:bg-dark-200'
              }`}
            >
              <span>{preset.name}</span>
              
              {!preset.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id);
                  }}
                  className={`p-1 rounded-full ${
                    currentEQPreset === preset.id ? 'hover:bg-primary-700' : 'hover:bg-dark-100'
                  } transition-colors`}
                >
                  <Trash size={14} />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Equalizer;