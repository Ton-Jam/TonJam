import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/utils';
import { Artist } from '@/types';
import { followUser } from '@/services/socialService';
import { useAudio } from '@/context/AudioContext';
import { toast } from 'sonner';

interface ArtistLeaderboardProps {
  artists: Artist[];
  title?: string;
  className?: string;
}

export const ArtistLeaderboard: React.FC<ArtistLeaderboardProps> = ({
  artists,
  title = "Artist Leaderboard",
  className = ""
}) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();

  const handleFollow = async (e: React.MouseEvent, artistUid: string) => {
    e.stopPropagation();
    try {
        await toggleFollowUser(artistUid);
        toast.success("Follow status updated");
    } catch (error) {
        toast.error("Failed to update follow status");
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h3>
      <div className="space-y-2">
        {artists.map((artist, index) => {
          const isFollowed = followedUserIds.includes(artist.uid);
          return (
            <div 
              key={artist.uid}
              onClick={() => navigate(`/artist/${artist.uid}`)}
              className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-500 w-4">{index + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={artist.avatarUrl} />
                  <AvatarFallback>{artist.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-bold text-white">{artist.name}</div>
                  <div className="text-[10px] text-zinc-500">{artist.followers.toLocaleString()} followers</div>
                </div>
              </div>
              <Button
                variant={isFollowed ? "outline" : "default"}
                size="sm"
                className="text-[10px] h-7"
                onClick={(e) => handleFollow(e, artist.uid)}
              >
                {isFollowed ? <UserCheck className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                {isFollowed ? 'Following' : 'Follow'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
