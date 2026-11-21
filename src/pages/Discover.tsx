import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Play, 
  Pause,
  TrendingUp, 
  Heart, 
  BadgeCheck, 
  MoreVertical, 
  Clock, 
  Sparkles, 
  Compass, 
  QrCode, 
  Mic, 
  MicOff,
  UserPlus,
  UserCheck,
  Disc,
  ListMusic,
  Radio,
  Gem,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useDebounce from '@/hooks/use-debounce';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchResultsSkeleton, FullDiscoverSkeleton } from '@/components/search/Skeletons';
import QRScanner from '@/components/QRScanner';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useTrendingSearches } from '@/hooks/useTrendingSearches';
import { ArtistLeaderboard } from '@/components/ArtistLeaderboard';
import { FeaturedArtistCard } from '@/components/FeaturedArtistCard';
import { DISCOVER_CATEGORIES, DiscoverCategory } from '@/constants/genres';

const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'artists', label: 'Artists' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'playlists', label: 'Playlists' }
];

const GENRE_DISCOVERY_CHIPS = [
  { label: 'Afrobeats', query: 'Afro-TON' },
  { label: 'Amapiano', query: 'Amapiano' },
  { label: 'Hip-hop', query: 'Hip Hop' },
  { label: 'Gospel', query: 'Gospel' }
];

const TRENDING_SEARCHES = [
  { label: 'New Afrobeats', query: 'New' },
  { label: 'TON music NFTs', query: 'NFT' }
];

