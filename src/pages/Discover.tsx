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
  History,
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
  Flame,
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

interface SpotifyCategory {
  id: string;
  title: string;
  query: string;
  gradient: string;
  imgUrl: string;
}

const SPOTIFY_CATEGORIES: SpotifyCategory[] = [
  { id: 'cat-1', title: 'Phonk & Drift', query: 'Phonk', gradient: 'bg-gradient-to-br from-emerald-600 to-teal-900', imgUrl: 'https://picsum.photos/seed/phonk/300/300' },
  { id: 'cat-2', title: 'Synthwave & Cyber', query: 'Synthwave', gradient: 'bg-gradient-to-br from-purple-600 to-indigo-900', imgUrl: 'https://picsum.photos/seed/synthwave/300/300' },
  { id: 'cat-3', title: 'Afro-TON Beats', query: 'Afro-TON', gradient: 'bg-gradient-to-br from-amber-500 to-rose-800', imgUrl: 'https://picsum.photos/seed/afro/300/300' },
  { id: 'cat-4', title: 'Electronic & House', query: 'Electronic', gradient: 'bg-gradient-to-br from-blue-600 to-cyan-900', imgUrl: 'https://picsum.photos/seed/electronic/300/300' },
  { id: 'cat-5', title: 'Hip Hop & Rap', query: 'Hip Hop', gradient: 'bg-gradient-to-br from-rose-600 to-pink-900', imgUrl: 'https://picsum.photos/seed/hiphop/300/300' },
  { id: 'cat-6', title: 'Pop & Chart Hits', query: 'Pop', gradient: 'bg-gradient-to-br from-fuchsia-600 to-pink-800', imgUrl: 'https://picsum.photos/seed/pophits/300/300' },
  { id: 'cat-7', title: 'Rock & Metal', query: 'Rock', gradient: 'bg-gradient-to-br from-red-700 to-slate-900', imgUrl: 'https://picsum.photos/seed/rock/300/300' },
  { id: 'cat-8', title: 'Chill & Lo-Fi', query: 'Ambient', gradient: 'bg-gradient-to-br from-teal-600 to-emerald-900', imgUrl: 'https://picsum.photos/seed/lofi/300/300' },
  { id: 'cat-9', title: 'New Drops', query: 'New', gradient: 'bg-gradient-to-br from-cyan-600 to-blue-900', imgUrl: 'https://picsum.photos/seed/newdrops/300/300' },
  { id: 'cat-10', title: 'Music NFTs', query: 'NFT', gradient: 'bg-gradient-to-br from-purple-600 to-indigo-950', imgUrl: 'https://picsum.photos/seed/musicnft/300/300' },
  { id: 'cat-11', title: 'Live Spaces', query: 'Live', gradient: 'bg-gradient-to-br from-orange-600 to-red-900', imgUrl: 'https://picsum.photos/seed/livespaces/300/300' },
  { id: 'cat-12', title: 'Top Charts 50', query: 'Top', gradient: 'bg-gradient-to-br from-yellow-600 to-amber-900', imgUrl: 'https://picsum.photos/seed/topcharts/300/300' }
];

const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'nfts', label: 'NFTs' }
];

