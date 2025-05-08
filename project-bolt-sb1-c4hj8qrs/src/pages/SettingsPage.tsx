import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import ThemeSelector from '../components/settings/ThemeSelector';
import Equalizer from '../components/settings/Equalizer';
import CacheManager from '../components/settings/CacheManager';
import HomeScreenPrompt from '../components/settings/HomeScreenPrompt';

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      dispatch(logoutUser());
    }
  };
  
  return (
    <div className="app-container">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {user && (
        <div className="bg-dark-300 rounded-lg p-4 mb-6 flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-400 flex-shrink-0">
            {user.images && user.images[0] ? (
              <img 
                src={user.images[0].url} 
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="ml-3 flex-grow">
            <h2 className="font-semibold">{user.display_name}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-400 hover:bg-dark-200 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
      
      <div className="space-y-8">
        <ThemeSelector />
        
        <Equalizer />
        
        <CacheManager />
        
        <HomeScreenPrompt />
      </div>
    </div>
  );
};

export default SettingsPage;