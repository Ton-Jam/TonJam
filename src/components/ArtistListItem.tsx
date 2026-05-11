import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, UserCheck, ChevronRight, Play, Activity } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ArtistListItemProps {
  artist: Artist;
}

const ArtistListItem: React.FC<ArtistListItemProps> = ({ artist }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser, allTracks, playTrack } = useAudio();
  const isFollowing = followedUserIds.includes(artist.uid);

  const topTracks = useMemo(() => {
    return allTracks
      .filter(t => t.artistId === artist.uid)
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 3);
  }, [allTracks, artist.uid]);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(artist.uid);
  };

  const handleCardClick = () => {
    navigate(`/artist/${artist.uid}`);
  };

  return (
    <div 
      className="group flex flex-col gap-4 p-4 rounded-[4px] bg-foreground/[0.02] border border-white/5 hover:bg-muted/5 hover:border-white/10 transition-all duration-300 cursor-pointer w-full"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-[4px] overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
          <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[14px] font-black uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">
              {artist.name}
            </h4>
            {artist.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">
              {artist.genre || 'Electronic'}
            </p>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest truncate">
              {(artist.followers || 0).toLocaleString()} Fans
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleFollowClick}
            className={`px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-all text-[9px] font-black uppercase tracking-widest
              ${isFollowing 
                ? 'bg-muted/50 text-muted-foreground/80 hover:bg-muted border border-border' 
                : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }
            `}
          >
            {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Tracks Section */}
      {topTracks.length > 0 && (
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Top_Protocol_Streams</p>
          {topTracks.map((track, idx) => (
            <div 
              key={track.id}
              onClick={(e) => {
                e.stopPropagation();
                playTrack(track);
              }}
              className="flex items-center justify-between p-2 rounded-[2px] bg-white/[0.03] hover:bg-white/[0.08] transition-colors group/track"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-[10px] font-black text-white/10 w-4">{idx + 1}</span>
                <div className="w-8 h-8 rounded-[1px] overflow-hidden flex-shrink-0 border border-white/5 relative">
                  <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-blue-500/40 opacity-0 group-hover/track:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white/80 group-hover/track:text-blue-400 transition-colors truncate uppercase">{track.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase tracking-tighter">
                  <Activity className="w-3 h-3" />
                  {(track.playCount || 0).toLocaleString()}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 rounded-full bg-white/5 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover/track:opacity-100"
                >
                  <Play className="h-3 w-3 fill-current" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistListItem;
