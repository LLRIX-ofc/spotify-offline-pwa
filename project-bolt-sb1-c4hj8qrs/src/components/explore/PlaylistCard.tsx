import React from 'react';
import { Link } from 'react-router-dom';
import { ListMusic } from 'lucide-react';
import { SpotifyPlaylist } from '../../types/spotify';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link to={`/playlist/${playlist.id}`} className="card">
      <div className="w-full aspect-square rounded-md overflow-hidden mb-3 bg-dark-300 flex items-center justify-center">
        {playlist.images && playlist.images[0] ? (
          <img 
            src={playlist.images[0].url} 
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ListMusic size={40} className="text-gray-400" />
        )}
      </div>
      <h3 className="font-medium truncate">{playlist.name}</h3>
      <p className="text-sm text-gray-400 truncate">
        By {playlist.owner.display_name}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {playlist.tracks.total} tracks
      </p>
    </Link>
  );
};

export default PlaylistCard;