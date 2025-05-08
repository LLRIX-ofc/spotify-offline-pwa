import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Download, Music } from 'lucide-react';
import { SpotifyTrack } from '../../types/spotify';
import { downloadTrackThunk } from '../../store/slices/librarySlice';
import { AppDispatch } from '../../store/store';

interface TrackCardProps {
  track: SpotifyTrack;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(downloadTrackThunk(track));
  };
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Link to={`/track/${track.id}`} className="card flex items-center p-3 hover:bg-dark-300 transition-colors">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-dark-300 flex-shrink-0 flex items-center justify-center">
        {track.album.images && track.album.images[0] ? (
          <img 
            src={track.album.images[0].url} 
            alt={track.album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music size={20} className="text-gray-400" />
        )}
      </div>
      
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="font-medium truncate">{track.name}</h3>
        <p className="text-sm text-gray-400 truncate">
          {track.artists.map(a => a.name).join(', ')}
        </p>
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-gray-500">{formatDuration(track.duration_ms)}</span>
        
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-dark-200 hover:bg-dark-100 active:scale-95 transition-all"
          aria-label="Download track"
        >
          <Download size={16} className="text-primary-600" />
        </button>
      </div>
    </Link>
  );
};

export default TrackCard;