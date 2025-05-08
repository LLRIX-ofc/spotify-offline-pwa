import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ListMusic, MoreHorizontal, Trash2 } from 'lucide-react';
import { DownloadedPlaylist } from '../../types/spotify';
import { deletePlaylistThunk } from '../../store/slices/librarySlice';
import { AppDispatch } from '../../store/store';

interface DownloadedPlaylistItemProps {
  playlist: DownloadedPlaylist;
}

const DownloadedPlaylistItem: React.FC<DownloadedPlaylistItemProps> = ({ playlist }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showOptions, setShowOptions] = React.useState(false);
  
  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this playlist from your offline library?')) {
      dispatch(deletePlaylistThunk(playlist.id));
    }
  };
  
  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };
  
  return (
    <Link to={`/library/playlist/${playlist.id}`} className="card flex items-center p-3 hover:bg-dark-300 transition-colors">
      <div className="w-16 h-16 rounded-md overflow-hidden bg-dark-300 flex-shrink-0 flex items-center justify-center">
        {playlist.images && playlist.images[0] ? (
          <img 
            src={playlist.images[0].url} 
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ListMusic size={24} className="text-gray-400" />
        )}
      </div>
      
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="font-medium truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-400 truncate">
          By {playlist.owner.display_name}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {playlist.tracks.length} tracks
        </p>
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-gray-500">
          {formatSize(playlist.size_bytes)}
        </span>
        
        <div className="relative" onClick={(e) => e.preventDefault()}>
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
    </Link>
  );
};

export default DownloadedPlaylistItem;