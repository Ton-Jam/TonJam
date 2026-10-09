import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
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
import { ImportSpotifyPlaylistModal } from './components/ImportSpotifyPlaylistModal';
import { RoyaltiesDashboard } from './components/RoyaltiesDashboard';
import { ArtistProfile } from '@/components/ArtistProfile';
import { PageLayout } from '@/components/layout/PageLayout';

import { 
  Sparkles, Heart, Download, Zap, Disc, Clock, Search, List, LayoutGrid, 
  Settings, Database, BarChart3, ListMusic, History, SlidersHorizontal, Sun, Moon,
  WifiOff, HardDrive, Library as LibraryIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { localTracks, queue } = useAudio();
  const data = useLibraryData();
  const toast = useToast();
  const { testingTracks, injectTestingTracks, clearTestingTracks, isTestingTracksInjected } = useLibrary();
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('list');
  const [showImporter, setShowImporter] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState<string>('dj-krupy');
  const [nftSearchQuery, setNftSearchQuery] = useState('');
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const headerSearchInputRef = useRef<HTMLInputElement>(null);

  const handleOpenHeaderSearch = () => {
    setIsHeaderSearchOpen(true);
    setTimeout(() => {
      headerSearchInputRef.current?.focus();
    }, 50);
  };

  const handleCloseHeaderSearch = () => {
    setIsHeaderSearchOpen(false);
    data.setSearchQuery('');
  };

  // Filter NFTs dynamically by title or artist name
  const filteredNfts = data.nfts.filter(nft => {
    const q = (nftSearchQuery || data.searchQuery).toLowerCase();
    if (!q) return true;
    return nft.title.toLowerCase().includes(q) || nft.artist.toLowerCase().includes(q);
  });

  const filteredNftsFloorValue = filteredNfts.reduce((acc, nft) => acc + nft.floorPriceTon, 0);

  // Expanded and comprehensive filter chips
  const filterChips = [
    'All', 'Tracks', 'Playlists', 'Albums', 'Artists', 'Downloads', 'Device Music',
    'NFT Music', 'Royalties', 'Recently Played', 'History', 'Analytics', 'Import', 'Testing'
  ];

  // Map quick action clicks to dedicated screens or actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'liked':
        navigate('/favorite-tracks');
        break;
      case 'downloads':
      case 'offline':
        navigate('/library/downloads');
        break;
      case 'local-files':
        navigate('/library/downloads?tab=local');
        break;
      case 'recently-played':
      case 'history':
        navigate('/library/recently-played');
        break;
      case 'my-nfts':
      case 'nfts':
        navigate('/library/my-nfts');
        break;
      case 'import-playlist':
        navigate('/library/imported-playlists');
        break;
      case 'queue':
        navigate('/queue');
        break;
      case 'create-playlist':
        data.createPlaylist(`New Node Compilation #${Date.now().toString().slice(-4)}`);
        break;
      default:
        break;
    }
  };

  return (
    <PageLayout containerClassName="space-y-8" topSpacing="default">
        {/* 1. PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <LibraryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0052FF] shrink-0" />
              <span>My Library</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Your personal music collection, saved tracks, offline cache, and owned Music NFTs
            </p>
          </div>

          {/* Header Search Trigger & Input */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
            {isHeaderSearchOpen || data.searchQuery ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center w-full sm:w-72 md:w-80"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0052FF]" />
                <input
                  ref={headerSearchInputRef}
                  type="text"
                  placeholder="Search tracks, albums, collections..."
                  value={data.searchQuery}
                  onChange={(e) => data.setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 rounded-[10px] pl-10 pr-9 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0052FF] transition-all text-white placeholder:text-slate-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleCloseHeaderSearch}
                  aria-label="Close search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleOpenHeaderSearch}
                aria-label="Open search in library"
                title="Search Library"
                className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm select-none"
              >
                <Search className="w-4 h-4 text-[#0052FF]" />
                <span className="text-xs font-bold hidden sm:inline">Search</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. LIBRARY DESTINATIONS */}
        {!data.isLoading && (
          <QuickActions 
            likedCount={data.likedCount}
            downloadCount={data.downloadCount}
            nftCount={data.nftCount}
            localCount={localTracks.length}
            onSelectAction={handleQuickAction}
          />
        )}

        {/* 3. FILTER CHIPS & CONTROLS */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Scrolling Filter Chips with leading Search button */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x flex-1">
              <button
                type="button"
                onClick={handleOpenHeaderSearch}
                aria-label="Search filter"
                title="Search in Library"
                className={`flex-shrink-0 snap-start px-3 py-2 text-xs font-bold rounded-full cursor-pointer transition-all flex items-center gap-1.5 ${
                  isHeaderSearchOpen || data.searchQuery
                    ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              {filterChips.map((chip) => {
                const isActive = data.activeChip === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => {
                      if (chip === 'Downloads') {
                        navigate('/library/downloads');
                        return;
                      }
                      if (chip === 'Device Music') {
                        navigate('/library/downloads?tab=local');
                        return;
                      }
                      data.setActiveChip(chip);
                      if (chip === 'Import') {
                        setShowImporter(true);
                      } else {
                        setShowImporter(false);
                      }
                    }}
                    aria-pressed={isActive}
                    className={`flex-shrink-0 snap-start px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20' 
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Controls: Offline Service Worker Cache Toggle & Layout Toggle */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" role="group" aria-label="Library view and filter controls">
              {/* Offline Service Worker Cache Storage Filter Toggle */}
              <button
                type="button"
                id="library-offline-cache-toggle-btn"
                onClick={data.toggleOfflineMode}
                aria-pressed={data.isOfflineOnly}
                aria-label="Filter to only display tracks cached in service worker storage"
                className={`min-h-[38px] px-3.5 py-1.5 rounded-[10px] text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all border-none ${
                  data.isOfflineOnly
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={data.isOfflineOnly ? "Offline mode active: Showing only tracks cached in service worker" : "Toggle Offline filter (Service Worker storage)"}
              >
                <div className="relative flex items-center justify-center">
                  <WifiOff className="w-3.5 h-3.5" />
                  {data.isOfflineOnly && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  )}
                </div>
                <span>Offline</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  data.isOfflineOnly ? 'bg-emerald-700/60 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {data.cachedTrackCount}
                </span>
              </button>

              <div className="bg-slate-900 rounded-[10px] p-1 flex items-center relative">
                <button
                  type="button"
                  id="library-view-grid-btn"
                  onClick={() => setViewLayout('grid')}
                  aria-pressed={viewLayout === 'grid'}
                  aria-label="Switch to grid layout"
                  className={`relative p-1.5 rounded-md cursor-pointer transition-colors z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ${viewLayout === 'grid' ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                  title="Grid Layout"
                >
                  {viewLayout === 'grid' && (
                    <motion.div
                      layoutId="library-view-toggle-indicator"
                      className="absolute inset-0 bg-[#0052FF] rounded-md -z-10 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                  <LayoutGrid className="w-4 h-4 relative z-10" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  id="library-view-list-btn"
                  onClick={() => setViewLayout('list')}
                  aria-pressed={viewLayout === 'list'}
                  aria-label="Switch to list layout"
                  className={`relative p-1.5 rounded-md cursor-pointer transition-colors z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ${viewLayout === 'list' ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                  title="List Layout"
                >
                  {viewLayout === 'list' && (
                    <motion.div
                      layoutId="library-view-toggle-indicator"
                      className="absolute inset-0 bg-[#0052FF] rounded-md -z-10 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                  <List className="w-4 h-4 relative z-10" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Service Worker Cache Mode Status Banner */}
        {data.isOfflineOnly && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-slate-950 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-emerald-950/20 border-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Offline Cache Filter Active
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Service Worker Storage
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Displaying {data.tracks.length} track{data.tracks.length === 1 ? '' : 's'} available in offline browser storage. Streamable without internet connection.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={data.toggleOfflineMode}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all border-none bg-transparent cursor-pointer self-start sm:self-auto"
            >
              Disable Offline Mode
            </button>
          </div>
        )}

        {/* Empty state when in offline mode and no tracks are cached */}
        {data.isOfflineOnly && data.tracks.length === 0 && !data.isLoading && (
          <div className="bg-[#0B112C] rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto shadow-xl border-none">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">No Offline Tracks Cached</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You don't have any tracks currently cached in the service worker storage. Download tracks to enjoy them offline without an internet link.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={data.toggleOfflineMode}
                className="min-h-[44px] px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
              >
                Show All Tracks
              </button>
            </div>
          </div>
        )}

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
                      <div className="flex items-center gap-2">
                        <Database className="w-4.5 h-4.5 text-[#0052FF]" />
                        <h2 className="section-title">Library Import Service</h2>
                      </div>
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

                {/* 15. DEVELOPER TESTING PANEL (NO BORDER LINES) */}
                {data.activeChip === 'Testing' && (
                  <div className="bg-slate-900/30 rounded-2xl p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2 tracking-wide">
                          <Database className="w-5 h-5 text-[#0052FF]" /> Mock State Injector
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Dynamically inject high-fidelity testing tracks into local state storage to diagnose audio stream performance.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const res = injectTestingTracks();
                            if (res.success) {
                              toast.success('State Injected', res.message);
                            } else {
                              toast.error('Injection Failed', res.message);
                            }
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isTestingTracksInjected
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-[#0052FF] hover:bg-[#0040D9] text-white shadow-md'
                          }`}
                        >
                          {isTestingTracksInjected ? 'Tracks Loaded' : 'Inject Mock Tracks'}
                        </button>
                        {isTestingTracksInjected && (
                          <button
                            onClick={() => {
                              const res = clearTestingTracks();
                              if (res.success) {
                                toast.success('State Cleared', res.message);
                              } else {
                                toast.error('Purge Failed', res.message);
                              }
                            }}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Purge State
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/20 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                        <span>Target testing tracks ({testingTracks.length})</span>
                        <span className={isTestingTracksInjected ? 'text-emerald-400' : 'text-slate-500'}>
                          Status: {isTestingTracksInjected ? 'INJECTED' : 'NOT INJECTED'}
                        </span>
                      </div>
                      <div className="divide-y divide-white/[0.02]">
                        {testingTracks.map((track) => (
                          <div key={track.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <img
                                src={track.coverArtUrl}
                                alt={track.title}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white">{track.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{track.artist} • <span className="text-slate-500">{track.album || 'Single'}</span></p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                              </span>
                              <button
                                onClick={() => {
                                  // Map MockTrack to expected LibraryTrack structure for play context
                                  const libraryFormat = {
                                    id: track.id,
                                    title: track.title,
                                    artist: track.artist,
                                    album: track.album || 'Single',
                                    coverUrl: track.coverArtUrl,
                                    duration: track.duration,
                                    plays: 100,
                                    isLiked: true,
                                    isDownloaded: true,
                                    isOfflineAvailable: true
                                  };
                                  data.handlePlayTrack(libraryFormat as any);
                                }}
                                className="px-3 py-1.5 bg-slate-800/60 hover:bg-[#0052FF] text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                              >
                                Test Play
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                      onImportSpotify={() => setIsSpotifyModalOpen(true)}
                      layout={viewLayout}
                    />
                  </div>
                )}

                {/* 7. ALBUMS */}
                {(data.activeChip === 'All' || data.activeChip === 'Albums' || data.activeChip === 'Favorites') && (
                  <div id="albums-section">
                    <Albums albums={data.albums} layout={viewLayout} />
                  </div>
                )}

                {/* 8. ARTISTS */}
                {(data.activeChip === 'All' || data.activeChip === 'Artists' || data.activeChip === 'Favorites') && (
                  <div id="artists-section" className="space-y-8">
                    <Artists artists={data.artists} layout={viewLayout} />
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
                        <h2 className="section-title">Downloaded Music</h2>
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
                      nfts={filteredNfts} 
                      totalFloorValue={filteredNftsFloorValue} 
                      layout={viewLayout}
                    />
                  </div>
                )}

                {/* 11. RECENTLY PLAYED */}
                {(data.activeChip === 'All' || data.activeChip === 'Recently Played') && (
                  <div id="recently-played-section" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#0052FF]" />
                      <h2 className="section-title">Recently Played</h2>
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
                      <h2 className="section-title">Detailed Listening History</h2>
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
      <ImportSpotifyPlaylistModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        onImportPlaylist={data.importPlaylistWithTracks}
        onViewPlaylists={() => {
          data.setActiveChip('Playlists');
          setShowImporter(false);
          setTimeout(() => {
            document.getElementById('playlists-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
      />
    </PageLayout>
  );
};

export default LibraryPage;
