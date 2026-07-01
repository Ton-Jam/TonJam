import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Hash, 
  UserPlus, 
  Compass, 
  Tag, 
  SlidersHorizontal,
  LayoutGrid,
  Radio,
  Play
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { auth } from '@/lib/firebase';
import { getPlaceholderImage } from '@/lib/utils';
import { toast } from 'sonner';

// Import our world-class search sub-components
import { AnimatedSearchBar } from '@/components/search/AnimatedSearchBar';
import { QuickFilters } from '@/components/search/QuickFilters';
import { ForYouSection } from '@/components/search/ForYouSection';
import { TrendingSection } from '@/components/search/TrendingSection';
import { FeaturedArtistSection } from '@/components/search/FeaturedArtistSection';
import { FeaturedAlbumSection } from '@/components/search/FeaturedAlbumSection';
import { FeaturedPlaylistSection } from '@/components/search/FeaturedPlaylistSection';
import { TrendingNFTSection } from '@/components/search/TrendingNFTSection';
import { LiveAuctionSection } from '@/components/search/LiveAuctionSection';
import { CollectionSection } from '@/components/search/CollectionSection';
import { RecommendedSection } from '@/components/search/RecommendedSection';
import { RecentSearchSection } from '@/components/search/RecentSearchSection';
import { ContinueListeningSection } from '@/components/search/ContinueListeningSection';
import { RecentlyPlayedSection } from '@/components/search/RecentlyPlayedSection';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchSuggestionList } from '@/components/search/SearchSuggestionList';
import QRScanner from '@/components/QRScanner';
import { 
  FullDiscoverSkeleton, 
  TracksSkeleton, 
  CardsSkeleton, 
  ArtistsSkeleton 
} from '@/components/search/Skeletons';
import { CollectionItem } from '@/components/search/search-types';
import useDebounce from '@/hooks/use-debounce';

// High-fidelity Mock/Fallback Data to populate un-seeded firebase fields elegantly
const POPULAR_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    name: 'TON Diamond Jams',
    creator: 'DJ Krupy',
    coverUrl: 'https://picsum.photos/seed/diamond/200/200',
    itemsCount: 120,
    ownersCount: 45,
    floorPrice: '2.5',
    totalVolume: '450.8'
  },
  {
    id: 'col-2',
    name: 'Vibe Alchemist Collective',
    creator: 'Alchemist Wave',
    coverUrl: 'https://picsum.photos/seed/alchemist/200/200',
    itemsCount: 88,
    ownersCount: 32,
    floorPrice: '1.8',
    totalVolume: '210.4'
  },
  {
    id: 'col-3',
    name: 'Genesis Alpha Signals',
    creator: 'TonJam Official',
    coverUrl: 'https://picsum.photos/seed/genesis/200/200',
    itemsCount: 50,
    ownersCount: 50,
    floorPrice: '5.0',
    totalVolume: '920.0'
  }
];

const TRENDING_GENRES = [
  { id: 'genre-1', name: 'Phonk', count: '1.2M streams', color: 'bg-emerald-600' },
  { id: 'genre-2', name: 'Synthwave', count: '940K streams', color: 'bg-purple-600' },
  { id: 'genre-3', name: 'Acoustic Cyber', count: '780K streams', color: 'bg-pink-600' },
  { id: 'genre-4', name: 'Afro-TON', count: '650K streams', color: 'bg-amber-600' }
];

const TRENDING_HASHTAGS = [
  { id: 'hash-1', name: '#TONAlphaSignal', posts: '12.4K broadcasts' },
  { id: 'hash-2', name: '#GenesisDrop', posts: '9.2K broadcasts' },
  { id: 'hash-3', name: '#SonicVelocity', posts: '8.1K broadcasts' },
  { id: 'hash-4', name: '#NFTJam', posts: '5.5K broadcasts' }
];

