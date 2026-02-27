import React, { useEffect, useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  ChevronDown, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';

const FullPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    progress, 
    duration, 
    seek, 
    isFullPlayerOpen, 
    setFullPlayerOpen,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    toggleLike,
    likedTrackIds
  } = useAudio();

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={() => setFullPlayerOpen(false)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
        <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Now Playing</span>
        <button className="text-white/60 hover:text-white transition-colors">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album Art */}
        <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-12 relative group">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Track Info */}
        <div className="w-full max-w-sm flex items-center justify-between mb-8">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white truncate mb-1">{currentTrack.title}</h2>
            <p className="text-lg text-white/60 truncate">{currentTrack.artist}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack.id); }}
            className={`p-2 rounded-full transition-all ${isLiked ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8 group">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 transition-all"
            style={{
              background: `linear-gradient(to right, #2563eb ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(progress / (duration || 1)) * 100}%)`
            }}
          />
          <div className="flex justify-between mt-2 text-xs font-medium text-white/40">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm flex items-center justify-between mb-12">
          <button 
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${isShuffle ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          
          <button 
            onClick={playPrevious}
            className="p-2 text-white hover:text-blue-400 transition-colors"
          >
            <SkipBack className="h-8 w-8 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white fill-current" />
            ) : (
              <Play className="h-8 w-8 text-white fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={playNext}
            className="p-2 text-white hover:text-blue-400 transition-colors"
          >
            <SkipForward className="h-8 w-8 fill-current" />
          </button>
          
          <button 
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${isRepeat ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* Volume & Share */}
        <div className="w-full max-w-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 w-3/4"></div>
            </div>
          </div>
          <button className="ml-6 text-white/40 hover:text-white">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;