const QUICK_VIBES = [
  { label: 'Afrobeats', query: 'Afro-TON' },
  { label: 'Amapiano', query: 'Amapiano' },
  { label: 'Hip-hop', query: 'Hip Hop' },
  { label: 'Gospel', query: 'Gospel' },
  { label: 'New Afrobeats', query: 'New' },
  { label: 'TON music NFTs', query: 'NFT' },
  { label: 'Phonk Drift', query: 'Phonk' },
  { label: 'Chill & Lo-Fi', query: 'Ambient' }
];

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const {
    allTracks = [],
    allNFTs = [],
    artists = [],
    firestoreUsers = [],
    playlists: allUserPlaylists = [],
    recentlyPlayed = [],
    clearRecentlyPlayed,
    currentTrack,
    isPlaying,
    isLoading = false,
    playTrack,
    playAll,
    followedUserIds = [],
    likedTrackIds = [],
    toggleLikeTrack,
    toggleFollowUser,
    setOptionsTrack
  } = useAudio();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFocused, setIsFocused] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // AI Discovery Feed State
  const [aiFeed, setAiFeed] = useState<{
    discoveryTheme: string;
    recommendations: { trackId: string; reason: string }[];
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const fetchAiDiscovery = async () => {
    if (allTracks.length === 0) return;
    setIsLoadingAi(true);
    try {
      const localTracks = (() => {
        try {
          const val = localStorage.getItem('tonjam_library_tracks');
          return val ? JSON.parse(val) : [];
        } catch {
          return [];
        }
      })();
      const localNfts = (() => {
        try {
          const val = localStorage.getItem('tonjam_library_nfts');
          return val ? JSON.parse(val) : [];
        } catch {
          return [];
        }
      })();

      const lightweightTracks = allTracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        tags: (t as any).tags || []
      }));

      const response = await fetch('/api/gemini/discover-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userContext: {
            libraryTracks: localTracks,
            likedNfts: localNfts
          },
          availableTracks: lightweightTracks
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setAiFeed(data);
          return;
        }
      }
      throw new Error('AI feed returned empty or invalid response');
    } catch (err) {
      // Graceful local heuristic fallback
      const favoriteGenres = new Set<string>();
      try {
        const val = localStorage.getItem('tonjam_library_tracks');
        if (val) {
          const parsed = JSON.parse(val);
          parsed.forEach((t: any) => { if (t.genre) favoriteGenres.add(t.genre.toLowerCase()); });
        }
      } catch {}

      const recs = allTracks
        .slice(0, 5)
        .map((t, idx) => ({
          trackId: t.id,
          reason: favoriteGenres.has((t.genre || '').toLowerCase())
            ? `Matched with your taste in ${t.genre || 'Web3 soundscapes'}.`
            : `Trending standout track curated by the TonJam Oracle.`
        }));

      setAiFeed({
        discoveryTheme: "On-Chain Resonance Mix",
        recommendations: recs
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (allTracks.length > 0 && !aiFeed) {
      fetchAiDiscovery();
    }
  }, [allTracks]);

  // Search history & trending searches tracking
  const {
    saveQuery
  } = useSearchHistory();

  // Real-time trending searches tracking
  const {
    recordSearchTerm
  } = useTrendingSearches();

  const handleSelectSearchTerm = (term: string) => {
    setQuery(term);
    saveQuery(term);
    recordSearchTerm(term);
  };

  // Auto-save query to search history & trending on debounced change
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      saveQuery(debouncedQuery);
      recordSearchTerm(debouncedQuery);
    }
  }, [debouncedQuery, saveQuery, recordSearchTerm]);

  // Voice Search Toggle
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsVoiceListening(true);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setQuery(text);
        setIsVoiceListening(false);
      };
      rec.onerror = () => setIsVoiceListening(false);
      rec.onend = () => setIsVoiceListening(false);
      rec.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Search Results Calculation
  const filteredResults = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    if (!q) {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
        nfts: [],
        users: []
      };
    }

    return {
      tracks: allTracks.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.artist?.toLowerCase().includes(q) ||
          t.genre?.toLowerCase().includes(q)
      ),
      artists: artists.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.genre?.toLowerCase().includes(q)
      ),
      albums: (allTracks
        .map((t) => ({ id: t.albumId || '', title: t.title + ' Album', artist: t.artist, coverUrl: t.coverUrl }))
        .filter((a) => a.id && a.title.toLowerCase().includes(q)) as any[]),
      playlists: allUserPlaylists.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.creator?.toLowerCase().includes(q)
      ),
      nfts: allNFTs.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.creator?.toLowerCase().includes(q) ||
          n.artist?.toLowerCase().includes(q) ||
          n.nftCollection?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q)
      ),
      users: firestoreUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q)
      ) as any[]
    };
  }, [debouncedQuery, allTracks, artists, allUserPlaylists, allNFTs, firestoreUsers]);

  // Recommended tracks
  const recommendedTracks = useMemo(() => {
    return allTracks.slice(0, 6);
  }, [allTracks]);

  // Last 5 recently played tracks from AudioProvider state
  const last5RecentlyPlayed = useMemo(() => {
    return recentlyPlayed.slice(0, 5);
  }, [recentlyPlayed]);

  // AI-Powered Discovery Mapped Tracks
  const recommendedTracksWithAi = useMemo(() => {
    if (!aiFeed || !aiFeed.recommendations) return [];
    return aiFeed.recommendations
      .map((rec) => {
        const track = allTracks.find((t) => t.id === rec.trackId);
        if (!track) return null;
        return {
          ...track,
          aiReason: rec.reason
        };
      })
      .filter(Boolean) as any[];
  }, [aiFeed, allTracks]);

  // Trending top 5
  const topTrendingTracks = useMemo(() => {
    return allTracks.slice(0, 5);
  }, [allTracks]);

  // Popular artists
  const popularArtists = useMemo(() => {
    return artists.slice(0, 5);
  }, [artists]);

  return (
    <div className="min-h-screen bg-transparent text-white pb-32 relative select-none w-full max-w-full overflow-x-hidden">
      <PageHeader title="Discover Music" showBack={true} />
      
      {/* Search Content Input Area */}
      <div className="pt-2 pb-3 px-3 space-y-4 w-full">

        {/* Main Search Input Bar - High border radius with subtle blue border */}
        <div className="w-full relative">
          <div className="relative w-full flex items-center bg-[#0A1628] rounded-full px-4 py-2.5 sm:py-3 min-h-[48px] border border-[#22374D] hover:border-[#38516B] focus-within:border-[#00B4D8] outline-none ring-0 transition-colors shadow-none">
            <Search className={`w-5 h-5 shrink-0 mr-3 transition-colors ${query ? 'text-[#00B4D8]' : 'text-[#8C8C8C]'}`} />
            
            <div className="flex-1 flex items-center min-w-0 h-full border-0 !border-none outline-none !outline-none ring-0 !ring-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                placeholder="Search artists, tracks, NFTs..."
                className="search-bar-input w-full bg-transparent border-0 !border-0 !border-none outline-none !outline-none ring-0 !ring-0 focus:ring-0 focus:outline-none focus:border-none text-sm sm:text-[15px] font-normal placeholder:text-[#8C8C8C] placeholder:opacity-100 text-white leading-relaxed p-0 shadow-none !shadow-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-label="Search TonJam"
              />
            </div>
            
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ${isVoiceListening ? 'text-[#00B4D8] animate-pulse bg-white/10' : 'text-[#b3b3b3] hover:text-white hover:bg-white/10'}`}
                title="Voice search"
                aria-label="Voice search"
              >
                {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Scan QR code"
                aria-label="Scan QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Search Focus Overlay */}
          <AnimatePresence>
            {isFocused && !query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--tj-color-surface-elevated,#111F36)] rounded-[var(--tj-radius-md,8px)] p-4 shadow-lg space-y-4 max-h-[75vh] overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* 1. Recently Searched / Played Tracks */}
                {last5RecentlyPlayed.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <Clock className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                        <span>Recently Played</span>
                      </div>
                      {typeof clearRecentlyPlayed === 'function' && (
                        <button
                          type="button"
                          onClick={clearRecentlyPlayed}
                          className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {last5RecentlyPlayed.map((track) => {
                        const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                        return (
                          <div
                            key={`focus-recent-track-${track.id}`}
                            onClick={() => {
                              playTrack(track);
                              setIsFocused(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-[var(--tj-radius-sm,6px)] bg-[var(--tj-color-surface-default,#0D1628)] hover:bg-[var(--tj-color-surface-hover,#132B49)] cursor-pointer transition-all group"
                          >
                            <div className="relative w-10 h-10 rounded-[var(--tj-radius-xs,4px)] overflow-hidden bg-zinc-900 shrink-0">
                              <img
                                src={track.coverUrl || getPlaceholderImage(track.title)}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all ${
                                isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {isCurrentPlaying ? (
                                  <Pause className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-current" />
                                )}
                              </div>
                            </div>

                            <div className="truncate flex-1">
                              <h4 className="text-xs font-medium text-white truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                                {track.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Quick Vibe Searches */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Popular Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_VIBES.map((vibe) => (
                      <button
                        type="button"
                        key={`focus-vibe-${vibe.query}`}
                        onClick={() => {
                          handleSelectSearchTerm(vibe.query);
                          setIsFocused(false);
                        }}
                        className="border-0 !border-none shadow-none px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--tj-color-chip-background,#102943)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white transition-colors cursor-pointer"
                      >
                        {vibe.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refined Search Filters */}
        <div className="space-y-2 pt-0.5 pb-1 w-full">
          {/* Primary Type Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full py-0.5">
            {FILTER_PILLS.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  type="button"
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  aria-pressed={isActive}
                  className={`filter-btn filter-silver-border border-silver-2 border-2 shadow-none px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors select-none cursor-pointer ${
                    isActive
                      ? 'active bg-[var(--tj-color-brand-primary,#00B4D8)] border-[rgba(192,192,192,0.35)] text-white'
                      : 'bg-[var(--tj-color-chip-background,#102943)] border-[rgba(192,192,192,0.22)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:border-[rgba(192,192,192,0.35)]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Quick Vibes / Tags without Emojis */}
          {!query.trim() && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-0.5">
              {QUICK_VIBES.map((vibe) => {
                const isSelected = query.toLowerCase() === vibe.query.toLowerCase();
                return (
                  <button
                    type="button"
                    key={vibe.query}
                    onClick={() => handleSelectSearchTerm(vibe.query)}
                    aria-pressed={isSelected}
                    className={`filter-btn filter-silver-border border-silver-2 border-2 shadow-none px-3 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors select-none cursor-pointer ${
                      isSelected
                        ? 'active bg-[var(--tj-color-chip-active-background,#063C55)] border-[rgba(192,192,192,0.35)] text-white'
                        : 'bg-[var(--tj-color-chip-background,#102943)] border-[rgba(192,192,192,0.22)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:border-[rgba(192,192,192,0.35)]'
                    }`}
                  >
                    {vibe.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Body */}
      <div className="w-full max-w-full px-0 pt-3 sm:pt-4 space-y-8 sm:space-y-10">

        {/* CONDITIONAL CONTENT: Search Results VS Spotify Search Home */}
        {query.trim() !== '' ? (
          (query !== debouncedQuery || isLoading) ? (
            <motion.div
              key="search-skeleton"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="px-2"
            >
              <SearchResultsSkeleton activeFilter={activeFilter} />
            </motion.div>
          ) : (
            <motion.div
              key={`search-results-${debouncedQuery}-${activeFilter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="px-2"
            >
              <SearchResults
                query={debouncedQuery}
                activeFilter={activeFilter}
                results={filteredResults}
                onPlayTrack={playTrack}
                followedUserIds={followedUserIds}
                onToggleFollow={toggleFollowUser}
                onClearQuery={() => setQuery('')}
                onResetFilter={() => setActiveFilter('all')}
                onSelectSuggestion={handleSelectSearchTerm}
                suggestedQueries={QUICK_VIBES.slice(0, 6)}
                suggestedTracks={recommendedTracks.slice(0, 4)}
              />
            </motion.div>
          )
        ) : (isLoading && allTracks.length === 0) ? (
          <FullDiscoverSkeleton />
        ) : (
          <div className="space-y-10 w-full">
            {/* 1. Browse All Categories */}
            <section className="space-y-3.5 w-full">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight px-3">Explore All Genres</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 px-2 w-full">
                {DISCOVER_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSearchTerm(category.query)}
                    className={`relative ${category.gradient} rounded-[var(--tj-radius-md,8px)] p-3.5 sm:p-4 overflow-hidden aspect-[16/10] cursor-pointer shadow-sm group transition-all select-none`}
                  >
                    <h4 className="text-sm sm:text-base font-black text-white tracking-tight uppercase max-w-[70%] leading-tight z-10 relative">
                      {category.title}
                    </h4>

                    {/* Rotated angled artwork preview on bottom right corner */}
                    <img
                      src={category.imgUrl}
                      alt={category.title}
                      className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-[var(--tj-radius-xs,4px)] shadow-md translate-x-2.5 translate-y-2.5 rotate-[18deg] group-hover:scale-105 group-hover:rotate-[14deg] transition-all duration-300 pointer-events-none"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Recommended For You ("Made For You") */}
            {recommendedTracks.length > 0 && (
              <section className="space-y-3.5 w-full">
                <div className="flex items-center justify-between px-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Recommended for You</h3>
                  </div>
                  <button
                    onClick={() => navigate('/explore/tracks?title=Recommended+for+You&filter=recommended')}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 px-2 scroll-smooth w-full">
                  {recommendedTracks.map((track) => (
                    <motion.div
                      key={`rec-track-${track.id}`}
                      whileHover={{ y: -3 }}
                      onClick={() => playTrack(track)}
                      className="w-[145px] sm:w-[155px] shrink-0 bg-white/[0.03] hover:bg-white/[0.06] rounded-[var(--tj-radius-md,8px)] p-3 flex flex-col justify-between cursor-pointer group transition-all select-none"
                    >
                      <div className="relative aspect-square rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-zinc-900 mb-2.5">
                        <img
                          src={track.coverUrl || getPlaceholderImage(track.title)}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5 shadow-md transform scale-90 group-hover:scale-100 transition-all">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                      </div>

                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* AI-Powered Discovery Feed Section */}
            {(isLoadingAi || (aiFeed && recommendedTracksWithAi.length > 0)) && (
              <section className="space-y-3.5 w-full">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-[#00B4D8]" />
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">AI Discovery</h3>
                  </div>
                  
                  <button
                    onClick={fetchAiDiscovery}
                    disabled={isLoadingAi}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAi ? 'Synthesizing...' : 'Re-align Frequencies'}
                  </button>
                </div>

                {isLoadingAi ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse bg-white/[0.03] rounded-[var(--tj-radius-md,8px)] p-4 h-24 flex gap-3.5">
                        <div className="w-16 h-16 bg-white/5 rounded-[var(--tj-radius-sm,6px)] shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3.5 bg-white/5 rounded w-1/3" />
                          <div className="h-2.5 bg-white/5 rounded w-1/4" />
                          <div className="h-2.5 bg-white/5 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-2">
                    {recommendedTracksWithAi.map((track) => (
                      <motion.div
                        key={`ai-rec-${track.id}`}
                        whileHover={{ y: -2 }}
                        onClick={() => playTrack(track)}
                        className="bg-white/[0.03] hover:bg-white/[0.06] rounded-[var(--tj-radius-md,8px)] p-3.5 sm:p-4 flex gap-3.5 cursor-pointer group transition-all select-none"
                      >
                        <div className="relative w-16 h-16 rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-zinc-900 shrink-0">
                          <img
                            src={track.coverUrl || getPlaceholderImage(track.title)}
                            alt={track.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <div className="w-8 h-8 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5 shadow-md">
                              <Play className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                              {track.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                          </div>
                          {track.aiReason && (
                            <p className="text-[11px] text-zinc-300 font-medium line-clamp-2 mt-1 italic leading-snug">
                              "{track.aiReason}"
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 4. Top Charts / Trending Tracks */}
            {topTrendingTracks.length > 0 && (
              <section className="space-y-3.5 w-full">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-rose-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Top Charts</h3>
                  </div>
                  <button
                    onClick={() => navigate('/explore/tracks?title=Top+Charts&filter=trending')}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 sm:space-y-2 px-2">
                  {topTrendingTracks.map((track, idx) => {
                    const isLiked = likedTrackIds.includes(track.id);
                    const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <motion.div
                        key={`top-chart-${track.id}`}
                        whileHover={{ x: 2 }}
                        onClick={() => playTrack(track)}
                        className={`p-2.5 sm:p-3 rounded-[var(--tj-radius-md,8px)] ${isCurrentPlaying ? 'bg-[#00B4D8]/10' : 'bg-white/[0.03]'} hover:bg-white/[0.06] flex items-center justify-between cursor-pointer group transition-all select-none`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className={`text-xs sm:text-sm font-extrabold w-4 sm:w-5 text-center shrink-0 ${
                            isCurrentPlaying ? 'text-[#00B4D8]' : idx === 0 ? 'text-amber-400 font-black' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-500'
                          }`}>
                            {isCurrentPlaying ? '▶' : `#${idx + 1}`}
                          </span>

                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--tj-radius-sm,6px)] overflow-hidden shrink-0 bg-zinc-900">
                            <img
                              src={track.coverUrl || getPlaceholderImage(track.title)}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            <div className={`absolute inset-0 bg-black/40 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-all`}>
                              {isCurrentPlaying ? (
                                <Pause className="w-4 h-4 text-[#00B4D8] fill-current" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-current" />
                              )}
                            </div>
                          </div>

                          <div className="truncate">
                            <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${isCurrentPlaying ? 'text-[#00B4D8]' : 'text-white group-hover:text-[#00B4D8]'}`}>
                              {track.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0 pr-1">
                          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (setOptionsTrack) setOptionsTrack(track);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            aria-label="Track options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 5. Featured Artist Spotlight */}
            <section className="space-y-3.5 w-full px-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight px-1">Artist Spotlight</h3>
              <FeaturedArtistCard />
            </section>

            {/* 6. Artist Leaderboard (Top 10) */}
            <section className="space-y-4 pt-2 w-full px-2">
              <ArtistLeaderboard 
                limit={10} 
                artists={artists} 
                title="Artist Leaderboard" 
                description="Top performing creators ranked by NFT sales volume and streaming activity" 
              />
            </section>

            {/* 6. Featured Playlists */}
            {allUserPlaylists.length > 0 && (
              <section className="space-y-3.5 w-full">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Featured Playlists</h3>
                  <button
                    onClick={() => navigate('/explore/playlists?title=Featured+Playlists&filter=curated')}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 px-2">
                  {allUserPlaylists.slice(0, 4).map((playlist) => (
                    <motion.div
                      key={`feat-playlist-${playlist.id}`}
                      whileHover={{ y: -3 }}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="bg-white/[0.03] hover:bg-white/[0.06] rounded-[var(--tj-radius-md,8px)] p-3 sm:p-3.5 cursor-pointer group transition-all select-none"
                    >
                      <div className="relative aspect-square rounded-[var(--tj-radius-sm,6px)] overflow-hidden bg-zinc-900 mb-2.5">
                        <img
                          src={playlist.coverUrl || getPlaceholderImage(playlist.title)}
                          alt={playlist.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5 shadow-md transform scale-90 group-hover:scale-100 transition-all">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                        {playlist.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">by {playlist.creator}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={(scanned) => {
            if (scanned) setQuery(scanned);
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
};

export default Discover;
