import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryData } from './hooks/useLibraryData';
import { LibraryHero } from './components/LibraryHero';
import { QuickActions } from './components/QuickActions';
import { ContinueListening } from './components/ContinueListening';
import { LikedSongs } from './components/LikedSongs';
import { Playlists } from './components/Playlists';
import { Albums } from './components/Albums';
import { Artists } from './components/Artists';
import { NFTCollection } from './components/NFTCollection';
import { QueueManager } from './components/QueueManager';
import { DownloadsManager } from './components/DownloadsManager';
import { AnalyticsSection } from './components/AnalyticsSection';
import { ListeningHistory } from './components/ListeningHistory';
import { EmptyState } from './components/EmptyState';
import { CardSkeleton, StatsSkeleton, RowSkeleton } from './components/Skeletons';
import { LibraryImporter } from './components/LibraryImporter';
import { RoyaltiesDashboard } from './components/RoyaltiesDashboard';
import { ArtistProfile } from '@/components/ArtistProfile';

import { 
  Sparkles, Heart, Download, Zap, Disc, Clock, Search, List, LayoutGrid, 
  Settings, Database, BarChart3, ListMusic, History, SlidersHorizontal, Sun, Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LibraryPage: React.FC = () => {
  const { userProfile } = useAuth();
  const data = useLibraryData();
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [showImporter, setShowImporter] = useState(false);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState<string>('dj-krupy');

  // Expanded and comprehensive filter chips
  const filterChips = [
    'All', 'Tracks', 'Playlists', 'Albums', 'Artists', 'Downloads', 
    'NFT Music', 'Royalties', 'Recently Played', 'History', 'Analytics', 'Import'
  ];

  // Map quick action clicks to direct active chip filters
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'liked':
        data.setActiveChip('All');
        setShowImporter(false);
        // Soft scroll to liked songs section if All is chosen
        setTimeout(() => {
          document.getElementById('liked-songs-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      case 'downloads':
      case 'offline':
        data.setActiveChip('Downloads');
        setShowImporter(false);
        break;
      case 'queue':
      case 'recently-played':
        data.setActiveChip('Recently Played');
        setShowImporter(false);
        break;
      case 'history':
        data.setActiveChip('History');
        setShowImporter(false);
        break;
      case 'create-playlist':
        data.createPlaylist(`New Node Compilation #${Date.now().toString().slice(-4)}`);
        break;
      case 'import-playlist':
        data.setActiveChip('Import');
        setShowImporter(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="page-container w-full min-h-screen bg-slate-950 text-white pb-24">
      <div className="px-4 py-6 sm:px-6 w-full max-w-7xl mx-auto space-y-8">
        
        {/* 1. LIBRARY HERO */}
        {data.isLoading ? (
          <StatsSkeleton />
        ) : (
          <LibraryHero 
            userAvatar={userProfile?.avatar || (userProfile as any)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
            userName={userProfile?.name || 'Collector'}
            likedCount={data.likedCount}
            downloadCount={data.downloadCount}
            nftCount={data.nftCount}
            playlistCount={data.playlistCount}
            albumCount={data.rawAlbums.length}
            listeningHours={data.analytics.totalListeningHours}
          />
        )}

        {/* 2. QUICK ACTIONS */}
        {!data.isLoading && (
          <QuickActions 
            likedCount={data.likedCount}
            downloadCount={data.downloadCount}
            onSelectAction={handleQuickAction}
          />
        )}

        {/* 3. FILTER CHIPS & SEARCH CONTROLLER */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tracks, albums, collections..."
                value={data.searchQuery}
                onChange={(e) => data.setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-[10px] pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all text-white placeholder:text-slate-500"
              />
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="bg-slate-900 border border-white/5 rounded-[10px] p-1 flex items-center">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewLayout === 'grid' ? 'bg-[#0052FF] text-white' : 'text-slate-500 hover:text-white'}`}
                  title="Grid Layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewLayout === 'list' ? 'bg-[#0052FF] text-white' : 'text-slate-500 hover:text-white'}`}
                  title="List Layout"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrolling Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {filterChips.map((chip) => {
              const isActive = data.activeChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => {
                    data.setActiveChip(chip);
                    if (chip === 'Import') {
                      setShowImporter(true);
                    } else {
                      setShowImporter(false);
                    }
                  }}
                  className={`flex-shrink-0 snap-start px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-[#0052FF] text-white border-transparent shadow-lg shadow-[#0052FF]/20' 
                      : 'bg-slate-900 text-slate-400 hover:text-white border-white/5 hover:bg-slate-850'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN DYNAMIC CONTENT STREAM */}
        <div className="space-y-12">
          {data.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={data.activeChip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-12"
              >
                {/* OPTIONAL: LIBRARY IMPORT SECTION */}
                {(data.activeChip === 'Import' || showImporter) && (
                  <div className="border border-white/5 bg-slate-950/40 rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                        <Database className="w-4.5 h-4.5 text-[#0052FF]" /> Library Import Service
                      </h3>
                      <button 
                        onClick={() => {
                          setShowImporter(false);
                          if (data.activeChip === 'Import') data.setActiveChip('All');
                        }}
                        className="text-slate-500 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Hide Panel
                      </button>
                    </div>
                    <LibraryImporter 
                      importTracks={data.importTracks}
                      importPlaylistWithTracks={data.importPlaylistWithTracks}
                    />
                  </div>
                )}

                {/* 4. CONTINUE LISTENING */}
                {(data.activeChip === 'All' || data.activeChip === 'Tracks') && data.rawTracks.length > 0 && (
                  <div id="continue-listening-section">
                    <ContinueListening 
                      tracks={data.rawTracks} 
                      onPlay={data.handlePlayTrack} 
                    />
                  </div>
                )}

                {/* 5. LIKED SONGS */}
                {(data.activeChip === 'All' || data.activeChip === 'Tracks' || data.activeChip === 'Favorites') && (
                  <div id="liked-songs-section">
                    <LikedSongs 
                      tracks={data.tracks}
                      onPlay={data.handlePlayTrack}
                      onToggleLike={data.toggleLikeTrack}
                      onToggleDownload={data.toggleDownloadTrack}
                    />
                  </div>
                )}

                {/* 6. PLAYLISTS */}
                {(data.activeChip === 'All' || data.activeChip === 'Playlists' || data.activeChip === 'Favorites') && (
                  <div id="playlists-section">
                    <Playlists 
                      playlists={data.playlists}
                      onCreatePlaylist={data.createPlaylist}
                      onDeletePlaylist={data.deletePlaylist}
                      onTogglePin={data.togglePinPlaylist}
                    />
                  </div>
                )}

                {/* 7. ALBUMS */}
                {(data.activeChip === 'All' || data.activeChip === 'Albums' || data.activeChip === 'Favorites') && (
                  <div id="albums-section">
                    <Albums albums={data.albums} />
                  </div>
                )}

                {/* 8. ARTISTS */}
                {(data.activeChip === 'All' || data.activeChip === 'Artists' || data.activeChip === 'Favorites') && (
                  <div id="artists-section" className="space-y-8">
                    <Artists artists={data.artists} />
                    <div className="pt-4">
                      <ArtistProfile artistId={selectedArtistProfileId} onArtistChange={setSelectedArtistProfileId} />
                    </div>
                  </div>
                )}

                {/* 9. DOWNLOADED MUSIC */}
                {(data.activeChip === 'All' || data.activeChip === 'Downloads' || data.activeChip === 'Offline') && (
                  <div id="downloaded-music-section">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Downloaded Music</h3>
                      </div>
                      <DownloadsManager 
                        tracks={data.rawTracks}
                        albums={data.rawAlbums}
                        totalDownloadedSize={data.totalDownloadedSize}
                        downloadQuality={data.downloadQuality}
                        onChangeQuality={data.setDownloadQuality}
                        onRemoveDownload={data.toggleDownloadTrack}
                      />
                    </div>
                  </div>
                )}

                {/* 10. NFT COLLECTION */}
                {(data.activeChip === 'All' || data.activeChip === 'NFT Music' || data.activeChip === 'Collections') && (
                  <div id="nft-collection-section">
                    <NFTCollection 
                      nfts={data.nfts} 
                      totalFloorValue={data.totalNftsFloorValue} 
                    />
                  </div>
                )}

                {/* 11. RECENTLY PLAYED */}
                {(data.activeChip === 'All' || data.activeChip === 'Recently Played') && (
                  <div id="recently-played-section" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#0052FF]" />
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Recently Played</h3>
                    </div>
                    <QueueManager 
                      queue={data.queue}
                      onRemoveFromQueue={data.removeFromQueue}
                      onClearQueue={data.clearQueue}
                    />
                  </div>
                )}

                {/* 12. HISTORY */}
                {(data.activeChip === 'All' || data.activeChip === 'History') && (
                  <div id="history-section" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-500" />
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Detailed Listening History</h3>
                    </div>
                    <ListeningHistory 
                      history={data.history}
                      onPlay={data.handlePlayTrack}
                      onClearHistory={data.clearHistory}
                    />
                  </div>
                )}

                {/* 13. ANALYTICS */}
                {(data.activeChip === 'All' || data.activeChip === 'Analytics') && (
                  <div id="analytics-section">
                    <AnalyticsSection analytics={data.analytics} />
                  </div>
                )}

                {/* 14. ROYALTIES DASHBOARD */}
                {(data.activeChip === 'All' || data.activeChip === 'Royalties') && (
                  <div id="royalties-section">
                    <RoyaltiesDashboard />
                  </div>
                )}

                {/* 14. BOTTOM SPACER */}
                <div className="w-full h-16 border-t border-white/[0.02] flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase pt-6">
                  <span>TonJam Music Client • SECURE ledgers</span>
                  <span>v1.2.4</span>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
