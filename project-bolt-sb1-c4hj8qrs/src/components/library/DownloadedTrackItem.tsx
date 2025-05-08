import React from 'react';
import { useDispatch } from 'react-redux';
import { MoreHorizontal, Music, PlayCircle, Trash2 } from 'lucide-react';
import { DownloadedTrack } from '../../types/spotify';
import { setCurrentlyPlaying, setCurrentPlaylist, deleteTrackThunk } from '../../store/slices/librarySlice';
import { AppDispatch } from '../../store/store';

interface DownloadedTrackItemProps {
  track: DownloadedTrack;
  tracks?: DownloadedTrack[];
}

const DownloadedTrackItem: React.FC<DownloadedTrackItemProps> = ({ track, tracks }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showOptions, setShowOptions] = React.useState(false);
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handlePlay = () => {
    dispatch(setCurrentlyPlaying(track));
    if (tracks) {
      dispatch(setCurrentPlaylist(tracks));
    } else {
      dispatch(setCurrentPlaylist([track]));
    }
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this track from your offline library?')) {
      dispatch(deleteTrackThunk(track.id));
    }
  };
  
  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };
  
  return (
    <div className="card flex items-center p-3 hover:bg-dark-300 transition-colors">
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
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-500 mr-1 hidden md:inline">
          {formatSize(track.size_bytes)}
        </span>
        
        <span className="text-sm text-gray-500 mr-1">
          {formatDuration(track.duration_ms)}
        </span>
        
        <button
          onClick={handlePlay}
          className="p-2 rounded-full hover:bg-dark-200 active:scale-95 transition-all"
          aria-label="Play track"
        >
          <PlayCircle size={20} className="text-primary-600" />
        </button>
        
        <div className="relative">
          <button
            onClick={toggleOptions}
            className="p-2 rounded-full hover:bg-dark-200 active:scale-95 transition-all"
            aria-label="More options"
          >
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 py-1 w-40 bg-dark-300 rounded-md shadow-lg z-10">
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm hover:bg-dark-200 flex items-center"
              >
                <Trash2 size={16} className="mr-2 text-red-500" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadedTrackItem;