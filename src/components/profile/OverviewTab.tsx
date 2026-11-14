import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Award, BarChart3 } from 'lucide-react';
import { ProfileData } from './ProfileTypes';
import { Section } from '@/components/layout/Section';
import { HorizontalCarousel } from '@/components/layout/HorizontalCarousel';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { useTask } from '@/contexts/TaskContext';

interface OverviewTabProps {
  profile: ProfileData;
  onPlayTrack: (trackId: string) => void;
  onSelectArtist: (artistId: string) => void;
}

const formatSeconds = (secs?: number | string) => {
  if (typeof secs === 'string') return secs;
  const total = Number(secs || 0);
  if (!total) return '0:00';
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onPlayTrack,
  onSelectArtist
}) => {
  const navigate = useNavigate();
  const { recentlyPlayed, allTracks, artists, playlists, userProfile, userNFTs } = useAudio();
  const { nfts } = useNFT();
  const { tasks: userTasks } = useTask();

  const recentTracks = useMemo(() => {
    const source = recentlyPlayed.length > 0 ? recentlyPlayed : allTracks.slice(0, 5);
    return source.slice(0, 5);
  }, [recentlyPlayed, allTracks]);

  const pinnedPlaylist = playlists[0];
  const featuredNft = userNFTs[0] || nfts[0];

  const genreStats = useMemo(() => {
    const source = recentlyPlayed.length > 0 ? recentlyPlayed : allTracks;
    if (source.length === 0) return [];
    const counts: Record<string, number> = {};
    source.forEach((t) => {
      const g = t.genre || 'Music';
      counts[g] = (counts[g] || 0) + 1;
    });
    const total = source.length;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre,
        percentage: Math.round((count / total) * 100),
      }));
  }, [recentlyPlayed, allTracks]);

  const followedIds = userProfile?.followedArtists || [];
  const favoriteArtistsList = useMemo(() => {
    const matched = artists.filter((a) => followedIds.includes(a.uid));
    return (matched.length > 0 ? matched : artists).slice(0, 8);
  }, [artists, followedIds]);

  const completedAchievements = useMemo(() => {
    return userTasks.filter((t) => t.status === 'completed').slice(0, 3);
  }, [userTasks]);

  return (
    <div className="space-y-4 text-white font-sans pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Play history */}
        <div className="lg:col-span-8 space-y-4">
          <Section 
            title="Recently Played" 
            lazy={true}
            className="!px-0 !my-0"
          >
            {recentTracks.length === 0 ? (
              <div className="bg-[#101A3B] p-6 rounded-[12px] text-center text-xs text-slate-400">
                No listening history yet.
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {recentTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track.id)}
                    className="bg-[#101A3B] p-3 rounded-[12px] flex items-center justify-between hover:bg-[#15234f] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-xs font-mono text-slate-500 font-bold shrink-0 w-4">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-slate-900 shrink-0">
                        {track.coverUrl && (
                          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">{formatSeconds(track.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {pinnedPlaylist && (
            <div className="bg-[#101A3B] rounded-[12px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:bg-[#15234f] transition-all">
              <div>
                <div className="inline-block px-2.5 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold uppercase tracking-widest rounded-md mb-2">
                  Pinned Playlist
                </div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                  {pinnedPlaylist.title}
                </h4>
                {pinnedPlaylist.description && (
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {pinnedPlaylist.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-mono text-slate-400">
                  {pinnedPlaylist.trackIds?.length || 0} tracks
                </span>
                <button 
                  onClick={() => navigate(`/playlist/${pinnedPlaylist.id}`)}
                  className="p-2.5 bg-slate-100 text-[#050A24] rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-[#050A24]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Achievements & Stats */}
        <div className="lg:col-span-4 space-y-4">
          {featuredNft && (
            <Section 
              title="Featured NFT" 
              lazy={true}
              className="!px-0 !my-0 bg-[#101A3B] rounded-[12px] p-4 flex flex-col justify-between"
            >
              <div className="w-full h-24 rounded-[8px] overflow-hidden bg-slate-900 relative mt-1">
                {featuredNft.imageUrl && (
                  <img 
                    src={featuredNft.imageUrl} 
                    alt={featuredNft.title} 
                    className="w-full h-full object-cover" 
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">{featuredNft.title}</h4>
                  <p className="text-[10px] text-slate-300">
                    {featuredNft.price ? `${featuredNft.price} TON` : 'Vault Item'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/nft/${featuredNft.id}`)}
                className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 active:bg-white/20 text-xs font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer text-slate-300 hover:text-white"
              >
                View NFT
              </button>
            </Section>
          )}

          {/* Listening Profile Stats */}
          <div className="bg-[#101A3B] rounded-[12px] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#0052FF]" />
              <span>Genre Breakdown</span>
            </h3>
            
            {genreStats.length === 0 ? (
              <p className="text-xs text-slate-400">Listen to tracks to build your genre profile.</p>
            ) : (
              <div className="space-y-3.5">
                {genreStats.map((stat) => (
                  <div key={stat.genre} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-200">{stat.genre}</span>
                      <span className="font-mono text-slate-400">{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0052FF] h-full rounded-full" 
                        style={{ width: `${stat.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements Block */}
          <div className="bg-[#101A3B] rounded-[12px] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Recent Achievements</span>
            </h3>
            
            {completedAchievements.length === 0 ? (
              <p className="text-xs text-slate-400">Complete Jam tasks to unlock achievements.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {completedAchievements.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-[8px] hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-[#0052FF]/10 text-[#0052FF] rounded-[8px] shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{badge.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favorite Artists */}
      {favoriteArtistsList.length > 0 && (
        <Section 
          title="Artists" 
          onSeeAll={() => navigate('/artists')}
          className="!px-0 pt-4"
        >
          <HorizontalCarousel className="mt-2">
            {favoriteArtistsList.map((artist) => (
              <div
                key={artist.uid}
                onClick={() => onSelectArtist(artist.uid)}
                className="bg-[#101A3B] rounded-[12px] p-3 text-center cursor-pointer hover:bg-[#15234f] transition-all group w-[124px] select-none"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto bg-slate-900 mb-2">
                  {artist.avatarUrl && (
                    <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white">{artist.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{Number(artist.followers || 0).toLocaleString()} followers</p>
              </div>
            ))}
          </HorizontalCarousel>
        </Section>
      )}
    </div>
  );
};
