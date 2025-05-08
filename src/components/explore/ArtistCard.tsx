import React from 'react';
import { Link } from 'react-router-dom';
import { SpotifyArtist } from '../../types/spotify';
import { User } from 'lucide-react';

interface ArtistCardProps {
  artist: SpotifyArtist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link to={`/artist/${artist.id}`} className="card flex flex-col items-center p-4">
      <div className="w-full aspect-square rounded-full overflow-hidden bg-dark-300 mb-3 flex items-center justify-center">
        {artist.images && artist.images[0] ? (
          <img 
            src={artist.images[0].url} 
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={40} className="text-gray-400" />
        )}
      </div>
      <h3 className="font-medium text-center truncate w-full">{artist.name}</h3>
      {artist.genres && artist.genres.length > 0 && (
        <p className="text-sm text-gray-400 text-center truncate w-full">
          {artist.genres[0]}
        </p>
      )}
    </Link>
  );
};

export default ArtistCard;