const QUICK_VIBES = [
  { label: '⚡ High Energy', query: 'Electronic' },
  { label: '🏎️ Phonk Drift', query: 'Phonk' },
  { label: '🌙 Chill & Lo-Fi', query: 'Ambient' },
  { label: '💎 Web3 NFTs', query: 'NFT' },
  { label: '🔥 Top Charts', query: 'Top' },
  { label: '🎹 Synthwave', query: 'Synthwave' },
  { label: '🌍 Afro-TON', query: 'Afro-TON' },
  { label: '🎤 Hip Hop', query: 'Hip Hop' }
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

  // Recent Searches
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : ['Phonk', 'Krupy Vibes', 'Synthwave', 'TON NFT'];
    } catch {
      return ['Phonk', 'Krupy Vibes', 'Synthwave', 'TON NFT'];
    }
  });

  const handleSelectSearchTerm = (term: string) => {
    setQuery(term);
    const updated = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 8);
    setSearchHistory(updated);
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
  };

  const handleRemoveSearchTerm = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = searchHistory.filter((h) => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tonjam_search_history');
  };

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
          p.description?.toLowerCase().includes(q)
      ),
      nfts: allNFTs.filter((n) => n.title?.toLowerCase().includes(q)),
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
    <div className="min-h-screen bg-black text-white pb-32 relative select-none w-full max-w-full overflow-x-hidden">
      
      {/* Sticky Spotify-Style Search Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md pt-3 sm:pt-4 pb-3 px-4 sm:px-6 lg:px-8 space-y-2.5">
        
        {/* Main Search Input Bar with grey background, round border radius and borderless input */}
        <div className="w-full relative">
          <div className="relative w-full flex items-center bg-[#222226] hover:bg-[#2a2a30] focus-within:bg-[#2a2a30] rounded-full px-4 py-2.5 sm:py-3 min-h-[48px] border border-white/20 focus-within:border-[#0088CC] transition-all shadow-none">
            <Search className={`w-5 h-5 shrink-0 mr-3 transition-colors ${query ? 'text-[#00B4D8]' : 'text-zinc-400'}`} />
            
            <div className="flex-1 flex items-center min-w-0 h-full border-0 !border-none outline-none !outline-none ring-0 !ring-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                placeholder="What do you want to listen to?"
                className="search-bar-input w-full bg-transparent border-0 !border-0 !border-none outline-none !outline-none ring-0 !ring-0 focus:ring-0 focus:outline-none focus:border-none text-sm font-medium placeholder:text-zinc-400 placeholder:opacity-100 text-white leading-relaxed p-0 shadow-none !shadow-none"
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
                  onClick={() => setQuery('')}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={toggleVoiceSearch}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${isVoiceListening ? 'text-[#00B4D8] animate-pulse bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                title="Voice search"
                aria-label="Voice search"
              >
                {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowScanner(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                title="Scan QR code"
                aria-label="Scan QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Search Focus Overlay - Shows only when Search Bar is clicked/focused */}
          <AnimatePresence>
            {isFocused && !query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0a0a0c] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4 max-h-[75vh] overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()} // Prevents blur before click registers
              >
                {/* 1. Recent Search Queries */}
                {searchHistory.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                        <History className="w-3.5 h-3.5 text-[#00B4D8]" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={handleClearAllHistory}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((term) => (
                        <div
                          key={`focus-recent-${term}`}
                          onClick={() => {
                            handleSelectSearchTerm(term);
                            setIsFocused(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 cursor-pointer transition-all text-xs font-medium text-zinc-200 hover:text-white select-none group"
                        >
                          <Search className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                          <span>{term}</span>
                          <button
                            onClick={(e) => handleRemoveSearchTerm(term, e)}
                            className="p-0.5 text-zinc-500 hover:text-white rounded-full transition-colors ml-0.5"
                            aria-label={`Remove ${term}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Recently Searched / Played Tracks (Appears on Search Bar Click) */}
                {last5RecentlyPlayed.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-[#00B4D8]" />
                        <span>Recently Played Tracks</span>
                      </div>
                      {typeof clearRecentlyPlayed === 'function' && (
                        <button
                          onClick={clearRecentlyPlayed}
                          className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
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
                            className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 hover:border-white/20 cursor-pointer transition-all group"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                              <img
                                src={track.coverUrl || getPlaceholderImage(track.title)}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all ${
                                isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {isCurrentPlaying ? (
                                  <Pause className="w-4 h-4 text-[#00B4D8] fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-current" />
                                )}
                              </div>
                            </div>

                            <div className="truncate flex-1">
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
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
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Popular Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_VIBES.map((vibe) => (
                      <button
                        key={`focus-vibe-${vibe.query}`}
                        onClick={() => {
                          handleSelectSearchTerm(vibe.query);
                          setIsFocused(false);
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors"
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

        {/* Filter Pills or Quick Vibes */}
        {(query.trim() || activeFilter !== 'all') ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1 w-full">
            {FILTER_PILLS.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  aria-pressed={isActive}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all select-none border cursor-pointer ${
                    isActive
                      ? 'bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/30 font-bold border-[#c0c0c0]/40'
                      : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1] hover:text-white border-[#c0c0c0]/25'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5 pb-1 w-full">
            {QUICK_VIBES.map((vibe) => (
              <button
                key={vibe.query}
                onClick={() => handleSelectSearchTerm(vibe.query)}
                className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all select-none bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-[#c0c0c0]/25"
              >
                {vibe.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas Body */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 space-y-8 sm:space-y-10">

        {/* CONDITIONAL CONTENT: Search Results VS Spotify Search Home */}
        {query.trim() !== '' ? (
          (query !== debouncedQuery || isLoading) ? (
            <SearchResultsSkeleton activeFilter={activeFilter} />
          ) : (
            <SearchResults
              query={debouncedQuery}
              activeFilter={activeFilter}
              results={filteredResults}
              onPlayTrack={playTrack}
              followedUserIds={followedUserIds}
              onToggleFollow={toggleFollowUser}
              onClearQuery={() => setQuery('')}
            />
          )
        ) : (isLoading && allTracks.length === 0) ? (
          <FullDiscoverSkeleton />
        ) : (
          <div className="space-y-10">

            {/* 1. Browse All Categories */}
            <section className="space-y-3.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Browse All</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {SPOTIFY_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSearchTerm(category.query)}
                    className={`relative ${category.gradient} rounded-2xl p-3.5 sm:p-4 overflow-hidden aspect-[16/10] cursor-pointer shadow-md group transition-all select-none`}
                  >
                    <h4 className="text-sm sm:text-base font-black text-white tracking-tight uppercase max-w-[70%] leading-tight z-10 relative">
                      {category.title}
                    </h4>

                    {/* Rotated angled artwork preview on bottom right corner */}
                    <img
                      src={category.imgUrl}
                      alt={category.title}
                      className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-2xl translate-x-2.5 translate-y-2.5 rotate-[18deg] group-hover:scale-105 group-hover:rotate-[14deg] transition-all duration-300 pointer-events-none"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Recommended For You ("Made For You") */}
            {recommendedTracks.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
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

                <div className="-mx-3 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 px-3 sm:mx-0 sm:px-0 scroll-smooth">
                  {recommendedTracks.map((track) => (
                    <motion.div
                      key={`rec-track-${track.id}`}
                      whileHover={{ y: -3 }}
                      onClick={() => playTrack(track)}
                      className="w-[145px] sm:w-[155px] shrink-0 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-3 flex flex-col justify-between cursor-pointer group transition-all select-none"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 mb-2.5">
                        <img
                          src={track.coverUrl || getPlaceholderImage(track.title)}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5 shadow-xl transform scale-90 group-hover:scale-100 transition-all">
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
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse bg-white/[0.03] rounded-2xl p-4 h-24 flex gap-3.5">
                        <div className="w-16 h-16 bg-white/5 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3.5 bg-white/5 rounded w-1/3" />
                          <div className="h-2.5 bg-white/5 rounded w-1/4" />
                          <div className="h-2.5 bg-white/5 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {recommendedTracksWithAi.map((track) => (
                      <motion.div
                        key={`ai-rec-${track.id}`}
                        whileHover={{ y: -2 }}
                        onClick={() => playTrack(track)}
                        className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-3.5 sm:p-4 flex gap-3.5 cursor-pointer group transition-all select-none"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
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
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
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

                <div className="space-y-1.5 sm:space-y-2">
                  {topTrendingTracks.map((track, idx) => {
                    const isLiked = likedTrackIds.includes(track.id);
                    const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <motion.div
                        key={`top-chart-${track.id}`}
                        whileHover={{ x: 2 }}
                        onClick={() => playTrack(track)}
                        className={`p-2.5 sm:p-3 rounded-2xl ${isCurrentPlaying ? 'bg-[#00B4D8]/10' : 'bg-white/[0.03]'} hover:bg-white/[0.06] flex items-center justify-between cursor-pointer group transition-all select-none`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className={`text-xs sm:text-sm font-extrabold w-4 sm:w-5 text-center shrink-0 ${
                            isCurrentPlaying ? 'text-[#00B4D8]' : idx === 0 ? 'text-amber-400 font-black' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-500'
                          }`}>
                            {isCurrentPlaying ? '▶' : `#${idx + 1}`}
                          </span>

                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
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

            {/* 5. Popular Artists */}
            {popularArtists.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Popular Artists</h3>
                  <button
                    onClick={() => navigate('/explore/artists?title=Popular+Artists')}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                  {popularArtists.map((artist) => {
                    const isFollowing = followedUserIds.includes(artist.uid);
                    return (
                      <motion.div
                        key={`pop-artist-${artist.uid}`}
                        whileHover={{ y: -3 }}
                        onClick={() => navigate(`/artist/${artist.uid}`)}
                        className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-3.5 sm:p-4 text-center flex flex-col items-center space-y-3 cursor-pointer group transition-all select-none"
                      >
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden shadow-md bg-zinc-900">
                          <img
                            src={artist.avatarUrl || getPlaceholderImage(artist.name)}
                            alt={artist.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="w-full truncate">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#00B4D8] transition-colors truncate">
                            {artist.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 capitalize truncate mt-0.5">
                            {artist.genre || 'Artist'}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowUser(artist.uid);
                          }}
                          className="w-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 rounded-full h-7 sm:h-8"
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 6. Featured Playlists */}
            {allUserPlaylists.length > 0 && (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Featured Playlists</h3>
                  <button
                    onClick={() => navigate('/explore/playlists?title=Featured+Playlists&filter=curated')}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {allUserPlaylists.slice(0, 4).map((playlist) => (
                    <motion.div
                      key={`feat-playlist-${playlist.id}`}
                      whileHover={{ y: -3 }}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-3 sm:p-3.5 cursor-pointer group transition-all select-none"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 mb-2.5">
                        <img
                          src={playlist.coverUrl || getPlaceholderImage(playlist.title)}
                          alt={playlist.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-black flex items-center justify-center pl-0.5 shadow-xl transform scale-90 group-hover:scale-100 transition-all">
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
