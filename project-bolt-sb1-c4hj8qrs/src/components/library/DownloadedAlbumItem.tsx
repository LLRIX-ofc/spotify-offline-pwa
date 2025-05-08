import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Disc, MoreHorizontal, Trash2 } from 'lucide-react';
import { DownloadedAlbum } from '../../types/spotify';
import { deleteAlbumThunk } from '../../store/slices/librarySlice';
import { AppDispatch } from '../../store/store';

interface DownloadedAlbumItemProps {
  album: DownloadedAlbum;
}

const DownloadedAlbumItem: React.FC<DownloadedAlbumItemProps> = ({ album }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showOptions, setShowOptions] = React.useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this album from your offline library?')) {
      dispatch(deleteAlbumThunk(album.id));
    }
  };
  
  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };
  
  return (
    <Link to={`/library/album/${album.id}`} className="card flex items-center p-3 hover:bg-dark-300 transition-colors">
      <div className="w-16 h-16 rounded-md overflow-hidden bg-dark-300 flex-shrink-0 flex items-center justify-center">
        {album.images && album.images[0] ? (
          <img 
            src={album.images[0].url} 
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Disc size={24} className="text-gray-400" />
        )}
      </div>
      
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="font-medium truncate">{album.name}</h3>
        <p className="text-sm text-gray-400 truncate">
          {album.artists.map(a => a.name).join(', ')}
        </p>
        <div className="flex gap-3 text-xs text-gray-500 mt-1">
          <span>{album.tracks.length} tracks</span>
          <span>{formatDate(album.release_date)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-gray-500">
          {formatSize(album.size_bytes)}
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

export default DownloadedAlbumItem;