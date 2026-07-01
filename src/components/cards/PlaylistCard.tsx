import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Heart, Download, CheckCircle2, Users, Lock, Globe, Music } from 'lucide-react';
import { PlaylistPlaceholder } from '../placeholders/PlaylistPlaceholder';

export interface PlaylistCardData {
  id: string;
  title: string;
  creator: string;
  isCreatorVerified?: boolean;
  coverUrl?: string;
  trackCount: number;
  duration?: string; // total length e.g. "2h 45m"
  followersCount?: number;
  isCollaborative?: boolean;
  isPrivate?: boolean;
  isLiked?: boolean;
}

interface PlaylistCardProps {
  playlist?: PlaylistCardData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (playlist: PlaylistCardData) => void;
  onLike?: (playlist: PlaylistCardData) => void;
  onDownload?: (playlist: PlaylistCardData) => void;
  onClick?: (playlist: PlaylistCardData) => void;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  isLoading = false,
  isPlaying = false,
  onPlay,
  onLike,
  onDownload,
  onClick,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLikedState, setIsLikedState] = useState(playlist?.isLiked || false);

  if (isLoading || !playlist) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] animate-pulse w-[170px] shrink-0 ${className}`}>
        <div className="w-full aspect-square bg-white/10 rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(playlist);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikedState(!isLikedState);
    if (onLike) onLike(playlist);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) onDownload(playlist);
  };

  const handleCardClick = () => {
    if (onClick) onClick(playlist);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] shrink-0 snap-start select-none group relative ${className}`}
    >
      {/* Cover Art Wrapper */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed || !playlist.coverUrl ? (
          <PlaylistPlaceholder size={28} />
        ) : (
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {playlist.isCollaborative && (
            <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-0.5 shadow-md">
              <Users className="w-2.5 h-2.5" /> Co-Op
            </span>
          )}
          {playlist.isPrivate ? (
            <span className="bg-black/40 backdrop-blur-md text-white/80 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> Private
            </span>
          ) : (
            <span className="bg-black/20 backdrop-blur-md text-white/60 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5" /> Public
            </span>
          )}
        </div>

        {/* Play/Pause Overlay */}
        <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handlePlayClick}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transform transition-transform duration-300 active:scale-90"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="min-w-0 flex-1">
        <h4 className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
          {playlist.title}
        </h4>
        <div className="flex items-center gap-1 mt-0.5 text-[#9AA0AE] text-[11px] truncate">
          <span className="truncate">{playlist.creator}</span>
          {playlist.isCreatorVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />
          )}
        </div>
      </div>

      {/* Playlist Meta Tracks / Followers count */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-[#9AA0AE] font-mono">
        <div className="flex items-center gap-1">
          <Music className="w-3 h-3 text-white/40" />
          <span>{playlist.trackCount} tracks</span>
        </div>
        {playlist.duration && (
          <span className="text-[9px] opacity-75">{playlist.duration}</span>
        )}
      </div>

      {playlist.followersCount !== undefined && (
        <p className="text-[9px] text-[#9AA0AE]/65 font-mono mt-1">
          {playlist.followersCount >= 1000 ? `${(playlist.followersCount / 1000).toFixed(1)}K` : playlist.followersCount} followers
        </p>
      )}

      {/* Inline Quick Action Buttons */}
      <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleLikeClick}
          className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors active:scale-90 text-white"
        >
          <Heart className={`w-3.5 h-3.5 ${isLikedState ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </button>
        <button
          onClick={handleDownloadClick}
          className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors active:scale-90 text-white"
        >
          <Download className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </motion.div>
  );
};
export default PlaylistCard;
