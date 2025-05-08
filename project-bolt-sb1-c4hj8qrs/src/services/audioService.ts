import { getTrackAudio } from './downloadService';
import { EQPreset } from '../types/spotify';

class AudioPlayerService {
  private context: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentTrackId: string | null = null;
  private _isPlaying: boolean = false;
  
  // Observer pattern for state changes
  private listeners: Set<() => void> = new Set();
  
  // Initialize the audio context and nodes
  private initialize() {
    if (this.context) return;
    
    this.context = new AudioContext();
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    
    // Create audio nodes
    this.source = this.context.createMediaElementSource(this.audioElement);
    this.gainNode = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    
    // Configure analyzer for visualizations
    this.analyser.fftSize = 256;
    
    // Create EQ filters
    this.bassFilter = this.context.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    
    this.midFilter = this.context.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;
    
    this.trebleFilter = this.context.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;
    
    // Connect nodes
    this.source.connect(this.bassFilter);
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    // Add event listeners
    this.audioElement.addEventListener('ended', () => {
      this._isPlaying = false;
      this.notifyListeners();
    });
    
    this.audioElement.addEventListener('pause', () => {
      this._isPlaying = false;
      this.notifyListeners();
    });
    
    this.audioElement.addEventListener('play', () => {
      this._isPlaying = true;
      this.notifyListeners();
    });
  }
  
  // Load track from IndexedDB and play
  async playTrack(trackId: string) {
    this.initialize();
    
    if (!this.audioElement || !this.context) return;
    
    // Resume audio context if suspended (needed for browsers that require user interaction)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    
    // If same track is already playing, just continue
    if (this.currentTrackId === trackId && this._isPlaying) {
      return;
    }
    
    // Load track from IndexedDB
    const audioData = await getTrackAudio(trackId);
    if (!audioData) {
      console.error('Track not found in offline storage');
      return;
    }
    
    // Create blob URL from audio data
    const blob = new Blob([audioData]);
    const url = URL.createObjectURL(blob);
    
    // Set audio source and play
    this.audioElement.src = url;
    this.currentTrackId = trackId;
    
    try {
      await this.audioElement.play();
      this._isPlaying = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }
  
  // Play/pause toggle
  togglePlayPause() {
    if (!this.audioElement) return;
    
    if (this._isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play().catch(err => console.error('Play failed:', err));
    }
  }
  
  // Stop playback
  stop() {
    if (!this.audioElement) return;
    
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this._isPlaying = false;
    this.notifyListeners();
  }
  
  // Set volume (0 to 1)
  setVolume(level: number) {
    if (!this.gainNode) return;
    
    // Clamp volume between 0 and 1
    const volume = Math.max(0, Math.min(1, level));
    this.gainNode.gain.value = volume;
    this.notifyListeners();
  }
  
  // Apply EQ preset
  applyEQPreset(preset: EQPreset) {
    if (!this.bassFilter || !this.midFilter || !this.trebleFilter) return;
    
    this.bassFilter.gain.value = preset.bass;
    this.midFilter.gain.value = preset.mid;
    this.trebleFilter.gain.value = preset.treble;
  }
  
  // Set individual EQ bands
  setEQBands(bass: number, mid: number, treble: number) {
    if (!this.bassFilter || !this.midFilter || !this.trebleFilter) return;
    
    this.bassFilter.gain.value = bass;
    this.midFilter.gain.value = mid;
    this.trebleFilter.gain.value = treble;
  }
  
  // Get current playback time in seconds
  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }
  
  // Get total duration in seconds
  getDuration(): number {
    return this.audioElement?.duration || 0;
  }
  
  // Seek to position (in seconds)
  seek(timeInSeconds: number) {
    if (!this.audioElement) return;
    
    this.audioElement.currentTime = timeInSeconds;
  }
  
  // Get analyzer node for visualizations
  getAnalyzer(): AnalyserNode | null {
    return this.analyser;
  }
  
  // Get frequency data for visualizer
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
  
  // Get current playing state
  get isPlaying(): boolean {
    return this._isPlaying;
  }
  
  // Subscribe to player state changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  // Notify all listeners of state change
  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }
  
  // Clean up resources
  dispose() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    
    if (this.context) {
      this.context.close();
    }
    
    this.source = null;
    this.bassFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;
    this.gainNode = null;
    this.analyser = null;
    this.audioElement = null;
    this.context = null;
    this.currentTrackId = null;
    this._isPlaying = false;
    this.listeners.clear();
  }
}

// Create singleton instance
export const audioPlayer = new AudioPlayerService();