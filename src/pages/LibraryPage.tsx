import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Music, Disc, ListMusic } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchLibrary } from '../store/slices/librarySlice';
import DownloadedTrackItem from '../components/library/DownloadedTrackItem';
import DownloadedAlbumItem from '../components/library/DownloadedAlbumItem';
import DownloadedPlaylistItem from '../components/library/DownloadedPlaylistItem';

const LibraryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { library, isLoading } = useSelector((state: RootState) => state.library);
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'playlists'>('tracks');
  
  useEffect(() => {
    dispatch(fetchLibrary());
  }, [dispatch]);
  
  const handleTabChange = (tab: 'tracks' | 'albums' | 'playlists') => {
    setActiveTab(tab);
  };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4">
        <Music size={24} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your Library is Empty</h2>
      <p className="text-gray-400 max-w-md">
        Search for music in the Explore tab and download it to listen offline
      </p>
    </div>
  );
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-8 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading your library...</p>
        </div>
      );
    }
    
    const hasContent = 
      Object.keys(library.tracks).length > 0 || 
      Object.keys(library.albums).length > 0 || 
      Object.keys(library.playlists).length > 0;
    
    if (!hasContent) {
      return renderEmptyState();
    }
    
    if (activeTab === 'tracks') {
      const tracks = Object.values(library.tracks);
      return (
        <>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Music size={20} className="mr-2" /> 
            Tracks ({tracks.length})
          </h2>
          {tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map(track => (
                <DownloadedTrackItem key={track.id} track={track} tracks={tracks} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 py-4">No tracks downloaded yet</p>
          )}
        </>
      );
    }
    
    if (activeTab === 'albums') {
      const albums = Object.values(library.albums);
      return (
        <>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Disc size={20} className="mr-2" /> 
            Albums ({albums.length})
          </h2>
          {albums.length > 0 ? (
            <div className="space-y-2">
              {albums.map(album => (
                <DownloadedAlbumItem key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 py-4">No albums downloaded yet</p>
          )}
        </>
      );
    }
    
    if (activeTab === 'playlists') {
      const playlists = Object.values(library.playlists);
      return (
        <>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ListMusic size={20} className="mr-2" /> 
            Playlists ({playlists.length})
          </h2>
          {playlists.length > 0 ? (
            <div className="space-y-2">
              {playlists.map(playlist => (
                <DownloadedPlaylistItem key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 py-4">No playlists downloaded yet</p>
          )}
        </>
      );
    }
    
    return null;
  };
  
  return (
    <div className="app-container">
      <h1 className="text-2xl font-bold mb-6">Your Library</h1>
      
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabChange('tracks')}
          className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
            activeTab === 'tracks' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
          }`}
        >
          Tracks
        </button>
        
        <button
          onClick={() => handleTabChange('albums')}
          className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
            activeTab === 'albums' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
          }`}
        >
          Albums
        </button>
        
        <button
          onClick={() => handleTabChange('playlists')}
          className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
            activeTab === 'playlists' 
              ? 'bg-primary-600 text-white' 
              : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
          }`}
        >
          Playlists
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default LibraryPage;