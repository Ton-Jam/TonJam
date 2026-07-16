import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Verified, UserPlus, UserCheck, MoreHorizontal } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { motion } from 'motion/react';
import { cardTokens } from '@/design';


interface ArtistCardProps {
  artist?: Artist;
  variant?: 'default' | 'row' | 'compact';
  className?: string;
  isLoading?: boolean;
  onMoreClick?: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, variant = 'default', className = '', isLoading = false, onMoreClick }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();

  if (isLoading || !artist) {
    return (
      <Card className={cn("flex flex-col items-center justify-center p-6 space-y-4", className)}>
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full rounded-full" />
      </Card>
    );
  }

  const isFollowing = followedUserIds.includes(artist.uid);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(artist.uid);
  };
  
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreClick && onMoreClick(artist);
  };

  const handleCardClick = () => {
    navigate(`/artist/${artist.uid}`);
  };

  if (variant === 'row') {
      return (
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full artist-card-custom-style"
        >
          <Card onClick={handleCardClick} className={cn("group p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all", className)}>
            <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[12px] truncate uppercase">{artist.name}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{artist.followers.toLocaleString()} LISTENERS</p>
            </div>
            <Button 
              className={cn(
                  "rounded-full transition-all",
                  isFollowing 
                    ? "bg-muted/50 text-muted-foreground border border-border hover:bg-muted/80" 
                    : "bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                )}
                onClick={handleFollowClick} size="sm">
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            {onMoreClick && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMoreClick}>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </Card>
        </motion.div>
      )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: cardTokens.animation.hoverScale }}
      whileTap={{ scale: cardTokens.animation.tapScale }}
      style={{ width: cardTokens.artist.width, padding: cardTokens.global.padding, borderRadius: cardTokens.global.borderRadius }}
      className={cn("group flex flex-col items-center text-center relative cursor-pointer transition-all duration-300 bg-[#0A113A]/50 hover:bg-white/[0.05]", className)}
      onClick={handleCardClick}
    >
      <div 
        style={{ width: cardTokens.artist.avatarSize, height: cardTokens.artist.avatarSize }}
        className="relative rounded-full overflow-hidden bg-background transition-all mb-2 border border-white/5 flex-shrink-0"
      >
        <img 
          src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
          alt={artist.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }}
        />
        {onMoreClick && (
          <button
             className="absolute top-1.5 right-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:text-white transition-all"
             onClick={(e) => { e.stopPropagation(); onMoreClick(artist); }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1 justify-center max-w-full">
          <h3 className="text-[12px] font-bold text-foreground truncate max-w-[100px] uppercase tracking-tight">
            {artist.name}
          </h3>
          {artist.verified && <Verified className="w-3 h-3 text-blue-400 fill-current flex-shrink-0" />}
        </div>
        
        <p className="text-[10px] text-muted-foreground truncate mb-2 uppercase tracking-wider font-semibold">
          {artist.followers ? `${artist.followers.toLocaleString()} fans` : 'artist'}
        </p>

        <Button 
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
          onClick={handleFollowClick}
          style={{ height: cardTokens.artist.followButtonHeight }}
          className="w-full text-[8px] uppercase tracking-widest font-black rounded-full"
        >
          {isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
