import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Heart, CheckCircle2, Volume2, Sparkles, Disc3 } from 'lucide-react';
import { AlbumPlaceholder } from '../placeholders/AlbumPlaceholder';

export interface AlbumCardData {
  id: string;
  title: string;
  artist: string;
  isArtistVerified?: boolean;
  coverUrl?: string;
  releaseYear?: number | string;
  trackCount: number;
  duration?: string;
  genre?: string;
  isNFTCollection?: boolean;
  isDolbyAtmos?: boolean;
  isLiked?: boolean;
}

interface AlbumCardProps {
  album?: AlbumCardData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (album: AlbumCardData) => void;
  onLike?: (album: AlbumCardData) => void;
  onClick?: (album: AlbumCardData) => void;
  className?: string;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  isLoading = false,
  isPlaying = false,
  onPlay,
  onLike,
  onClick,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isLikedState, setIsLikedState] = useState(album?.isLiked || false);

  if (isLoading || !album) {
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
    if (onPlay) onPlay(album);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLikedState(!isLikedState);
    if (onLike) onLike(album);
  };

  const handleCardClick = () => {
    if (onClick) onClick(album);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] shrink-0 snap-start select-none group relative ${className}`}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed || !album.coverUrl ? (
          <AlbumPlaceholder size={32} />
        ) : (
          <img
            src={album.coverUrl}
            alt={album.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Badge Overlays (NFT & Dolby) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {album.isNFTCollection && (
            <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-0.5 shadow-md">
              <Sparkles className="w-2.5 h-2.5 fill-current" /> Series
            </span>
          )}
          {album.isDolbyAtmos && (
            <span className="bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Volume2 className="w-3 h-3 fill-current" /> Dolby
            </span>
          )}
        </div>

        {/* Hover Action Overlays */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLikeClick}
            className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors active:scale-90 text-white"
          >
            <Heart className={`w-3.5 h-3.5 ${isLikedState ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Central Play/Pause Trigger */}
        <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handlePlayClick}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg active:scale-90"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Album Text Details */}
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
          {album.title}
        </h3>
        <div className="flex items-center gap-1 mt-0.5 text-[#9AA0AE] text-[11px] truncate">
          <span className="truncate">{album.artist}</span>
          {album.isArtistVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />
          )}
        </div>
      </div>

      {/* Album Footer Statistics */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#9AA0AE] font-mono">
        <div className="flex items-center gap-1">
          <Disc3 className="w-3 h-3 text-white/40" />
          <span>{album.trackCount} tracks</span>
        </div>
        {album.releaseYear && (
          <span className="text-[9px] opacity-75">{album.releaseYear}</span>
        )}
      </div>

      {album.duration && (
        <p className="text-[9px] text-[#9AA0AE]/65 font-mono mt-1">
          Total Duration: {album.duration}
        </p>
      )}
    </motion.div>
  );
};
export default AlbumCard;
