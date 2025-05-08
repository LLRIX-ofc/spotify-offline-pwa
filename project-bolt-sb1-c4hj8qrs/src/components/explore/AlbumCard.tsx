import React from 'react';
import { Link } from 'react-router-dom';
import { SpotifyAlbum } from '../../types/spotify';
import { Disc } from 'lucide-react';

interface AlbumCardProps {
  album: SpotifyAlbum;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link to={`/album/${album.id}`} className="card">
      <div className="w-full aspect-square rounded-md overflow-hidden mb-3 relative bg-dark-300 flex items-center justify-center">
        {album.images && album.images[0] ? (
          <img 
            src={album.images[0].url} 
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Disc size={40} className="text-gray-400" />
        )}
      </div>
      <h3 className="font-medium truncate">{album.name}</h3>
      <p className="text-sm text-gray-400 truncate">
        {album.artists.map(a => a.name).join(', ')}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)} • {new Date(album.release_date).getFullYear()}
      </p>
    </Link>
  );
};

export default AlbumCard;