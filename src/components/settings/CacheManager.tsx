import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, HardDrive } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { fetchCacheSize, clearAllCacheThunk } from '../../store/slices/librarySlice';

const CacheManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cacheSize } = useSelector((state: RootState) => state.library);
  
  useEffect(() => {
    dispatch(fetchCacheSize());
  }, [dispatch]);
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear your entire offline library? This will delete all downloaded tracks, albums, and playlists.')) {
      dispatch(clearAllCacheThunk());
    }
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Manage Offline Cache</h2>
      
      <div className="bg-dark-300 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-300">Total Usage</span>
          <span className="font-semibold">{formatSize(cacheSize.total)}</span>
        </div>
        
        <div className="w-full h-4 bg-dark-400 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-primary-600" 
              style={{ width: `${(cacheSize.tracks / cacheSize.total) * 100}%` }}
            ></div>
            <div 
              className="bg-secondary-600" 
              style={{ width: `${(cacheSize.albums / cacheSize.total) * 100}%` }}
            ></div>
            <div 
              className="bg-accent-600" 
              style={{ width: `${(cacheSize.playlists / cacheSize.total) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-primary-600 mr-2"></span>
            <div>
              <div>Tracks</div>
              <div className="text-gray-400">{formatSize(cacheSize.tracks)}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-secondary-600 mr-2"></span>
            <div>
              <div>Albums</div>
              <div className="text-gray-400">{formatSize(cacheSize.albums)}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-accent-600 mr-2"></span>
            <div>
              <div>Playlists</div>
              <div className="text-gray-400">{formatSize(cacheSize.playlists)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleClearCache}
        className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 active:scale-95 transition-all"
      >
        <Trash2 size={18} />
        Clear All Offline Data
      </button>
    </div>
  );
};

export default CacheManager;