import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Verified, Users, Play, UserPlus, UserCheck } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const FeaturedArtists: React.FC = () => {
  const { artists, allTracks, playTrack, followedUserIds = [], toggleFollowUser } = useAudio();
  const navigate = useNavigate();

  // Get top 8 artists by followers (mock or real)
  const featuredArtists = useMemo(() => {
    return [...artists]
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, 8);
  }, [artists]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-lg font-black tracking-tight text-white">
          Featured Artists
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
          onClick={() => navigate('/artists')}
        >
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 px-0.5 w-full snap-x snap-mandatory">
        {featuredArtists.map((artist) => {
          // Find artist's top tracks from allTracks
          const artistTracks = allTracks
            .filter(t => t.artistId === artist.uid || t.artist === artist.name)
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
            .slice(0, 2);

          return (
            <motion.div
              key={artist.uid}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="w-[240px] sm:w-[260px] shrink-0 snap-start bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-between select-none"
              onClick={() => navigate(`/artist/${artist.uid}`)}
            >
              <div className="flex items-center justify-between gap-3 mb-3.5 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-11 h-11 shadow-lg shrink-0">
                    <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover w-full h-full" />
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs font-black uppercase tracking-tight truncate text-white">{artist.name}</h3>
                      {artist.verified && <Verified className="w-3 h-3 text-blue-400 shrink-0 fill-current" />}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {(artist.followers || 0).toLocaleString()} <span className="text-[8px] opacity-70 lowercase">fans</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowUser(artist.uid);
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shrink-0 cursor-pointer border-none ${
                    followedUserIds.includes(artist.uid)
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/10 hover:bg-white hover:text-black text-white'
                  }`}
                >
                  {followedUserIds.includes(artist.uid) ? (
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
              </div>

              <div className="space-y-1.5 relative z-10">
                {artistTracks.length > 0 ? (
                  artistTracks.map((track) => (
                    <div 
                      key={track.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/40 hover:bg-black/60 transition-all group/track cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 shrink-0">
                          <img src={track.coverUrl} className="w-full h-full rounded-lg object-cover shadow-sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-tight truncate text-white/90 leading-tight">{track.title}</div>
                          <div className="text-[8px] text-zinc-400 font-medium uppercase tracking-wider">{(track.playCount || 0).toLocaleString()} plays</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/track:bg-blue-500 transition-colors">
                        <Play className="w-2.5 h-2.5 text-zinc-300 group-hover/track:text-white ml-0.5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 bg-black/20 rounded-xl">
                    <div className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">No tracks yet</div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedArtists;
