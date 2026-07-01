import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, CheckCircle2, UserPlus, UserCheck, Music } from 'lucide-react';
import { ArtistPlaceholder } from '../placeholders/ArtistPlaceholder';

export interface ArtistData {
  id: string;
  name: string;
  avatarUrl: string;
  followers: string | number;
  monthlyListeners?: string | number;
  genre?: string;
  country?: string;
  isOnline?: boolean;
  isVerified?: boolean;
}

interface ArtistCardProps {
  // Supports backwards compatibility
  name?: string;
  avatarUrl?: string;
  followers?: string | number;
  
  // High-fidelity structured artist object
  artist?: ArtistData;
  isLoading?: boolean;
  onFollow?: (artist: ArtistData) => void;
  onPlay?: (artist: ArtistData) => void;
  onClick?: (artist: ArtistData) => void;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  avatarUrl,
  followers,
  artist,
  isLoading = false,
  onFollow,
  onPlay,
  onClick,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Derive final values from direct props or structural object
  const finalName = artist?.name || name || 'Unknown Artist';
  const finalAvatar = artist?.avatarUrl || avatarUrl || '';
  const finalFollowers = artist?.followers || followers || '0';
  const finalListeners = artist?.monthlyListeners || '';
  const finalGenre = artist?.genre || '';
  const finalCountry = artist?.country || '';
  const isOnline = artist?.isOnline || false;
  const isVerified = artist?.isVerified || false;

  const resolvedArtist: ArtistData = artist || {
    id: 'compat',
    name: finalName,
    avatarUrl: finalAvatar,
    followers: finalFollowers,
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center p-4 rounded-[10px] bg-[#0A113A] animate-pulse w-[140px] shrink-0 ${className}`}>
        <div className="w-20 h-20 rounded-full bg-white/10 mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    if (onFollow) onFollow(resolvedArtist);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(resolvedArtist);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(resolvedArtist);
    } else {
      // Custom route dispatch or navigation helper
      const customEvent = new CustomEvent('navigate-to-artist', { detail: resolvedArtist });
      window.dispatchEvent(customEvent);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleCardClick}
      className={`flex flex-col items-center p-4 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[150px] shrink-0 snap-start select-none group relative ${className}`}
    >
      {/* Circular Profile Photo Wrapper */}
      <div className="relative w-24 h-24 mb-3 rounded-full shrink-0 bg-slate-950">
        {imgFailed || !finalAvatar ? (
          <ArtistPlaceholder size={32} />
        ) : (
          <img
            src={finalAvatar}
            alt={finalName}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Online Status Indicator */}
        {isOnline && (
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0A113A]" />
        )}

        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handlePlayClick}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg active:scale-90"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Verified Name */}
      <div className="flex items-center justify-center gap-1 w-full min-w-0">
        <h4 className="text-[13px] font-bold text-white truncate text-center max-w-[85%]">
          {finalName}
        </h4>
        {isVerified && (
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />
        )}
      </div>

      {/* Stats and Context */}
      <div className="text-center mt-1 space-y-0.5">
        <p className="text-[11px] text-[#9AA0AE] font-mono">
          {typeof finalFollowers === 'number'
            ? `${finalFollowers.toLocaleString()} fans`
            : finalFollowers}
        </p>
        
        {finalListeners && (
          <p className="text-[9px] text-[#9AA0AE]/80 font-mono">
            {finalListeners} monthly
          </p>
        )}

        {finalCountry && (
          <p className="text-[8px] uppercase tracking-wider text-[#9AA0AE]/60">
            {finalCountry} {finalGenre ? `• ${finalGenre}` : ''}
          </p>
        )}
      </div>

      {/* Inline Quick Action Follow Button */}
      <button
        onClick={handleFollowClick}
        className={`mt-3 py-1 px-3 rounded-full flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all active:scale-90 w-full ${
          isFollowing
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck className="w-3 h-3" />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3" />
            <span>Follow</span>
          </>
        )}
      </button>
    </motion.div>
  );
};
export default ArtistCard;
