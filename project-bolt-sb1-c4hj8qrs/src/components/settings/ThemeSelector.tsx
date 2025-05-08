import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon, Monitor } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { setTheme } from '../../store/slices/settingsSlice';

const ThemeSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTheme = useSelector((state: RootState) => state.settings.theme);
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(theme));
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Theme</h2>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleThemeChange('light')}
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-colors ${
            currentTheme === 'light' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 hover:bg-dark-200'
          }`}
        >
          <Sun size={24} className="mb-2" />
          <span>Light</span>
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-colors ${
            currentTheme === 'dark' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 hover:bg-dark-200'
          }`}
        >
          <Moon size={24} className="mb-2" />
          <span>Dark</span>
        </button>
        
        <button
          onClick={() => handleThemeChange('system')}
          className={`flex flex-col items-center justify-center p-4 rounded-md transition-colors ${
            currentTheme === 'system' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 hover:bg-dark-200'
          }`}
        >
          <Monitor size={24} className="mb-2" />
          <span>System</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;