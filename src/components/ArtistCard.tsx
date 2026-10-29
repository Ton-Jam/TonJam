import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { cn, getPlaceholderImage } from '@/lib/utils';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import VerifiedArtistBadge from '@/components/common/VerifiedArtistBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';

interface ArtistCardProps {
  artist?: Artist;
  variant?: 'default' | 'row' | 'compact';
  className?: string;
  isLoading?: boolean;
  onMoreClick?: (artist: Artist) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  variant = 'default', 
  className = '', 
  isLoading = false, 
  onMoreClick 
}) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();

  if (isLoading || !artist) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-[#111C30]/50 animate-pulse", className)}>
        <Skeleton className="w-11 h-11 rounded-full bg-white/5 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24 bg-white/5" />
          <Skeleton className="h-2.5 w-16 bg-white/5" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full bg-white/5" />
      </div>
    );
  }

  const isFollowing = followedUserIds.includes(artist.uid);
  const isVerified = Boolean(artist.verified || (artist as any).isVerified || (artist as any).isVerifiedArtist);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFollowUser(artist.uid);
  };
  
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onMoreClick) onMoreClick(artist);
  };

  const handleCardClick = () => {
    navigate(`/artist/${artist.uid}`);
  };

  const username = (artist as any).username ? `@${(artist as any).username}` : undefined;
  const followerText = artist.followers 
    ? `${artist.followers.toLocaleString()} fans` 
    : (username || 'Artist');

  // Compact Row Variant
  if (variant === 'row' || variant === 'compact') {
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleCardClick}
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-2xl bg-[#111C30] hover:bg-[#17243A] cursor-pointer transition-all duration-200 select-none shadow-md shadow-black/20 w-full",
          className
        )}
      >
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-neutral-900 shadow-md">
          <LazyArtworkImage 
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
            fallbackSrc={getPlaceholderImage(`artist-${artist.uid}`)}
            alt={artist.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-xs text-white truncate leading-tight">
              {artist.name}
            </h3>
            <VerifiedArtistBadge 
              artistName={artist.name} 
              artistId={artist.uid} 
              isVerified={isVerified} 
              size="xs" 
            />
          </div>
          <p className="text-[10px] text-[#94A3B8] truncate mt-0.5 font-medium">
            {followerText}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={handleFollowClick} 
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border-none outline-none shadow-sm",
              isFollowing 
                ? "bg-white/10 hover:bg-white/20 text-[#94A3B8] hover:text-white" 
                : "bg-[#229ED9] hover:bg-[#168AC4] text-white shadow-[#229ED9]/25 active:scale-95"
            )}
            aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          {onMoreClick && (
            <button
              type="button"
              onClick={handleMoreClick}
              className="p-1.5 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid / Vertical Card Variant
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={cn(
        "group flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-[#111C30] hover:bg-[#17243A] cursor-pointer transition-all duration-200 select-none shadow-lg shadow-black/25 w-[130px] sm:w-[140px] shrink-0",
        className
      )}
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-neutral-900 transition-all mb-2 shrink-0 shadow-md shadow-black/40">
        <LazyArtworkImage 
          src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
          fallbackSrc={getPlaceholderImage(`artist-${artist.uid}`)}
          alt={artist.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {onMoreClick && (
          <button
            type="button"
            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white transition-all border-none shadow-sm"
            onClick={handleMoreClick}
            aria-label="More options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        <div className="flex items-center gap-1 justify-center max-w-full">
          <h3 className="text-xs font-bold text-white truncate max-w-[95px] leading-tight">
            {artist.name}
          </h3>
          <VerifiedArtistBadge 
            artistName={artist.name} 
            artistId={artist.uid} 
            isVerified={isVerified} 
            size="xs" 
          />
        </div>
        
        <p className="text-[10px] text-[#94A3B8] truncate font-medium">
          {followerText}
        </p>

        <button 
          type="button"
          onClick={handleFollowClick}
          className={cn(
            "mt-1.5 w-full py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border-none outline-none shadow-sm",
            isFollowing 
              ? "bg-white/10 hover:bg-white/20 text-[#94A3B8] hover:text-white" 
              : "bg-[#229ED9] hover:bg-[#168AC4] text-white shadow-[#229ED9]/25 active:scale-95"
          )}
          aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