const SUGGESTED_USERS = [
  { uid: 'sug-1', name: 'KrupyVibe Master', username: 'krupy_vibe', avatar: 'https://picsum.photos/seed/vibe/100/100', followers: 2340 },
  { uid: 'sug-2', name: 'Aura Sync', username: 'aurasync', avatar: 'https://picsum.photos/seed/aura/100/100', followers: 1560 },
  { uid: 'sug-3', name: 'Quantum Beatmaker', username: 'quantum_beats', avatar: 'https://picsum.photos/seed/quantum/100/100', followers: 4890 }
];

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const {
    allTracks = [],
    allNFTs = [],
    artists = [],
    firestoreUsers = [],
    playTrack,
    playAll,
    followedUserIds = [],
    likedTrackIds = [],
    recentlyPlayed = [],
    playlists: allUserPlaylists = [],
    toggleFollowUser
  } = useAudio();

  // Internal states
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(6);

  // Recently Viewed NFTs Tracking
  const [recentlyViewedNfts, setRecentlyViewedNfts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_recently_viewed_nfts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recent Search History Tracking
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : ['Phonk Waves', 'Genesis NFT', 'Krupy Vibes', 'TON Alpha'];
    } catch {
      return ['Phonk Waves', 'Genesis NFT', 'Krupy Vibes', 'TON Alpha'];
    }
  });

  // Calculate Autocomplete Suggestions based on typing query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();
    const matches: string[] = [];

    // Gather unique matching names from tracks, artists, NFTs, and playlists
    allTracks.forEach((t) => {
      if (t.title?.toLowerCase().includes(lowerQuery) && !matches.includes(t.title)) {
        matches.push(t.title);
      }
    });
    artists.forEach((a) => {
      if (a.name?.toLowerCase().includes(lowerQuery) && !matches.includes(a.name)) {
        matches.push(a.name);
      }
    });
    allNFTs.forEach((n) => {
      if (n.title?.toLowerCase().includes(lowerQuery) && !matches.includes(n.title)) {
        matches.push(n.title);
      }
    });

    return matches.slice(0, 5);
  }, [query, allTracks, artists, allNFTs]);

  // Calculate listener profile metrics
  const favoriteGenre = useMemo(() => {
    const genres: Record<string, number> = {};
    recentlyPlayed.forEach((t) => {
      if (t.genre) genres[t.genre] = (genres[t.genre] || 0) + 1;
    });
    let topGenre = 'Electronic';
    let max = 0;
    Object.entries(genres).forEach(([g, count]) => {
      if (count > max) {
        max = count;
        topGenre = g;
      }
    });
    return topGenre;
  }, [recentlyPlayed]);

  // Personalized Tracks Filtered
  const recommendedTracks = useMemo(() => {
    return allTracks
      .filter((t) => t.genre === favoriteGenre || t.likes && t.likes > 2)
      .slice(0, 4);
  }, [allTracks, favoriteGenre]);

  // Extract Live Auctions from real NFT listings
  const liveAuctions = useMemo(() => {
    const realAuctions = allNFTs.filter((n) => n.listingType === 'auction' || n.isAuction);
    if (realAuctions.length > 0) return realAuctions.slice(0, 4);
    // fallback if none seeded
    return allNFTs.slice(0, 2);
  }, [allNFTs]);

  // Search Results Calculations
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

  // Simulate Pull-To-Refresh Interaction
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info('Refreshing your music synapses...');
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Frequencies updated perfectly!');
    }, 1200);
  };

  // Add search term to history
  const handleSelectSearchTerm = (term: string) => {
    setQuery(term);
    const updated = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleRemoveSearchTerm = (term: string) => {
    const updated = searchHistory.filter((h) => h !== term);
    setSearchHistory(updated);
    localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tonjam_search_history');
    localStorage.removeItem('recentSearches');
  };

  // QR scan completion handler
  const handleQrScanComplete = (data: string | null) => {
    if (data) {
      toast.success(`Scanned frequency: ${data}`);
      setQuery(data);
    }
    setShowScanner(false);
  };

  // Infinite Scroll Trigger Sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItemsCount < 20) {
          setVisibleItemsCount((prev) => prev + 4);
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItemsCount]);

  return (
    <div className="min-h-screen bg-[#050A24] text-white pb-32 relative select-none w-full max-w-full overflow-x-hidden">
      
      {/* Sticky Collapsing Search Header - SOLID Navy; NO Borders */}
      <div className="sticky top-0 z-40 bg-[#050A24] py-4 w-full shadow-2xl transition-colors duration-300">
        <div className="w-full flex items-center gap-3 px-4 md:px-8">
          
          <div className="flex-1 relative">
            <AnimatedSearchBar
              value={query}
              onChange={setQuery}
              onClear={() => setQuery('')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onQrScan={() => setShowScanner(true)}
              isFocused={isFocused}
            />

            {/* Glowing Suggestions Dropdown Overlay */}
            <AnimatePresence>
              {isFocused && suggestions.length > 0 && (
                <SearchSuggestionList
                  suggestions={suggestions}
                  query={query}
                  onSelect={handleSelectSearchTerm}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-full bg-[#0c133a] text-white hover:bg-[#0052FF] transition-all shrink-0 active:scale-95 ${
              isRefreshing ? 'animate-spin text-[#0052FF]' : ''
            }`}
            title="Refresh frequencies"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Quick filters directly under the search bar */}
        <div className="w-full px-4 md:px-8 pt-3 pb-1 overflow-hidden">
          <QuickFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
      </div>

      {/* Main Discover Canvas Container */}
      <div className="w-full max-w-full px-4 md:px-8 space-y-12 mt-6">

        {/* Loading skeleton transitions */}
        {isRefreshing ? (
          <FullDiscoverSkeleton />
        ) : query.trim() !== '' && query !== debouncedQuery ? (
          <div className="space-y-8 animate-pulse">
            <div className="space-y-4">
              <span className="text-[9px] font-mono font-bold text-[#0052FF] uppercase tracking-widest">Aura Sync Scanning...</span>
              {activeFilter === 'tracks' && <TracksSkeleton count={6} />}
              {activeFilter === 'artists' && <ArtistsSkeleton count={4} />}
              {activeFilter === 'nfts' && <CardsSkeleton count={4} />}
              {activeFilter === 'all' && (
                <div className="space-y-8">
                  <TracksSkeleton count={4} />
                  <CardsSkeleton count={4} />
                </div>
              )}
            </div>
          </div>
        ) : debouncedQuery.trim() ? (
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
          /* Default Discovery Feed */
          <div className="space-y-12">
            
            {/* For You Section */}
            {(activeFilter === 'all' || activeFilter === 'trending') && (
              <ForYouSection
                recommendedTracks={recommendedTracks}
                onPlayTrack={playTrack}
                listeningStreak={4}
                favoriteGenre={favoriteGenre}
              />
            )}

            {/* Recently Searched Panel */}
            {searchHistory.length > 0 && (
              <RecentSearchSection
                searches={searchHistory}
                onSelect={handleSelectSearchTerm}
                onRemove={handleRemoveSearchTerm}
                onClearAll={handleClearAllHistory}
              />
            )}

            {/* Trending Section */}
            {(activeFilter === 'all' || activeFilter === 'trending') && (
              <TrendingSection
                trendingSong={allTracks[0] || null}
                trendingArtist={artists[0] || null}
                trendingAlbum={null}
                trendingPlaylist={allUserPlaylists[0] || null}
                trendingNft={allNFTs[0] || null}
                trendingCollection={POPULAR_COLLECTIONS[0]}
                onPlaySong={playTrack}
              />
            )}

            {/* Continue Listening Resume Row */}
            {recentlyPlayed.length > 0 && (activeFilter === 'all' || activeFilter === 'tracks') && (
              <ContinueListeningSection tracks={recentlyPlayed} onPlayTrack={playTrack} />
            )}

            {/* Featured Artists */}
            {(activeFilter === 'all' || activeFilter === 'artists') && artists.length > 0 && (
              <FeaturedArtistSection
                artists={artists.slice(0, 4)}
                followedIds={followedUserIds}
                onToggleFollow={toggleFollowUser}
              />
            )}

            {/* Featured Albums */}
            {(activeFilter === 'all' || activeFilter === 'albums') && (
              <FeaturedAlbumSection
                albums={allTracks
                  .slice(0, 4)
                  .map((t) => ({ id: t.albumId || 'alb-1', title: t.title + ' Master', artist: t.artist, artistId: t.artistId, coverUrl: t.coverUrl, releaseYear: 2026, trackIds: [t.id], genre: t.genre }))}
              />
            )}

            {/* Featured Playlists */}
            {(activeFilter === 'all' || activeFilter === 'playlists') && allUserPlaylists.length > 0 && (
              <FeaturedPlaylistSection
                playlists={allUserPlaylists.slice(0, 4)}
                onPlayPlaylist={(p) => {
                  const pTracks = p.trackIds?.map(id => allTracks.find(t => t.id === id)).filter(Boolean) as any[];
                  if (pTracks && pTracks.length > 0) playAll(pTracks);
                }}
              />
            )}

            {/* Trending NFTs Drop Section */}
            {(activeFilter === 'all' || activeFilter === 'nfts') && allNFTs.length > 0 && (
              <TrendingNFTSection nfts={allNFTs.slice(0, 4)} />
            )}

            {/* Live Auctions */}
            {(activeFilter === 'all' || activeFilter === 'auctions') && liveAuctions.length > 0 && (
              <LiveAuctionSection auctions={liveAuctions} />
            )}

            {/* Popular Collections */}
            {(activeFilter === 'all' || activeFilter === 'collections') && (
              <CollectionSection collections={POPULAR_COLLECTIONS} />
            )}

            {/* Trending Genres List */}
            {(activeFilter === 'all' || activeFilter === 'genres') && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Network Taxonomy</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Trending Genres</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {TRENDING_GENRES.map((gen) => (
                    <motion.div
                      key={gen.id}
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectSearchTerm(gen.name)}
                      className={`p-4 rounded-xl ${gen.color} relative overflow-hidden h-24 flex flex-col justify-between cursor-pointer group`}
                    >
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">{gen.name}</h4>
                      <span className="text-[9px] font-mono text-white/70 uppercase font-semibold">{gen.count}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags List */}
            {activeFilter === 'all' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Broadcast Signals</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Trending Hashtags</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {TRENDING_HASHTAGS.map((hash) => (
                    <motion.div
                      key={hash.id}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      onClick={() => handleSelectSearchTerm(hash.name)}
                      className="p-4 rounded-xl bg-[#090f2d] border border-white/5 flex flex-col justify-between cursor-pointer group h-20"
                    >
                      <span className="text-xs font-bold text-[#0052FF] tracking-wider">{hash.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">{hash.posts}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Split Section */}
            {activeFilter === 'all' && (
              <RecommendedSection
                recommendedTracks={allTracks.slice(1, 5)}
                recommendedArtists={artists.slice(1, 5)}
                onPlayTrack={playTrack}
              />
            )}

            {/* Recently Played History */}
            {recentlyPlayed.length > 0 && activeFilter === 'all' && (
              <RecentlyPlayedSection tracks={recentlyPlayed} onPlayTrack={playTrack} />
            )}

            {/* Suggested Users to follow */}
            {activeFilter === 'all' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Network Graph</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Suggested Users</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {SUGGESTED_USERS.map((usr) => (
                    <div
                      key={usr.uid}
                      className="bg-[#090f2d] border border-white/5 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-white/5">
                          <img src={usr.avatar} alt={usr.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{usr.name}</h4>
                          <p className="text-[9px] text-slate-500 font-mono">@{usr.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollowUser(usr.uid)}
                        className={`p-1.5 rounded-full ${
                          followedUserIds.includes(usr.uid)
                            ? 'bg-transparent text-emerald-400'
                            : 'bg-white/5 hover:bg-white/10 text-white'
                        } transition-all`}
                        title="Follow"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sentinel element for infinite scroll tracking */}
            <div ref={sentinelRef} className="h-4 w-full" />
          </div>
        )}
      </div>

      {/* QR Scanner Modal Overlay */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleQrScanComplete}
        />
      )}
    </div>
  );
};

export default Discover;
