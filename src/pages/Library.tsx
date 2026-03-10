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
  ArrowUpRight
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS, APP_LOGO } from '@/constants';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import PlaylistListItem from '@/components/PlaylistListItem';
import ArtistListItem from '@/components/ArtistListItem';
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
    searchQuery, 
    setIsCreatePlaylistModalOpen 
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'collection' | 'playlists' | 'activity'>('collection');

  const myCollection = useMemo(() => {
    return allNFTs.filter(nft => 
      (nft.owner === userProfile.walletAddress) || 
      (nft.owner === userProfile.name) ||
      userNFTs.some(un => un.id === nft.id)
    );
  }, [allNFTs, userProfile, userNFTs]);

  const likedTracks = useMemo(() => {
    const allTracks = [...userTracks, ...MOCK_TRACKS];
    return allTracks.filter(t => likedTrackIds.includes(t.id));
  }, [likedTrackIds, userTracks]);

  const followedArtists = useMemo(() => {
    return artists.filter(a => followedUserIds.includes(a.id));
  }, [followedUserIds, artists]);

  const stats = [
    { label: 'Protocols', value: likedTracks.length, icon: Music2 },
    { label: 'Artifacts', value: myCollection.length, icon: Zap },
    { label: 'Nodes', value: followedArtists.length, icon: Users },
    { label: 'Syncs', value: playlists.length, icon: List },
  ];

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Secure Vault Access</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none">
              Library
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsCreatePlaylistModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Sync
            </button>
            <button 
              onClick={createRecommendedPlaylist}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600/20 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              AI Generation
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label} 
              className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl group hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-5 w-5 text-white/20 group-hover:text-blue-500 transition-colors" />
                <ArrowUpRight className="h-3 w-3 text-white/10 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <p className="text-2xl font-black text-white tracking-tighter mb-1">{stat.value}</p>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-10 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
          {(['collection', 'playlists', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTabLib" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
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
              <div className="space-y-16">
                {/* NFT Artifacts */}
                <section className="p-8 rounded-3xl bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Digital Artifacts</h3>
                    </div>
                    <button onClick={() => navigate('/explore/nfts?title=My Collection&filter=my_nfts')} className="text-[9px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  {myCollection.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
                      {myCollection.slice(0, 10).map(nft => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Zap} message="No artifacts detected in vault" />
                  )}
                </section>

                {/* Liked Tracks */}
                <section className="p-8 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <Music2 className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Stored Frequencies</h3>
                    </div>
                    <button onClick={() => navigate('/explore/tracks?title=Favorite Tracks&filter=favorites')} className="text-[9px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {likedTracks.slice(0, 10).map(track => (
                      <TrackCard key={track.id} track={track} variant="row" />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'playlists' && (
              <div className="space-y-8">
                <section className="p-8 rounded-3xl bg-violet-600/[0.03] border border-violet-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <List className="h-4 w-4 text-violet-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Active Syncs</h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 relative z-10">
                    {playlists.map(playlist => (
                      <PlaylistListItem 
                        key={playlist.id} 
                        playlist={playlist} 
                        onClick={() => navigate(`/playlist/${playlist.id}`)} 
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-16">
                {/* Recently Played */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4 text-blue-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Recent Activity</h3>
                    </div>
                    <button onClick={clearRecentlyPlayed} className="text-[9px] font-bold text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest">Purge History</button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {recentlyPlayed.map(track => (
                      <div key={track.id} className="w-48 flex-shrink-0">
                        <TrackCard track={track} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Followed Artists */}
                <section className="p-8 rounded-3xl bg-orange-500/[0.03] border border-orange-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-orange-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Synchronized Nodes</h3>
                    </div>
                    <button onClick={() => navigate('/explore/artists?title=Followed Nodes&filter=followed')} className="text-[9px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">View All</button>
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
        <footer className="mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-blue-500/20" />
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Decentralized Vault v2.4</p>
              <p className="text-[8px] text-white/20 uppercase tracking-widest">All assets secured by TON Blockchain Protocol</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Network Status</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Operational</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">Just Now</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="py-24 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
    <Icon className="h-12 w-12 text-white/5 mb-4" />
    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">{message}</p>
  </div>
);

export default Library;
