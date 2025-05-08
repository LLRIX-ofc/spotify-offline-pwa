import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX,
  ChevronDown
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { playNext, playPrevious } from '../store/slices/librarySlice';
import { setVolume } from '../store/slices/settingsSlice';
import { audioPlayer } from '../services/audioService';

const PlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentTrack = useSelector((state: RootState) => state.library.currentlyPlaying);
  const volume = useSelector((state: RootState) => state.settings.volume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!currentTrack) {
      navigate('/library');
      return;
    }
    
    // Watch for player state changes
    const unsubscribe = audioPlayer.subscribe(() => {
      setIsPlaying(audioPlayer.isPlaying);
      if (!isSeeking) {
        setCurrentTime(audioPlayer.getCurrentTime());
        setSeekValue(audioPlayer.getCurrentTime());
      }
      setDuration(audioPlayer.getDuration());
    });
    
    // Update progress
    const intervalId = setInterval(() => {
      if (isPlaying && !isSeeking) {
        const time = audioPlayer.getCurrentTime();
        setCurrentTime(time);
        setSeekValue(time);
      }
    }, 250);
    
    // Start visualizer
    startVisualizer();
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrack, navigate, isPlaying, isSeeking]);
  
  const startVisualizer = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      if (!ctx || !canvas) return;
      
      // Get frequency data
      const analyzer = audioPlayer.getAnalyzer();
      const frequencyData = audioPlayer.getFrequencyData();
      
      if (!analyzer || !frequencyData) {
        // If no analyzer or data, just show a simple line
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = isPlaying ? '#1DB954' : 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualizer
      const barWidth = canvas.width / frequencyData.length;
      let x = 0;
      
      for (let i = 0; i < frequencyData.length; i++) {
        const barHeight = frequencyData[i] / 3;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1DB954');
        gradient.addColorStop(1, '#121212');
        
        // Draw bar
        ctx.fillStyle = isPlaying ? gradient : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(
          x, 
          canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );
        
        x += barWidth;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };
  
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
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
  };
  
  const handleSeekStart = () => {
    setIsSeeking(true);
  };
  
  const handleSeekEnd = () => {
    audioPlayer.seek(seekValue);
    setIsSeeking(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (!currentTrack) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-500 to-dark-700 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-between p-6">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full hover:bg-dark-400 active:scale-95 transition-all"
          >
            <ChevronDown size={24} />
          </button>
          <h1 className="text-lg font-semibold">Now Playing</h1>
          <div className="w-10"></div> {/* Empty div for balance */}
        </div>
        
        {/* Album Art */}
        <div className="w-full max-w-xs aspect-square mb-8 relative">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-dark-300">
            {currentTrack.album.images && currentTrack.album.images[0] ? (
              <img 
                src={currentTrack.album.images[0].url} 
                alt={currentTrack.album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dark-400 flex items-center justify-center">
                <Music size={60} className="text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Pulse animation when playing */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-lg border-2 border-primary-600 animate-pulse-slow"></div>
          )}
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-8 w-full max-w-xs">
          <h2 className="text-xl font-bold mb-1">{currentTrack.name}</h2>
          <p className="text-gray-400">{currentTrack.artists.map(a => a.name).join(', ')}</p>
        </div>
        
        {/* Visualizer */}
        <div className="w-full max-w-md mb-6">
          <canvas 
            ref={canvasRef} 
            className="w-full h-24 rounded-md"
            width={600}
            height={100}
          ></canvas>
        </div>
        
        {/* Playback Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={seekValue}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="w-full h-2 rounded-full appearance-none bg-dark-300 outline-none"
            style={{
              background: `linear-gradient(to right, #1DB954 ${(seekValue / (duration || 1)) * 100}%, #333 ${(seekValue / (duration || 1)) * 100}%)`
            }}
          />
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button 
            onClick={handleSkipPrevious}
            className="p-3 text-white hover:text-primary-600 active:scale-95 transition-all"
          >
            <SkipBack size={28} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          
          <button 
            onClick={handleSkipNext}
            className="p-3 text-white hover:text-primary-600 active:scale-95 transition-all"
          >
            <SkipForward size={28} />
          </button>
        </div>
        
        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button className="text-gray-400">
            {volume === 0 ? (
              <VolumeX size={20} />
            ) : volume < 0.5 ? (
              <Volume1 size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 rounded-full appearance-none bg-dark-300 outline-none"
            style={{
              background: `linear-gradient(to right, #1DB954 ${volume * 100}%, #333 ${volume * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;