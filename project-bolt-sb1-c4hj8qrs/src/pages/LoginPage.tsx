import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Music } from 'lucide-react';
import { loginUser } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store/store';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const handleLogin = () => {
    dispatch(loginUser());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-500 to-dark-700 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-400 rounded-xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <Music size={36} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Spotify Offline</h1>
        <div className="text-gradient text-xl font-semibold mb-6">
          Your music, everywhere.
        </div>
        
        <p className="text-gray-300 mb-8">
          Search, download, and listen to your favorite Spotify tracks offline with our PWA app.
        </p>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-full font-medium text-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </span>
          ) : (
            'Login with Spotify'
          )}
        </button>
        
        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-400">
          <p className="mb-2">Experience features like:</p>
          <ul className="text-left space-y-2">
            <li className="flex items-start">
              <span className="mr-2 text-primary-600">•</span>
              Offline listening for your favorite tracks
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary-600">•</span>
              Custom equalizer with presets
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary-600">•</span>
              Download entire albums and playlists
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary-600">•</span>
              Full PWA experience for your mobile device
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 max-w-md text-center">
        <p>
          This is a demonstration app. Please do not use this for downloading copyrighted material without proper licensing.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;