import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck, MoreHorizontal } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
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
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full artist-card-custom-style"
    >
      <Card 
        onClick={handleCardClick}
        className={cn("group flex flex-col items-center text-center p-3 space-y-2 cursor-pointer transition-all bg-muted/20 border-none shadow-none rounded-[2px]", className)}
      >
      <div className="relative">
          <img 
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
            alt={artist.name} 
            className="w-14 h-14 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
            onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }}
          />
          {onMoreClick && (
            <button
               className="absolute -top-1 -right-1 p-1 bg-background rounded-full border border-border shadow-sm"
               onClick={handleMoreClick}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          )}
      </div>
      <div className="space-y-0.5 max-w-full overflow-hidden min-w-0">
        <div className="flex items-center justify-center gap-1 max-w-full">
            <h3 className="font-bold text-[10px] tracking-tight uppercase truncate">{artist.name}</h3>
            {artist.verified && <CheckCircle2 className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
        </div>
        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">{artist.followers.toLocaleString()} Followers</p>
      </div>
      
      <Button 
        onClick={handleFollowClick}
        variant={isFollowing ? "outline" : "default"}
        className={cn(
            "w-auto px-5 mx-auto rounded-full h-7 text-[9px] font-bold uppercase tracking-widest",
            !isFollowing && "bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white"
          )}
      >
        {isFollowing ? 'SYNCED' : 'FOLLOW'}
      </Button>
      </Card>
    </motion.div>
  );
};

export default ArtistCard;
