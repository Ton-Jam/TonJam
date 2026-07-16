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
  Play,
  Activity,
  Zap,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Coins,
  Gem,
  Megaphone,
  Radio as RadioIcon,
  Users
} from 'lucide-react';
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  startAt, 
  endAt,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAudio } from '@/contexts/AudioContext';
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
import { WelcomeHero } from "@/components/search/WelcomeHero";
import { SponsoredJamFeed } from "@/components/search/SponsoredJamFeed";
import { LiveSpaces } from "@/components/search/LiveSpaces";
import { EarnTJPreview } from "@/components/search/EarnTJPreview";
import { SocialActivityFeed } from "@/components/SocialActivityFeed";
import { TrendingMusicChart } from "@/components/search/TrendingMusicChart";
import QRScanner from '@/components/QRScanner';
import { 
  FullDiscoverSkeleton, 
  TracksSkeleton, 
  CardsSkeleton, 
  ArtistsSkeleton 
} from '@/components/search/Skeletons';
import { CollectionItem } from '@/components/search/search-types';
import useDebounce from '@/hooks/use-debounce';
import { Button } from "@/components/ui/button";

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

const GENRES = [
  { id: 'All', label: 'All Styles', emoji: '🎵' },
  { id: 'Phonk', label: 'Phonk', emoji: '🚗' },
  { id: 'Synthwave', label: 'Synthwave', emoji: '🌌' },
  { id: 'Acoustic Cyber', label: 'Acoustic Cyber', emoji: '🎸' },
  { id: 'Afro-TON', label: 'Afro-TON', emoji: '🥁' },
  { id: 'Electronic', label: 'Electronic', emoji: '⚡' },
  { id: 'Hip Hop', label: 'Hip Hop', emoji: '🎤' },
  { id: 'Techno', label: 'Techno', emoji: '🌀' },
  { id: 'Ambient', label: 'Ambient', emoji: '🍃' },
  { id: 'Rock', label: 'Rock', emoji: '🔥' },
  { id: 'Pop', label: 'Pop', emoji: '✨' },
  { id: 'Lo-Fi', label: 'Lo-Fi', emoji: '☕' }
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

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

  // Real-time Firestore Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const q = debouncedQuery.trim();
        const capitalizedQ = q.charAt(0).toUpperCase() + q.slice(1);
        const matchesSet = new Set<string>();

        // We run queries for both the exact query and the capitalized version 
        // to handle standard naming conventions in Firestore
        const fetchBatch = async (searchTerm: string) => {
          const endTerm = searchTerm + '\uf8ff';
          
          const tQuery = firestoreQuery(collection(db, 'tracks'), where('title', '>=', searchTerm), where('title', '<=', endTerm), limit(3));
          const aQuery = firestoreQuery(collection(db, 'users'), where('role', '==', 'artist'), where('name', '>=', searchTerm), where('name', '<=', endTerm), limit(3));
          const cQuery = firestoreQuery(collection(db, 'collections'), where('name', '>=', searchTerm), where('name', '<=', endTerm), limit(3));

          const [tSnap, aSnap, cSnap] = await Promise.all([getDocs(tQuery), getDocs(aQuery), getDocs(cQuery)]);
          
          tSnap.forEach(doc => matchesSet.add(doc.data().title));
          aSnap.forEach(doc => matchesSet.add(doc.data().name));
          cSnap.forEach(doc => matchesSet.add(doc.data().name));
        };

        await fetchBatch(q);
        if (capitalizedQ !== q) {
          await fetchBatch(capitalizedQ);
        }

        // Merge with local data for fuzzy matching (case-insensitive)
        const lowerQ = q.toLowerCase();
        allTracks.forEach(t => {
          if (t.title.toLowerCase().includes(lowerQ)) matchesSet.add(t.title);
        });
        artists.forEach(a => {
          if (a.name.toLowerCase().includes(lowerQ)) matchesSet.add(a.name);
        });

        setSuggestions(Array.from(matchesSet).slice(0, 8));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, allTracks]);

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
    const matchesGenre = (genre: string | undefined | null) => {
      if (selectedGenre === 'All') return true;
      if (!genre) return false;
      return genre.toLowerCase() === selectedGenre.toLowerCase();
    };

    if (!q && selectedGenre === 'All') {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
        nfts: [],
        users: []
      };
    }

    // Filter bases first by selectedGenre
    const baseTracks = allTracks.filter(t => matchesGenre(t.genre));
    const baseArtists = artists.filter(a => matchesGenre(a.genre));
    const baseNFTs = allNFTs.filter(n => matchesGenre((n as any).genre) || matchesGenre((n as any).style));
    const basePlaylists = allUserPlaylists.filter(p => matchesGenre((p as any).genre));

    if (!q) {
      // Return everything matching the style if no search text is typed
      return {
        tracks: baseTracks,
        artists: baseArtists,
        albums: (baseTracks
          .map((t) => ({ id: t.albumId || '', title: t.title + ' Album', artist: t.artist, coverUrl: t.coverUrl }))
          .filter((a) => a.id) as any[]),
        playlists: basePlaylists,
        nfts: baseNFTs,
        users: []
      };
    }

    return {
      tracks: baseTracks.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.artist?.toLowerCase().includes(q) ||
          t.genre?.toLowerCase().includes(q)
      ),
      artists: baseArtists.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.genre?.toLowerCase().includes(q)
      ),
      albums: (baseTracks
        .map((t) => ({ id: t.albumId || '', title: t.title + ' Album', artist: t.artist, coverUrl: t.coverUrl }))
        .filter((a) => a.id && a.title.toLowerCase().includes(q)) as any[]),
      playlists: basePlaylists.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      ),
      nfts: baseNFTs.filter((n) => n.title?.toLowerCase().includes(q)),
      users: firestoreUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q)
      ) as any[]
    };
  }, [debouncedQuery, allTracks, artists, allUserPlaylists, allNFTs, firestoreUsers, selectedGenre]);

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

            <AnimatePresence>
              {isFocused && (query.length >= 2 || isSearching) && (
                <SearchSuggestionList
                  suggestions={suggestions}
                  query={query}
                  onSelect={handleSelectSearchTerm}
                  isSearching={isSearching}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-full bg-[#0c133a] text-white hover:bg-[#00B4D8] transition-all shrink-0 active:scale-95 ${
              isRefreshing ? 'animate-spin text-[#00B4D8]' : ''
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

        {/* Horizontal scrollable list of music genres */}
        <div className="w-full px-4 md:px-8 pt-1.5 pb-2 overflow-x-auto no-scrollbar flex gap-2 select-none">
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`relative px-3.5 py-1.5 shrink-0 rounded-[12px] text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200 overflow-hidden flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-[#00B4D8]/15 text-[#00B4D8]' 
                    : 'bg-[#0c133a] text-slate-400 hover:text-white hover:bg-[#121c4e]'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span>{genre.emoji}</span>
                <span>{genre.label}</span>
              </button>
            );
          })}
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
              <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest">Aura Sync Scanning...</span>
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
        ) : (debouncedQuery.trim() || selectedGenre !== 'All') ? (
          <SearchResults
            query={debouncedQuery || selectedGenre}
            activeFilter={activeFilter}
            results={filteredResults}
            onPlayTrack={playTrack}
            followedUserIds={followedUserIds}
            onToggleFollow={toggleFollowUser}
            onClearQuery={() => {
              setQuery('');
              setSelectedGenre('All');
            }}
          />
        ) : (
          <div className="space-y-12 pb-24">
            
            {/* 1. Welcome Hero */}
            <section className="px-4 pt-4">
              <WelcomeHero />
            </section>

            {/* Real-time Community Trending Chart */}
            <section className="px-4">
              <TrendingMusicChart />
            </section>

            {/* 2. Continue Listening */}
            <section>
              {recentlyPlayed.length > 0 && (
                <ContinueListeningSection 
                  tracks={recentlyPlayed} 
                  onPlayTrack={playTrack} 
                />
              )}
            </section>

            {/* 3. Trending NFT Collections */}
            <section>
              <CollectionSection 
                collections={POPULAR_COLLECTIONS} 
                title="Trending NFT Collections"
              />
            </section>

            {/* 4. Sponsored Jam Feed */}
            <section>
              <SponsoredJamFeed />
            </section>

            {/* 5. New Drops (Featured Albums) */}
            <section>
              <FeaturedAlbumSection
                title="New Drops"
                albums={allTracks.slice(0, 4).map(t => ({
                  id: t.albumId || 'alb-1',
                  title: t.title,
                  artist: t.artist,
                  artistId: t.artistId || 'art-1',
                  coverUrl: t.coverUrl,
                  releaseYear: 2026,
                  trackIds: [t.id],
                  genre: t.genre
                }))}
              />
            </section>

            {/* 6. Trending Songs */}
            <section>
              <TrendingSection
                title="Trending Songs"
                trendingSong={allTracks[0]}
                trendingArtist={null}
                trendingAlbum={null}
                trendingPlaylist={null}
                trendingNft={null}
                trendingCollection={null}
                onPlaySong={playTrack}
              />
            </section>

            {/* 7. Trending Artists */}
            <section>
              <FeaturedArtistSection
                title="Trending Artists"
                artists={artists.slice(0, 4)}
                followedIds={followedUserIds}
                onToggleFollow={toggleFollowUser}
              />
            </section>

            {/* 8. Live Spaces */}
            <section>
              <LiveSpaces />
            </section>

            {/* 9. Recommended For You */}
            <section>
              <ForYouSection
                recommendedTracks={recommendedTracks}
                onPlayTrack={playTrack}
                listeningStreak={4}
                favoriteGenre={favoriteGenre}
              />
            </section>

            {/* 10. Earn TJ Preview */}
            <section className="px-4">
              <EarnTJPreview />
            </section>

            {/* 11. Marketplace Picks (Trending NFTs) */}
            <section>
              <TrendingNFTSection 
                title="Marketplace Picks"
                nfts={allNFTs.slice(0, 4)} 
              />
            </section>

            {/* 12. Favorite Artists */}
            <section>
              <RecommendedSection
                recommendedTracks={[]}
                recommendedArtists={artists.slice(1, 5)}
                onPlayTrack={playTrack}
              />
            </section>

            {/* 13. Trending Topics */}
            <section className="px-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Broadcast Signals
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Trending Topics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {TRENDING_HASHTAGS.map((hash) => (
                    <motion.div
                      key={hash.id}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      onClick={() => handleSelectSearchTerm(hash.name)}
                      className="p-4 rounded-[12px] bg-[#0c133a] border border-white/5 flex flex-col justify-between cursor-pointer group h-20"
                    >
                      <span className="text-xs font-bold text-[#00B4D8] tracking-wider">{hash.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">{hash.posts}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* 14. Recently Minted */}
            <section>
              <TrendingNFTSection 
                title="Recently Minted"
                nfts={allNFTs.slice().reverse().slice(0, 4)} 
              />
            </section>

            {/* 15. Community Activity (Real-time Social Activity Feed) */}
            <section className="px-4">
              <SocialActivityFeed />
            </section>

            {/* 16. Recently Played */}
            <section>
              {recentlyPlayed.length > 0 && (
                <RecentlyPlayedSection tracks={recentlyPlayed.slice(0, 8)} onPlayTrack={playTrack} />
              )}
            </section>

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
