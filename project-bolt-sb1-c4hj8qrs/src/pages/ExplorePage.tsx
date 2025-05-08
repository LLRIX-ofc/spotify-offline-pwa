import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Music, User, Disc, ListMusic } from 'lucide-react';
import { RootState } from '../store/store';
import SearchBar from '../components/ui/SearchBar';
import TrackCard from '../components/explore/TrackCard';
import ArtistCard from '../components/explore/ArtistCard';
import AlbumCard from '../components/explore/AlbumCard';
import PlaylistCard from '../components/explore/PlaylistCard';

const ExplorePage: React.FC = () => {
  const { query, results, filteredType, isLoading } = useSelector((state: RootState) => state.search);
  const [activeTab, setActiveTab] = useState<'all' | 'track' | 'album' | 'artist' | 'playlist'>('all');
  
  const handleTabChange = (tab: 'all' | 'track' | 'album' | 'artist' | 'playlist') => {
    setActiveTab(tab);
  };
  
  const renderTabContent = () => {
    if (!query) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Search for your favorite music</h2>
          <p className="text-gray-400 max-w-md">
            Find tracks, albums, artists, and playlists you love and download them for offline listening
          </p>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="py-8 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Searching...</p>
        </div>
      );
    }
    
    if (activeTab === 'all' || activeTab === 'track') {
      const tracks = results.tracks?.items || [];
      if (tracks.length > 0) {
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Music size={20} className="mr-2" /> 
              Tracks
            </h2>
            <div className="space-y-2">
              {tracks.slice(0, activeTab === 'track' ? undefined : 5).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        );
      }
    }
    
    if (activeTab === 'all' || activeTab === 'artist') {
      const artists = results.artists?.items || [];
      if (artists.length > 0) {
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User size={20} className="mr-2" /> 
              Artists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artists.slice(0, activeTab === 'artist' ? undefined : 4).map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        );
      }
    }
    
    if (activeTab === 'all' || activeTab === 'album') {
      const albums = results.albums?.items || [];
      if (albums.length > 0) {
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Disc size={20} className="mr-2" /> 
              Albums
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.slice(0, activeTab === 'album' ? undefined : 4).map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        );
      }
    }
    
    if (activeTab === 'all' || activeTab === 'playlist') {
      const playlists = results.playlists?.items || [];
      if (playlists.length > 0) {
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ListMusic size={20} className="mr-2" /> 
              Playlists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.slice(0, activeTab === 'playlist' ? undefined : 4).map(playlist => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </div>
        );
      }
    }
    
    if (query && !isLoading && !results.tracks?.items?.length && !results.artists?.items?.length && 
        !results.albums?.items?.length && !results.playlists?.items?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4">
            <Music size={24} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-400 max-w-md">
            We couldn't find any results for "{query}". Try searching with different keywords.
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="app-container">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      
      <SearchBar />
      
      {query && (
        <div className="mt-4 mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
            }`}
          >
            All Results
          </button>
          
          {results.tracks?.items?.length ? (
            <button
              onClick={() => handleTabChange('track')}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'track' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
              }`}
            >
              Tracks
            </button>
          ) : null}
          
          {results.artists?.items?.length ? (
            <button
              onClick={() => handleTabChange('artist')}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'artist' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
              }`}
            >
              Artists
            </button>
          ) : null}
          
          {results.albums?.items?.length ? (
            <button
              onClick={() => handleTabChange('album')}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'album' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
              }`}
            >
              Albums
            </button>
          ) : null}
          
          {results.playlists?.items?.length ? (
            <button
              onClick={() => handleTabChange('playlist')}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'playlist' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
              }`}
            >
              Playlists
            </button>
          ) : null}
        </div>
      )}
      
      {renderTabContent()}
    </div>
  );
};

export default ExplorePage;