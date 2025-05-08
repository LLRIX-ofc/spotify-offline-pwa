import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Music } from 'lucide-react';
import { handleAuthCallback } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store/store';

const history = useHistory();
history.push('/your-path'); // instead of navigate('/your-path')

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          await dispatch(handleAuthCallback({ code, state })).unwrap();
          navigate('/');
        } catch (error) {
          console.error('Authentication failed:', error);
        }
      } else {
        navigate('/login');
      }
    };
    
    handleCallback();
  }, [dispatch, navigate]);
  
  return (
    <div className="min-h-screen bg-dark-500 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-400 rounded-xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <Music size={36} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">
          {error ? 'Authentication Failed' : 'Completing Login...'}
        </h1>
        
        {isLoading && (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">Connecting to Spotify...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage;
