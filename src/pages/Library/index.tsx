import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useLibraryData } from './hooks/useLibraryData';
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
import {
  QuickActionsSkeleton,
  LibraryScreenSkeleton
} from './components/Skeletons';
import { LibraryImporter } from './components/LibraryImporter';
import { ImportSpotifyPlaylistModal } from './components/ImportSpotifyPlaylistModal';
import { RoyaltiesDashboard } from './components/RoyaltiesDashboard';
import { ArtistProfile } from '@/components/ArtistProfile';
import { PageLayout } from '@/components/layout/PageLayout';

import {
  Heart,
  Download,
  Clock,
  Search,
  List,
  LayoutGrid,
  Database,
  ListMusic,
  History,
  WifiOff,
  Library as LibraryIcon,
  X,
  Play,
  Pause,
  Plus,
  Music2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const formatDuration = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { localTracks, queue, currentTrack, isPlaying } = useAudio();
  const data = useLibraryData();
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('list');
  const [showImporter, setShowImporter] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState<string>('');
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

  const filteredNftsFloorValue = data.nfts.reduce((acc, nft) => acc + nft.floorPriceTon, 0);

  const activeArtistProfileId = data.rawArtists.some((a) => a.id === selectedArtistProfileId)
    ? selectedArtistProfileId
    : data.rawArtists[0]?.id || '';

  const filterChips = [
    'All',
    'Tracks',
    'Playlists',
    'Albums',
    'Artists',
    'Downloads',
    'Device Music',
    'NFT Music',
    'Royalties',
    'Queue',
    'Recently Played',
    'History',
    'Analytics',
    'Import'
  ];

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
        navigate('/local-tracks');
        break;
      case 'recently-played':
        navigate('/library/recently-played');
        break;
      case 'history':
        data.setActiveChip('History');
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
        data.openCreatePlaylistModal();
        break;
      default:
        break;
    }
  };

  const hasActiveSearch = data.searchQuery.trim().length > 0;
  const hasAnySearchResults =
    data.tracks.length > 0 ||
    data.playlists.length > 0 ||
    data.albums.length > 0 ||
    data.artists.length > 0 ||
    data.nfts.length > 0 ||
    data.history.length > 0;

  return (
    <PageLayout containerClassName="space-y-7" topSpacing="default">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--tj-color-text-primary,#F8FAFC)] flex items-center gap-2.5">
            <LibraryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0" />
            <span>My Library</span>
          </h1>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] font-medium">
            Your personal music collection, saved tracks, offline cache, and owned Music NFTs
          </p>
        </div>

        {/* Header Search Trigger & Input */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
          {isHeaderSearchOpen || data.searchQuery ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex items-center w-full sm:w-72 md:w-80 rounded-[var(--tj-radius-md,8px)] border-0 transition-all bg-[var(--tj-color-input-background,#0B1F36)] focus-within:ring-1 focus-within:ring-[var(--tj-color-brand-primary,#00B4D8)]"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
              <input
                ref={headerSearchInputRef}
                type="text"
                placeholder="Search tracks, albums, collections..."
                value={data.searchQuery}
                onChange={(e) => data.setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-10 pr-9 py-2.5 text-xs font-semibold outline-none border-0 text-[var(--tj-color-text-primary,#F8FAFC)] placeholder:text-[var(--tj-color-text-muted,#7F91AA)]"
              />
              <button
                type="button"
                onClick={handleCloseHeaderSearch}
                aria-label="Close search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--tj-color-text-muted,#7F91AA)] hover:text-white rounded-full transition-colors cursor-pointer border-0 bg-transparent"
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
              className="min-h-[38px] flex items-center gap-2 px-3.5 py-2 rounded-[var(--tj-radius-md,8px)] bg-[var(--tj-color-chip-background,#102943)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white transition-colors cursor-pointer border-0 select-none"
            >
              <Search className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
              <span className="text-xs font-bold">Search Library</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. LIBRARY DESTINATIONS */}
      {data.isLoading ? (
        <QuickActionsSkeleton />
      ) : (
        <QuickActions
          likedCount={data.likedCount}
          downloadCount={data.downloadCount}
          nftCount={data.nftCount}
          localCount={localTracks.length}
          queueCount={queue.length}
          onSelectAction={handleQuickAction}
        />
      )}

      {/* 3. FILTER CHIPS & CONTROLS */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scrolling Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x flex-1">
            {filterChips.map((chip) => {
              const isActive = data.activeChip === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    if (chip === 'Device Music') {
                      navigate('/local-tracks');
                      return;
                    }
                    data.setActiveChip(chip);
                    setShowImporter(chip === 'Import');
                  }}
                  aria-pressed={isActive}
                  className={`flex-shrink-0 snap-start min-h-[34px] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer transition-colors border-0 ${
                    isActive
                      ? 'bg-[var(--tj-color-brand-primary,#00B4D8)] text-white'
                      : 'bg-[var(--tj-color-chip-background,#102943)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Controls: Offline Service Worker Cache Toggle & Layout Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" role="group" aria-label="Library view and filter controls">
            <button
              type="button"
              id="library-offline-cache-toggle-btn"
              onClick={data.toggleOfflineMode}
              aria-pressed={data.isOfflineOnly}
              aria-label="Filter to only display tracks cached in service worker storage"
              className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--tj-radius-md,8px)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border-0 ${
                data.isOfflineOnly
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)]'
              }`}
              title={data.isOfflineOnly ? 'Offline mode active: Showing only cached tracks' : 'Toggle Offline filter'}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[var(--tj-radius-xs,4px)] ${
                  data.isOfflineOnly
                    ? 'bg-emerald-700/60 text-white'
                    : 'bg-[var(--tj-color-bg-secondary,#0B1424)] text-[var(--tj-color-text-secondary,#A8B7CC)]'
                }`}
              >
                {data.cachedTrackCount}
              </span>
            </button>

            <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-md,8px)] p-1 flex items-center relative">
              <button
                type="button"
                id="library-view-grid-btn"
                onClick={() => setViewLayout('grid')}
                aria-pressed={viewLayout === 'grid'}
                aria-label="Switch to grid layout"
                className={`relative p-1.5 rounded-[var(--tj-radius-sm,6px)] cursor-pointer transition-colors z-10 border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tj-color-brand-primary,#00B4D8)] ${
                  viewLayout === 'grid' ? 'text-white' : 'text-[var(--tj-color-text-muted,#7F91AA)] hover:text-white'
                }`}
                title="Grid Layout"
              >
                {viewLayout === 'grid' && (
                  <motion.div
                    layoutId="library-view-toggle-indicator"
                    className="absolute inset-0 bg-[var(--tj-color-brand-primary,#00B4D8)] rounded-[var(--tj-radius-sm,6px)] -z-10"
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
                className={`relative p-1.5 rounded-[var(--tj-radius-sm,6px)] cursor-pointer transition-colors z-10 border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tj-color-brand-primary,#00B4D8)] ${
                  viewLayout === 'list' ? 'text-white' : 'text-[var(--tj-color-text-muted,#7F91AA)] hover:text-white'
                }`}
                title="List Layout"
              >
                {viewLayout === 'list' && (
                  <motion.div
                    layoutId="library-view-toggle-indicator"
                    className="absolute inset-0 bg-[var(--tj-color-brand-primary,#00B4D8)] rounded-[var(--tj-radius-sm,6px)] -z-10"
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
        <div className="bg-emerald-950/50 p-4 rounded-[var(--tj-radius-lg,10px)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--tj-radius-md,8px)] bg-emerald-500/12 text-emerald-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Offline Cache Filter Active
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Offline Storage
                </span>
              </div>
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] mt-0.5">
                Displaying {data.tracks.length} track{data.tracks.length === 1 ? '' : 's'} available for offline playback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={data.toggleOfflineMode}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.06] rounded-[var(--tj-radius-sm,6px)] transition-colors border-0 bg-emerald-600/30 cursor-pointer self-start sm:self-auto"
          >
            Disable Offline Mode
          </button>
        </div>
      )}

      {/* Empty state when in offline mode and no tracks are cached */}
      {data.isOfflineOnly && data.tracks.length === 0 && !data.isLoading && (
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-8 text-center space-y-4 max-w-md mx-auto border-0">
          <div className="w-14 h-14 rounded-full bg-emerald-500/12 text-emerald-400 flex items-center justify-center mx-auto">
            <WifiOff className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--tj-color-text-primary,#F8FAFC)]">No Offline Tracks Cached</h3>
            <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] leading-relaxed">
              You don&apos;t have any tracks currently cached for offline listening. Download tracks to play them without an internet connection.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={data.toggleOfflineMode}
              className="min-h-[42px] px-5 py-2.5 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] transition-colors border-0 cursor-pointer"
            >
              Show All Tracks
            </button>
          </div>
        </div>
      )}

      {/* Search empty state when query matches nothing */}
      {hasActiveSearch && !hasAnySearchResults && !data.isLoading && (
        <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-8 text-center space-y-3 border-0">
          <Search className="w-7 h-7 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--tj-color-text-primary,#F8FAFC)]">
              No matches for &ldquo;{data.searchQuery}&rdquo;
            </h3>
            <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
              Try a different track title, artist name, or collection.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseHeaderSearch}
            className="min-h-[38px] px-4 py-2 bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] text-white text-xs font-bold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] border-0 cursor-pointer transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* MAIN DYNAMIC CONTENT STREAM */}
      <div className="space-y-10">
        {data.isLoading ? (
          <LibraryScreenSkeleton activeChip={data.activeChip} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={data.activeChip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* LIBRARY IMPORT SECTION */}
              {(data.activeChip === 'Import' || showImporter) && (
                <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-5 sm:p-6 space-y-6 border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                      <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Library Import Service</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImporter(false);
                        if (data.activeChip === 'Import') data.setActiveChip('All');
                      }}
                      className="text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white text-xs font-bold cursor-pointer transition-colors border-0 bg-transparent"
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

              {/* CONTINUE LISTENING */}
              {(data.activeChip === 'All' || data.activeChip === 'Tracks') && data.rawTracks.length > 0 && !hasActiveSearch && (
                <div id="continue-listening-section">
                  <ContinueListening
                    tracks={data.rawTracks}
                    onPlay={data.handlePlayTrack}
                  />
                </div>
              )}

              {/* ALL / SEARCHED TRACKS CATALOG */}
              {(data.activeChip === 'Tracks' || (hasActiveSearch && data.activeChip === 'All' && data.tracks.length > 0)) && (
                <div id="tracks-section" className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                      <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">
                        {hasActiveSearch ? 'Matching Tracks' : 'Saved & Catalog Tracks'}
                      </h2>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--tj-color-chip-background,#102943)] text-[var(--tj-color-text-secondary,#A8B7CC)]">
                        {data.tracks.length}
                      </span>
                    </div>

                    <select
                      aria-label="Sort library tracks"
                      value={data.sortBy}
                      onChange={(e) => data.setSortBy(e.target.value as 'recently-added' | 'alphabetical' | 'artist')}
                      className="bg-[var(--tj-color-surface-elevated,#111C30)] text-[var(--tj-color-text-primary,#F8FAFC)] text-[11px] font-bold uppercase tracking-wider border-0 rounded-[var(--tj-radius-sm,6px)] px-2.5 py-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-[var(--tj-color-brand-primary,#00B4D8)]"
                    >
                      <option value="recently-added">Recently Added</option>
                      <option value="alphabetical">Title A–Z</option>
                      <option value="artist">Artist A–Z</option>
                    </select>
                  </div>

                  {data.tracks.length === 0 ? (
                    <div className="bg-[var(--tj-color-surface-elevated,#111C30)]/60 rounded-[var(--tj-radius-lg,10px)] p-8 text-center">
                      <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                        No tracks match your current filter.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.tracks.slice(0, 20).map((track) => {
                        const isCurrent = currentTrack?.id === track.id && isPlaying;
                        return (
                          <div
                            key={track.id}
                            className="bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-md,8px)] p-2.5 flex items-center justify-between gap-3 transition-colors group border-0"
                          >
                            <button
                              type="button"
                              onClick={() => data.handlePlayTrack(track)}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left bg-transparent border-0 cursor-pointer p-0"
                            >
                              <div className="relative w-11 h-11 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0">
                                <img
                                  src={track.coverUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span
                                  className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${
                                    isCurrent ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                                  }`}
                                >
                                  {isCurrent ? (
                                    <Pause className="w-4 h-4 text-white fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs sm:text-sm font-bold truncate ${
                                    isCurrent
                                      ? 'text-[var(--tj-color-brand-primary,#00B4D8)]'
                                      : 'text-[var(--tj-color-text-primary,#F8FAFC)]'
                                  }`}
                                >
                                  {track.title}
                                </h4>
                                <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                                  {track.artist} • {track.album}
                                </p>
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="hidden sm:inline text-[11px] font-mono text-[var(--tj-color-text-muted,#7F91AA)] mr-1 tabular-nums">
                                {formatDuration(track.duration)}
                              </span>
                              <button
                                type="button"
                                onClick={() => data.toggleLikeTrack(track.id)}
                                aria-label={track.isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}
                                className={`min-h-[34px] min-w-[34px] p-1.5 rounded-[var(--tj-radius-sm,6px)] hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center ${
                                  track.isLiked ? 'text-pink-500' : 'text-[var(--tj-color-text-muted,#7F91AA)]'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => data.toggleDownloadTrack(track.id)}
                                aria-label={track.isDownloaded ? `Remove offline copy of ${track.title}` : `Download ${track.title}`}
                                className={`min-h-[34px] min-w-[34px] p-1.5 rounded-[var(--tj-radius-sm,6px)] hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center ${
                                  track.isDownloaded ? 'text-emerald-400' : 'text-[var(--tj-color-text-muted,#7F91AA)]'
                                }`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => data.addToQueue(track)}
                                aria-label={`Add ${track.title} to queue`}
                                title="Add to queue"
                                className="min-h-[34px] min-w-[34px] p-1.5 rounded-[var(--tj-radius-sm,6px)] hover:bg-white/10 text-[var(--tj-color-text-muted,#7F91AA)] hover:text-white transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* LIKED SONGS */}
              {(data.activeChip === 'All' || data.activeChip === 'Tracks' || data.activeChip === 'Favorites') && (
                <div id="liked-songs-section">
                  <LikedSongs
                    tracks={data.likedTracks}
                    onPlay={data.handlePlayTrack}
                    onToggleLike={data.toggleLikeTrack}
                    onToggleDownload={data.toggleDownloadTrack}
                  />
                </div>
              )}

              {/* PLAYLISTS */}
              {(data.activeChip === 'All' || data.activeChip === 'Playlists' || data.activeChip === 'Favorites') && (
                <div id="playlists-section">
                  <Playlists
                    playlists={data.playlists}
                    onCreatePlaylist={data.createPlaylist}
                    onDeletePlaylist={data.deletePlaylist}
                    onTogglePin={data.togglePinPlaylist}
                    onImportSpotify={() => setIsSpotifyModalOpen(true)}
                    onOpenCreateModal={data.openCreatePlaylistModal}
                    layout={viewLayout}
                  />
                </div>
              )}

              {/* ALBUMS */}
              {(data.activeChip === 'All' || data.activeChip === 'Albums' || data.activeChip === 'Favorites') && (
                <div id="albums-section">
                  <Albums albums={data.albums} layout={viewLayout} />
                </div>
              )}

              {/* ARTISTS */}
              {(data.activeChip === 'All' || data.activeChip === 'Artists' || data.activeChip === 'Favorites') && (
                <div id="artists-section" className="space-y-8">
                  <Artists artists={data.artists} layout={viewLayout} />
                  {data.activeChip === 'Artists' && activeArtistProfileId && (
                    <div className="pt-2">
                      <ArtistProfile artistId={activeArtistProfileId} onArtistChange={setSelectedArtistProfileId} />
                    </div>
                  )}
                </div>
              )}

              {/* DOWNLOADED MUSIC */}
              {(data.activeChip === 'All' || data.activeChip === 'Downloads' || data.activeChip === 'Offline') && (
                <div id="downloaded-music-section">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Downloaded Music</h2>
                    </div>
                    <DownloadsManager
                      tracks={data.rawTracks}
                      albums={data.rawAlbums}
                      totalDownloadedSize={data.totalDownloadedSize}
                      downloadQuality={data.downloadQuality}
                      onChangeQuality={data.setDownloadQuality}
                      onRemoveDownload={data.toggleDownloadTrack}
                      onPlay={data.handlePlayTrack}
                    />
                  </div>
                </div>
              )}

              {/* NFT COLLECTION */}
              {(data.activeChip === 'All' || data.activeChip === 'NFT Music' || data.activeChip === 'Collections') && (
                <div id="nft-collection-section">
                  <NFTCollection
                    nfts={data.nfts}
                    totalFloorValue={filteredNftsFloorValue}
                    layout={viewLayout}
                  />
                </div>
              )}

              {/* RECENTLY PLAYED (Real playback history, separate from Active Queue) */}
              {(data.activeChip === 'All' || data.activeChip === 'Recently Played') && (
                <div id="recently-played-section" className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                      <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Recently Played</h2>
                    </div>
                    {data.history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate('/library/recently-played')}
                        className="text-xs font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-[var(--tj-color-brand-hover,#21C2E8)] flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {data.history.length === 0 ? (
                    <div className="bg-[var(--tj-color-surface-elevated,#111C30)]/60 rounded-[var(--tj-radius-lg,10px)] p-6 text-center">
                      <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                        No recently played tracks yet. Start streaming to see your recent playback here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {data.history.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            data.handlePlayTrack({
                              id: item.trackId,
                              title: item.title,
                              artist: item.artist,
                              artistId: '',
                              album: 'Single',
                              coverUrl: item.coverUrl,
                              duration: item.duration,
                              plays: 0,
                              isLiked: false,
                              isDownloaded: false,
                              isOfflineAvailable: false
                            })
                          }
                          className="bg-[var(--tj-color-surface-elevated,#111C30)] hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-md,8px)] p-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer group border-0"
                        >
                          <div className="relative w-11 h-11 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-[var(--tj-color-bg-secondary,#0B1424)] shrink-0">
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)] truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                              {item.artist}
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-[var(--tj-color-text-muted,#7F91AA)] shrink-0 tabular-nums">
                            {formatDuration(item.duration)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVE PLAYING QUEUE */}
              {(data.activeChip === 'All' || data.activeChip === 'Queue') && (
                <div id="queue-section" className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <ListMusic className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                      <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Up Next & Queue</h2>
                    </div>
                    {data.queue.length > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate('/queue')}
                        className="text-xs font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-[var(--tj-color-brand-hover,#21C2E8)] flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                      >
                        <span>Open Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <QueueManager
                    queue={data.queue}
                    onRemoveFromQueue={data.removeFromQueue}
                    onClearQueue={data.clearQueue}
                    onPlay={(item) => data.handlePlayTrack(item as any)}
                  />
                </div>
              )}

              {/* HISTORY */}
              {(data.activeChip === 'All' || data.activeChip === 'History') && (
                <div id="history-section" className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <History className="w-4 h-4 text-purple-400" />
                    <h2 className="section-title text-[var(--tj-color-text-primary,#F8FAFC)]">Detailed Listening History</h2>
                  </div>
                  <ListeningHistory
                    history={data.history}
                    onPlay={data.handlePlayTrack}
                    onClearHistory={data.clearHistory}
                  />
                </div>
              )}

              {/* ANALYTICS */}
              {(data.activeChip === 'All' || data.activeChip === 'Analytics') && (
                <div id="analytics-section">
                  <AnalyticsSection analytics={data.analytics} />
                </div>
              )}

              {/* ROYALTIES DASHBOARD */}
              {(data.activeChip === 'All' || data.activeChip === 'Royalties') && (
                <div id="royalties-section">
                  <RoyaltiesDashboard />
                </div>
              )}

              <div className="h-6" />
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
