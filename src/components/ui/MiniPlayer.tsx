import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { setCurrentlyPlaying, playNext, playPrevious } from '../../store/slices/librarySlice';
import { setVolume } from '../../store/slices/settingsSlice';
import { audioPlayer } from '../../services/audioService';

const MiniPlayer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTrack = useSelector((state: RootState) => state.library.currentlyPlaying);
  const volume = useSelector((state: RootState) => state.settings.volume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    // Watch for player state changes
    const unsubscribe = audioPlayer.subscribe(() => {
      setIsPlaying(audioPlayer.isPlaying);
      setCurrentTime(audioPlayer.getCurrentTime());
      setDuration(audioPlayer.getDuration());
    });
    
    // Update progress bar
    const intervalId = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(audioPlayer.getCurrentTime());
        setDuration(audioPlayer.getDuration());
      }
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isPlaying]);
  
  useEffect(() => {
    if (currentTrack) {
      audioPlayer.playTrack(currentTrack.id);
    }
  }, [currentTrack]);
  
  const togglePlayPause = () => {
    audioPlayer.togglePlayPause();
  };
  
  const handleSkipNext = () => {
    dispatch(playNext());
  };
  
  const handleSkipPrevious = () => {
    if (currentTime < 3) {
      dispatch(playPrevious());
    } else {
      // If we're more than 3 seconds in, restart the current track
      audioPlayer.seek(0);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch(setVolume(value));
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (!currentTrack) return null;
  
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-dark-400 border-t border-dark-300 p-3 z-10">
      <div className="flex items-center gap-3">
        {/* Album Art */}
        <Link to="/player" className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
          <img 
            src={currentTrack.album.images[0]?.url || '/default-album.png'} 
            alt={currentTrack.album.name}
            className="w-full h-full object-cover"
          />
        </Link>
        
        {/* Track Info */}
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-white truncate">{currentTrack.name}</h4>
          <p className="text-sm text-gray-400 truncate">
            {currentTrack.artists.map(a => a.name).join(', ')}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSkipPrevious}
            className="text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          
          <button 
            onClick={handleSkipNext}
            className="text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <SkipForward size={20} />
          </button>
          
          <Link 
            to="/player"
            className="text-gray-300 hover:text-white active:scale-95 transition-all ml-2"
          >
            <Maximize2 size={18} />
          </Link>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-grow h-1 bg-dark-300 rounded-full">
            <div 
              className="h-1 bg-primary-600 rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;