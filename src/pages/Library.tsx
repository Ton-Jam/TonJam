import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Sparkles, 
  Antenna, 
  Music2, 
  Disc, 
  Users, 
  History, 
  Zap, 
  ShieldCheck,
  LayoutGrid,
  List,
  Search,
  ArrowUpRight,
  X,
  SearchIcon
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS, APP_LOGO } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import PlaylistListItem from '@/components/PlaylistListItem';
import ArtistListItem from '@/components/ArtistListItem';
import { ButtonGroupInput } from '@/components/ButtonGroupInput';
import { motion, AnimatePresence } from 'motion/react';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playlists, 
    createRecommendedPlaylist, 
    recentlyPlayed, 
    clearRecentlyPlayed, 
    likedTrackIds, 
    followedUserIds, 
    userNFTs, 
    allNFTs, 
    userTracks, 
    userProfile, 
    artists, 
    setIsCreatePlaylistModalOpen 
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'collection' | 'playlists' | 'activity'>('collection');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const myCollection = useMemo(() => {
    const base = allNFTs.filter(nft => 
      (nft.owner === userProfile.walletAddress) || 
      (nft.owner === userProfile.name) ||
      userNFTs.some(un => un.id === nft.id)
    );
    if (!localSearchQuery) return base;
    const query = localSearchQuery.toLowerCase();
    return base.filter(nft => 
      nft.name.toLowerCase().includes(query) || 
      nft.artist.toLowerCase().includes(query)
    );
  }, [allNFTs, userProfile, userNFTs, localSearchQuery]);

  const likedTracks = useMemo(() => {
    const allTracks = [...userTracks, ...MOCK_TRACKS];
    const base = allTracks.filter(t => likedTrackIds.includes(t.id));
    if (!localSearchQuery) return base;
    const query = localSearchQuery.toLowerCase();
    return base.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    );
  }, [likedTrackIds, userTracks, localSearchQuery]);

  const followedArtists = useMemo(() => {
    const base = artists.filter(a => followedUserIds.includes(a.id));
    if (!localSearchQuery) return base;
    const query = localSearchQuery.toLowerCase();
    return base.filter(a => a.name.toLowerCase().includes(query));
  }, [followedUserIds, artists, localSearchQuery]);

  const filteredPlaylists = useMemo(() => {
    if (!localSearchQuery) return playlists;
    const query = localSearchQuery.toLowerCase();
    return playlists.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    );
  }, [playlists, localSearchQuery]);

  const filteredRecentlyPlayed = useMemo(() => {
    if (!localSearchQuery) return recentlyPlayed;
    const query = localSearchQuery.toLowerCase();
    return recentlyPlayed.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    );
  }, [recentlyPlayed, localSearchQuery]);

  const stats = [
    { label: 'NFTs', value: likedTracks.length, icon: Music2 },
    { label: 'Artifacts', value: myCollection.length, icon: Zap },
    { label: 'Artists', value: followedArtists.length, icon: Users },
    { label: 'Playlists', value: playlists.length, icon: List },
  ];

  return (
    <div className="min-h-screen pb-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-4">
        {/* Search Bar at the Top */}
        <div className="pt-4 mb-4">
          <ButtonGroupInput 
            placeholder="Search within your library..." 
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 bg-gradient-to-b from-blue-900/20 to-background p-4 rounded-3xl">
          <div className="space-y-4">
            <h1 className="text-[32px] md:text-[56px] font-black tracking-tighter uppercase text-white leading-none">
              Library
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsCreatePlaylistModalOpen(true)}
              className="flex items-center gap-4 px-4 py-4 bg-blue-600 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Playlist
            </button>
            <button 
              onClick={createRecommendedPlaylist}
              className="flex items-center gap-4 px-4 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-neutral-100 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              AI Generation
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label} 
              className="p-4 rounded-2xl bg-muted/50 backdrop-blur-xl group hover:bg-foreground/[0.08] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-5 w-5 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <p className="text-[20px] font-black text-foreground tracking-tighter mb-4">{stat.value}</p>
              <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar pb-4">
          {(['collection', 'playlists', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-[7px] py-[7px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === tab ? 'bg-blue-500 text-white border-blue-500 shadow-lg active-pill' : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-border hover:text-blue-600 dark:hover:text-neutral-400 inactive-pill'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'collection' && (
              <div className="space-y-4">
                {/* NFT Artifacts */}
                <section className="p-4 rounded-3xl bg-blue-500/[0.03] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Digital Artifacts</h3>
                    </div>
                    <button onClick={() => navigate('/explore/nfts?title=My Collection&filter=my_nfts')} className="text-[9px] font-bold text-muted-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  {myCollection.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
                      {myCollection.slice(0, 10).map(nft => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Zap} message="No artifacts detected in vault" />
                  )}
                </section>

                {/* Liked Tracks */}
                <section className="p-4 rounded-3xl bg-emerald-500/[0.03] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <Music2 className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Stored Frequencies</h3>
                    </div>
                    <button onClick={() => navigate('/explore/tracks?title=Favorite Tracks&filter=favorites')} className="text-[9px] font-bold text-muted-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {likedTracks.slice(0, 10).map(track => (
                      <TrackCard key={track.id} track={track} variant="row" />
                    ))}
                  </div>
                </section>

                {/* My Tracks */}
                <section className="p-4 rounded-3xl bg-purple-500/[0.03] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <Music2 className="h-4 w-4 text-purple-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">My Uploaded Tracks</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {userTracks.slice(0, 10).map(track => (
                      <TrackCard key={track.id} track={track} variant="row" />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'playlists' && (
              <div className="space-y-4">
                <section className="p-4 rounded-3xl bg-violet-600/[0.03] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <List className="h-4 w-4 text-violet-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Active Playlists</h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 relative z-10">
                    {filteredPlaylists.length > 0 ? (
                      filteredPlaylists.map(playlist => (
                        <PlaylistListItem 
                          key={playlist.id} 
                          playlist={playlist} 
                          onClick={() => navigate(`/playlist/${playlist.id}`)} 
                        />
                      ))
                    ) : (
                      <EmptyState icon={List} message={localSearchQuery ? "No matching playlists found" : "No active playlists"} />
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {/* Recently Played */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <History className="h-4 w-4 text-blue-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Recent Activity</h3>
                    </div>
                    <button onClick={clearRecentlyPlayed} className="text-[9px] font-bold text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest">Purge History</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {filteredRecentlyPlayed.length > 0 ? (
                      filteredRecentlyPlayed.map(track => (
                        <div key={track.id} className="w-48 flex-shrink-0">
                          <TrackCard track={track} />
                        </div>
                      ))
                    ) : (
                      <div className="w-full">
                        <EmptyState icon={History} message={localSearchQuery ? "No matching activity found" : "No recent activity"} />
                      </div>
                    )}
                  </div>
                </section>

                {/* Followed Artists */}
                <section className="p-4 rounded-3xl bg-orange-500/[0.03] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <Users className="h-4 w-4 text-orange-500" />
                      <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em]">Followed Artists</h3>
                    </div>
                    <button onClick={() => navigate('/explore/artists?title=Followed Artists&filter=followed')} className="text-[9px] font-bold text-muted-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {followedArtists.map(artist => (
                      <ArtistListItem key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Security Footer */}
        <footer className="mt-4 pt-4 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-blue-500/20" />
            <div>
              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Decentralized Vault v2.4</p>
              <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest">All assets secured by TON Blockchain NFTs</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">Network Status</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Operational</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">Last Update</p>
              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Just Now</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="py-4 text-center flex flex-col items-center justify-center bg-foreground/[0.02] border border-dashed border-blue-500/30 rounded-3xl">
    <Icon className="h-12 w-12 text-foreground/5 mb-4" />
    <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">{message}</p>
  </div>
);

export default Library;
