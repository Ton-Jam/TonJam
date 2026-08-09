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

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-0.5 -mx-1">
        {featuredArtists.map((artist) => {
          // Find artist's top tracks from allTracks
          const artistTracks = allTracks
            .filter(t => t.artistId === artist.uid || t.artist === artist.name)
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
            .slice(0, 2);

          return (
            <motion.div
              key={artist.uid}
              whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
              className="w-[280px] shrink-0 bg-[#101A3B]/60 rounded-3xl p-5 border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/artist/${artist.uid}`)}
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-colors" />

              <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-12 h-12 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors shadow-xl shrink-0">
                    <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover w-full h-full" />
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-black uppercase tracking-tight truncate text-white">{artist.name}</h3>
                      {artist.verified && <Verified className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {(artist.followers || 0).toLocaleString()} <span className="text-[8px] opacity-60 lowercase">fans</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowUser(artist.uid);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shrink-0 ${
                    followedUserIds.includes(artist.uid)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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

              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Popular Releases</span>
                  <div className="h-[1px] flex-1 bg-white/5 mx-3" />
                </div>
                
                {artistTracks.length > 0 ? (
                  artistTracks.map((track) => (
                    <div 
                      key={track.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 transition-all group/track cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-9 h-9 shrink-0">
                          <img src={track.coverUrl} className="w-full h-full rounded-lg object-cover shadow-md" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/track:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Play className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-tight truncate text-white/90 leading-tight">{track.title}</div>
                          <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{(track.playCount || 0).toLocaleString()} PLAYS</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/track:bg-blue-500 transition-colors">
                        <Play className="w-2.5 h-2.5 text-zinc-400 group-hover/track:text-white" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 bg-black/10 rounded-2xl border border-dashed border-white/5">
                    <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em]">No tracks discovered</div>
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
