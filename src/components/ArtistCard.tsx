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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn("group flex flex-col items-center text-center relative cursor-pointer transition-all duration-300 rounded-card p-4 bg-surface hover:bg-hover w-full", className)}
      onClick={handleCardClick}
    >
      <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-avatar overflow-hidden bg-background transition-all mb-3 border border-border-subtle">
        <img 
          src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
          alt={artist.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-avatar" 
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }}
        />
        {onMoreClick && (
          <button
             className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-md rounded-avatar border border-border-subtle text-text-primary hover:text-primary transition-all"
             onClick={(e) => { e.stopPropagation(); onMoreClick(artist); }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 justify-center max-w-full">
          <h3 className="text-card-title text-text-primary truncate max-w-[150px]">
            {artist.name}
          </h3>
          {artist.verified && <Verified className="w-3.5 h-3.5 text-verified flex-shrink-0" />}
        </div>
        
        <p className="text-caption truncate mb-3">
          @{artist.username || artist.name.toLowerCase().replace(/\s+/g, '')}
        </p>

        <Button 
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
          onClick={handleFollowClick}
          className="w-full h-8 text-[9px] uppercase tracking-widest"
        >
          {isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
