import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ArtistCardProps {
  artist?: Artist;
  variant?: 'default' | 'row' | 'compact';
  className?: string;
  isLoading?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, variant = 'default', className = '', isLoading = false }) => {
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

  const handleCardClick = () => {
    navigate(`/artist/${artist.uid}`);
  };

  if (variant === 'row') {
      return (
        <Card onClick={handleCardClick} className={cn("group p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all", className)}>
          <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }} />
          <div className="flex-1">
            <h3 className="font-bold">{artist.name}</h3>
            <p className="text-xs text-muted-foreground">{artist.followers.toLocaleString()} Followers</p>
          </div>
          <Button 
            className={cn(
                "rounded-full transition-all",
                isFollowing 
                  ? "bg-muted/50 text-muted-foreground border border-border hover:bg-muted/80" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              )}
              onClick={handleFollowClick} size="sm">
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </Card>
      )
  }

  return (
    <Card 
      onClick={handleCardClick}
      className={cn("group flex flex-col items-center text-center p-4 space-y-3 cursor-pointer hover:border-primary/50 transition-all", className)}
    >
      <img 
        src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
        alt={artist.name} 
        className="w-16 h-16 rounded-full object-cover shadow-md"
        onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }}
      />
      <div>
        <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-sm tracking-tight">{artist.name}</h3>
            {artist.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{artist.followers.toLocaleString()} Followers</p>
      </div>
      
      <Button 
        onClick={handleFollowClick}
        className={cn(
            "w-full rounded-full transition-all text-[10px] h-8",
            isFollowing 
              ? "bg-muted/50 text-muted-foreground border border-border hover:bg-muted/80" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          )}
      >
        {isFollowing ? (
            <><UserCheck className="w-4 h-4 mr-2" /> Following</>
        ) : (
            <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
        )}
      </Button>
    </Card>
  );
};

export default ArtistCard;
