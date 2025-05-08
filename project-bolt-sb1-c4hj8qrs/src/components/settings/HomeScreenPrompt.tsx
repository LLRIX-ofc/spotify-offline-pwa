import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setHomeScreenPromptShown } from '../../store/slices/settingsSlice';

// Import add-to-homescreen functionality
declare global {
  interface Window {
    addToHomescreen: (options: any) => void;
  }
}

const HomeScreenPrompt: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { homeScreenPromptShown } = useSelector((state: RootState) => state.settings);
  
  useEffect(() => {
    // Load add-to-homescreen script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/add-to-homescreen@3.2.6/dist/addtohomescreen.min.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize add-to-homescreen
      if (window.addToHomescreen) {
        window.addToHomescreen({
          skipFirstVisit: false,
          maxDisplayCount: 1,
          displayPace: 0,
          customPromptContent: {
            title: 'Spotify Offline',
            message: 'Add this app to your home screen for the best experience and quick access to your offline music.',
            ios: 'To add this app to the home screen, tap %icon and then <strong>Add to Home Screen</strong>.',
            android: 'To add this app to the home screen, open the browser menu and tap <strong>Add to Home screen</strong>.'
          }
        });
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const handleTogglePrompt = () => {
    const newValue = !homeScreenPromptShown;
    dispatch(setHomeScreenPromptShown(newValue));
    
    if (newValue && window.addToHomescreen) {
      window.addToHomescreen({ displayPace: 0 });
    }
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Add to Home Screen</h2>
      
      <div className="flex items-center justify-between bg-dark-300 p-4 rounded-lg">
        <div>
          <p className="mb-1">Prompt to install as app</p>
          <p className="text-sm text-gray-400">Show "Add to Home Screen" prompt to install the app</p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={homeScreenPromptShown}
            onChange={handleTogglePrompt}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-dark-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
      
      <div className="mt-4 p-4 bg-dark-300 rounded-lg">
        <h3 className="font-medium mb-2">Why install as an app?</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Full-screen experience without browser controls</li>
          <li>• Faster access from your home screen</li>
          <li>• Better performance and offline capabilities</li>
          <li>• Use alongside other apps like a native application</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeScreenPrompt;