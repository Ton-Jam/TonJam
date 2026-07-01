import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Heart, MoreVertical, CheckCircle2, Headphones, Sparkles, Volume2 } from 'lucide-react';
import { TrackPlaceholder } from '../placeholders/TrackPlaceholder';

export interface TrackData {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  isVerified?: boolean;
  coverUrl: string;
  duration: string;
  genre?: string;
  isExplicit?: boolean;
  isNFT?: boolean;
  streams?: number;
  isLiked?: boolean;
}

interface TrackCardProps {
  // Direct props support for backwards compatibility
  title?: string;
  artist?: string;
  coverUrl?: string;
  duration?: string;
  isExplicit?: boolean;
  isNFT?: boolean;

  track?: TrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (track: TrackData) => void;
  onLike?: (track: TrackData) => void;
  onMore?: (track: TrackData) => void;
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  title,
  artist,
  coverUrl,
  duration,
  isExplicit,
  isNFT,
  track,
  isLoading = false,
  isPlaying = false,
  onPlay,
  onLike,
  onMore,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLikedState, setIsLikedState] = useState(track?.isLiked || false);

  const finalTrack = track || {
    id: 'compat',
    title: title || 'Unknown Title',
    artist: artist || 'Unknown Artist',
    coverUrl: coverUrl || '',
    duration: duration || '0:00',
    isExplicit,
    isNFT,
  };

  if (isLoading || (!track && !title)) {
    // Elegant Skeleton State
    return (
      <div className={`flex items-center p-3 rounded-[10px] bg-[#0A113A] animate-pulse w-full max-w-full ${className}`}>
        <div className="w-12 h-12 bg-white/10 rounded-lg shrink-0" />
        <div className="ml-3 flex-1 space-y-2 min-w-0">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
        <div className="w-12 h-4 bg-white/10 rounded shrink-0" />
      </div>
    );
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(finalTrack);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikedState(!isLikedState);
    if (onLike) onLike(finalTrack);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMore) onMore(finalTrack);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: '#101A3B' }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-3 rounded-[10px] bg-[#0A113A] transition-colors cursor-pointer w-full group relative select-none ${className}`}
      onClick={() => onPlay?.(finalTrack)}
    >
      {/* Artwork Container */}
      <div 
        className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950 cursor-pointer"
        onClick={handlePlayClick}
      >
        {imgFailed ? (
          <TrackPlaceholder size={20} />
        ) : (
          <img
            src={finalTrack.coverUrl}
            alt={finalTrack.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Play Count Badge on Corner */}
        {((finalTrack.streams !== undefined ? finalTrack.streams : (finalTrack as any).playCount) || 0) > 0 && (
          <div className="absolute top-0.5 right-0.5 bg-black/70 backdrop-blur-[2px] text-[7px] font-bold text-white px-1 py-0.2 rounded flex items-center gap-0.5 z-10 select-none animate-in fade-in duration-300">
            <Headphones className="w-2 h-2 text-blue-400" />
            <span>
              {(() => {
                const count = finalTrack.streams !== undefined ? finalTrack.streams : ((finalTrack as any).playCount || 0);
                return count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count;
              })()}
            </span>
          </div>
        )}

        {/* Hover Play/Pause Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isPlaying ? (
            <Pause className="w-5 h-5 text-blue-400 fill-blue-400" />
          ) : (
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          )}
        </div>
      </div>

      {/* Track Details */}
      <div className="ml-3 flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4 className={`text-[14px] font-bold truncate ${isPlaying ? 'text-blue-400' : 'text-white'}`}>
            {finalTrack.title}
          </h4>
          {finalTrack.isExplicit && (
            <span className="text-[9px] font-black bg-white/10 text-white/60 px-1 py-0.2 rounded shrink-0 uppercase tracking-wider scale-90">
              E
            </span>
          )}
          {finalTrack.isNFT && (
            <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider shrink-0 flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" /> NFT
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 text-[#9AA0AE] text-[11px] truncate">
          {finalTrack.artistAvatar && (
            <img 
              src={finalTrack.artistAvatar} 
              alt={finalTrack.artist} 
              className="w-4 h-4 rounded-full object-cover shrink-0" 
            />
          )}
          <span className="truncate hover:text-white transition-colors">{finalTrack.artist}</span>
          {finalTrack.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 fill-current" />
          )}
          {finalTrack.genre && (
            <span className="text-[10px] opacity-75 hidden sm:inline-block">• {finalTrack.genre}</span>
          )}
        </div>
      </div>

      {/* Extra Metadata & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Animated Equalizer or Stream Count */}
        {isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-3.5 px-2">
            <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
            <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
            <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
          </div>
        ) : (
          finalTrack.streams !== undefined && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#9AA0AE] font-mono">
              <Headphones className="w-3 h-3" />
              <span>{finalTrack.streams >= 1000000 ? `${(finalTrack.streams / 1000000).toFixed(1)}M` : finalTrack.streams >= 1000 ? `${(finalTrack.streams / 1000).toFixed(0)}K` : finalTrack.streams}</span>
            </div>
          )
        )}

        <span className="text-[11px] text-[#9AA0AE] font-mono">{finalTrack.duration}</span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLikeClick} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${isLikedState ? 'text-red-500 fill-red-500' : 'text-white/60 hover:text-white'}`} 
            />
          </button>
          <button 
            onClick={handleMoreClick} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-90"
          >
            <MoreVertical className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
