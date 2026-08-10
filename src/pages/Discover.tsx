import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Play, 
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
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useDebounce from '@/hooks/use-debounce';
import { SearchResults } from '@/components/search/SearchResults';
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

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const {
    allTracks = [],
    allNFTs = [],
    artists = [],
    firestoreUsers = [],
    playlists: allUserPlaylists = [],
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

  // Trending top 5
  const topTrendingTracks = useMemo(() => {
    return allTracks.slice(0, 5);
  }, [allTracks]);

  // Popular artists
  const popularArtists = useMemo(() => {
    return artists.slice(0, 5);
  }, [artists]);

  return (
    <div className="min-h-screen bg-[#050A24] text-white pb-32 relative select-none w-full max-w-full overflow-x-hidden">
      
      {/* Sticky Spotify-Style Search Header */}
      <div className="sticky top-0 z-40 bg-[#050A24]/95 backdrop-blur-xl pt-4 pb-3 px-4 md:px-8 space-y-3">
        
        {/* Main Search Input Bar */}
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1 flex items-center bg-[#0d1645] hover:bg-[#111c57] focus-within:bg-[#111c57] rounded-full px-4 py-3 transition-colors shadow-md">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="What do you want to listen to?"
              className="w-full bg-transparent border-none outline-none text-white text-sm font-medium placeholder-slate-400"
            />
            
            <div className="flex items-center gap-2 shrink-0">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={toggleVoiceSearch}
                className={`p-1 transition-colors ${isVoiceListening ? 'text-[#00B4D8] animate-pulse' : 'text-slate-400 hover:text-white'}`}
                title="Voice search"
              >
                {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowScanner(true)}
                className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
                title="Scan QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills (Always accessible when searching or filtered) */}
        {(query.trim() || activeFilter !== 'all') && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
            {FILTER_PILLS.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Canvas Body */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 space-y-10">

        {/* CONDITIONAL CONTENT: Search Results VS Spotify Search Home */}
        {debouncedQuery.trim() !== '' ? (
          <SearchResults
            query={debouncedQuery}
            activeFilter={activeFilter}
            results={filteredResults}
            onPlayTrack={playTrack}
            followedUserIds={followedUserIds}
            onToggleFollow={toggleFollowUser}
            onClearQuery={() => setQuery('')}
          />
        ) : (
          <div className="space-y-10">

            {/* 1. Recent Searches (Spotify Style) */}
            {searchHistory.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">Recent Searches</h3>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {searchHistory.map((term) => (
                    <div
                      key={`recent-${term}`}
                      onClick={() => handleSelectSearchTerm(term)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0c143d] hover:bg-[#121d57] cursor-pointer transition-colors shrink-0 group"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white">{term}</span>
                      <button
                        onClick={(e) => handleRemoveSearchTerm(term, e)}
                        className="p-0.5 text-slate-400 hover:text-white rounded-full transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Browse All Categories (Spotify Famous Colored Tile Grid) */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Browse All</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {SPOTIFY_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSearchTerm(category.query)}
                    className={`relative ${category.gradient} rounded-2xl p-4 overflow-hidden aspect-[16/10] cursor-pointer shadow-lg group transition-all`}
                  >
                    <h4 className="text-base sm:text-lg font-black text-white tracking-tight uppercase max-w-[65%] leading-tight z-10 relative">
                      {category.title}
                    </h4>

                    {/* Rotated angled artwork preview on bottom right corner */}
                    <img
                      src={category.imgUrl}
                      alt={category.title}
                      className="absolute bottom-0 right-0 w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg shadow-2xl translate-x-3 translate-y-3 rotate-[20deg] group-hover:scale-105 group-hover:rotate-[15deg] transition-all duration-300 pointer-events-none"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Recommended For You ("Made For You") */}
            {recommendedTracks.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Recommended for You</h3>
                    <p className="text-xs text-slate-400">Based on your listening activity & top genres</p>
                  </div>
                  <button
                    onClick={() => playAll(recommendedTracks)}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors"
                  >
                    Play All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {recommendedTracks.map((track) => (
                    <motion.div
                      key={`rec-track-${track.id}`}
                      whileHover={{ y: -4 }}
                      onClick={() => playTrack(track)}
                      className="bg-[#0c143d] rounded-2xl p-3 flex flex-col justify-between cursor-pointer group transition-all"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3">
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
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Top Charts / Trending Tracks (Spotify Numbered List) */}
            {topTrendingTracks.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-400" />
                    <h3 className="text-lg font-bold text-white tracking-tight">Top Charts</h3>
                  </div>
                  <button
                    onClick={() => playAll(topTrendingTracks)}
                    className="text-xs font-bold text-[#00B4D8] hover:text-[#00B4D8]/80 transition-colors"
                  >
                    Listen
                  </button>
                </div>

                <div className="space-y-2">
                  {topTrendingTracks.map((track, idx) => {
                    const isLiked = likedTrackIds.includes(track.id);
                    return (
                      <motion.div
                        key={`top-chart-${track.id}`}
                        whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                        onClick={() => playTrack(track)}
                        className="p-3 rounded-2xl bg-[#0c143d] flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={`text-sm font-extrabold w-5 text-center shrink-0 ${
                            idx === 0 ? 'text-amber-400 text-base' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>

                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                            <img
                              src={track.coverUrl || getPlaceholderImage(track.title)}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <Play className="w-5 h-5 text-white fill-current" />
                            </div>
                          </div>

                          <div className="truncate">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                              {track.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 pr-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeTrack(track.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-current' : ''}`} />
                          </button>

                          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (setOptionsTrack) setOptionsTrack(track);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
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
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Popular Artists</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {popularArtists.map((artist) => {
                    const isFollowing = followedUserIds.includes(artist.uid);
                    return (
                      <motion.div
                        key={`pop-artist-${artist.uid}`}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate(`/artist/${artist.uid}`)}
                        className="bg-[#0c143d] rounded-2xl p-4 text-center flex flex-col items-center space-y-3 cursor-pointer group transition-all"
                      >
                        <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-lg bg-slate-950">
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
                          <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                            {artist.genre || 'Artist'}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowUser(artist.uid);
                          }}
                          className="w-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 rounded-full h-8"
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
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Featured Playlists</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allUserPlaylists.slice(0, 4).map((playlist) => (
                    <motion.div
                      key={`feat-playlist-${playlist.id}`}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="bg-[#0c143d] rounded-2xl p-3.5 cursor-pointer group transition-all"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3">
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
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">by {playlist.creator}</p>
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
