import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { krupyVibesSearch } from '@/services/krupyVibesService';
import { Joyride } from 'react-joyride';
import { motion, AnimatePresence } from 'motion/react';
import { Button as MTButton } from "@material-tailwind/react";
import { 
  Search, 
  X, 
  Mic, 
  MicOff, 
  Play,
  TrendingUp, 
  Clock, 
  ChevronRight,
  MoreVertical,
  User,
  Music,
  LayoutGrid,
  Check,
  Filter,
  ArrowRight,
  ListFilter,
  History,
  Zap,
  Sparkles,
  Loader2,
  Sliders,
  Heart,
  QrCode
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GENRES, MOODS, MOCK_ALBUMS } from '@/constants';
import { auth } from '@/lib/firebase';
import { APP_LOGO } from '@/constants';
import NFTCard from '@/components/NFTCard';
import EmptyNFTState from '@/components/EmptyNFTState';
import TrendingNFTCard from '@/components/TrendingNFTCard';
import TrackCard from '@/components/TrackCard';
import AlbumCard from '@/components/AlbumCard';
import PlaylistCard from '@/components/PlaylistCard';
import ArtistCard from '@/components/ArtistCard';
import ArtistListItem from '@/components/ArtistListItem';
import TrendingArtistLeaderboard from '@/components/TrendingArtistLeaderboard';
import { toast } from 'sonner';
import { ArtistLeaderboard } from '@/components/ArtistLeaderboard';
import SkeletonCard from '@/components/SkeletonCard';
import SonicSearchSection from '@/components/SonicSearchSection';
import FilterPills from '@/components/FilterPills';
import QRScanner from '@/components/QRScanner';
import { FilterSection } from '@/components/FilterSection';
import { useAudio } from '@/context/AudioContext';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getPlaceholderImage, cn } from '@/lib/utils';
import GenreHeatmap from '@/components/GenreHeatmap';
import SocialFeed from '@/components/SocialFeed';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

const BROWSE_CATEGORIES = [
  { id: 'music', title: 'Music', color: 'bg-pink-600', image: 'https://picsum.photos/seed/music/200/200' },
  { id: 'podcasts', title: 'Podcasts', color: 'bg-emerald-600', image: 'https://picsum.photos/seed/podcasts/200/200' },
  { id: 'live', title: 'Live Events', color: 'bg-purple-600', image: 'https://picsum.photos/seed/live/200/200' },
  { id: 'made-for-you', title: 'Made For You', color: 'bg-blue-800', image: 'https://picsum.photos/seed/made/200/200' },
  { id: 'new-releases', title: 'New Releases', color: 'bg-red-600', image: 'https://picsum.photos/seed/new/200/200' },
  { id: 'pop', title: 'Pop', color: 'bg-orange-500', image: 'https://picsum.photos/seed/pop/200/200' },
  { id: 'hip-hop', title: 'Hip-Hop', color: 'bg-yellow-600', image: 'https://picsum.photos/seed/hiphop/200/200' },
  { id: 'rock', title: 'Rock', color: 'bg-red-700', image: 'https://picsum.photos/seed/rock/200/200' },
  { id: 'latin', title: 'Latin', color: 'bg-pink-500', image: 'https://picsum.photos/seed/latin/200/200' },
  { id: 'charts', title: 'Charts', color: 'bg-indigo-600', image: 'https://picsum.photos/seed/charts/200/200' },
  { id: 'dance', title: 'Dance/Electronic', color: 'bg-teal-600', image: 'https://picsum.photos/seed/dance/200/200' },
  { id: 'mood', title: 'Mood', color: 'bg-blue-600', image: 'https://picsum.photos/seed/mood/200/200' },
  { id: 'indie', title: 'Indie', color: 'bg-amber-600', image: 'https://picsum.photos/seed/indie/200/200' },
  { id: 'workout', title: 'Workout', color: 'bg-slate-600', image: 'https://picsum.photos/seed/workout/200/200' },
  { id: 'rnb', title: 'R&B', color: 'bg-fuchsia-600', image: 'https://picsum.photos/seed/rnb/200/200' },
  { id: 'kpop', title: 'K-Pop', color: 'bg-rose-500', image: 'https://picsum.photos/seed/kpop/200/200' },
];

// Helper for horizontal scroll section with skeleton
const SectionWrapper = ({ 
  title, 
  subtitle, 
  isLoading, 
  skeletonCount = 5, 
  skeletonVariant = 'default',
  children 
}: { 
  title: string, 
  subtitle?: string, 
  isLoading: boolean, 
  skeletonCount?: number,
  skeletonVariant?: 'default' | 'row' | 'compact',
  children: React.ReactNode 
}) => {
  const skeletonClass = skeletonVariant === 'row' 
    ? "w-[280px] sm:w-[320px] flex-shrink-0" 
    : "w-[140px] sm:w-[170px] flex-shrink-0";
    
  return (
    <section className="space-y-4">
      <div className="space-y-1 px-4 md:px-8 lg:px-12">
        {subtitle && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em]">{subtitle}</span>}
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pl-4 md:pl-8 lg:pl-12">
          {[...Array(skeletonCount)].map((_, i) => (
            <SkeletonCard key={`${title}-${i}`} variant={skeletonVariant} className={skeletonClass} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pl-4 md:pl-8 lg:pl-12 scroll-smooth no-scrollbar">
          {children}
        </div>
      )}
    </section>
  );
};

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    allTracks, 
    allNFTs,
    artists, 
    firestoreUsers,
    playTrack,
    playAll,
    followedUserIds,
    likedTrackIds,
    recentlyPlayed,
    isDiscoverFiltersOpen,
    setIsDiscoverFiltersOpen,
    generateDiscoverWeekly,
    playlists: allUserPlaylists,
    toggleFollowUser,
    userNFTs,
    posts,
    deletePost
  } = useAudio();

  // 1. Intelligent Analyzer for User Listening Habits
  const userListeningHabits = useMemo(() => {
    const genreCounts: { [key: string]: number } = {};
    const moodCounts: { [key: string]: number } = {};
    const artistCounts: { [key: string]: number } = {};

    recentlyPlayed?.forEach(t => {
      if (t.genre) genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 2;
      if (t.mood) moodCounts[t.mood] = (moodCounts[t.mood] || 0) + 2;
      if (t.artistId) artistCounts[t.artistId] = (artistCounts[t.artistId] || 0) + 2;
    });

    likedTrackIds?.forEach(id => {
      const t = allTracks.find(track => track.id === id);
      if (t) {
        if (t.genre) genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 3;
        if (t.mood) moodCounts[t.mood] = (moodCounts[t.mood] || 0) + 3;
        if (t.artistId) artistCounts[t.artistId] = (artistCounts[t.artistId] || 0) + 3;
      }
    });

    followedUserIds?.forEach(id => {
      artistCounts[id] = (artistCounts[id] || 0) + 4;
    });

    userNFTs?.forEach(nft => {
      if (nft.artistId) artistCounts[nft.artistId] = (artistCounts[nft.artistId] || 0) + 5;
      const subTrack = allTracks.find(t => t.id === nft.trackId);
      if (subTrack) {
        if (subTrack.genre) genreCounts[subTrack.genre] = (genreCounts[subTrack.genre] || 0) + 4;
        if (subTrack.mood) moodCounts[subTrack.mood] = (moodCounts[subTrack.mood] || 0) + 4;
      }
    });

    let favoriteGenre = '';
    let maxGenreCount = 0;
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        favoriteGenre = genre;
      }
    });

    let favoriteMood = '';
    let maxMoodCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        favoriteMood = mood;
      }
    });

    const hasInteractions = maxGenreCount > 0 || maxMoodCount > 0 || followedUserIds.length > 0 || (userNFTs && userNFTs.length > 0);

    return {
      favoriteGenre,
      favoriteMood,
      artistInteractions: artistCounts,
      hasInteractions
    };
  }, [recentlyPlayed, likedTrackIds, followedUserIds, userNFTs, allTracks]);

  // 2. Personalized Suggestions for new music based on analytic profile
  const recommendedTracks = useMemo(() => {
    const scored = allTracks.map(track => {
      let score = 0;
      const reasons: string[] = [];

      const isLiked = likedTrackIds.includes(track.id);
      const isPlayed = recentlyPlayed.some(rp => rp.id === track.id);

      if (userListeningHabits.favoriteGenre && track.genre === userListeningHabits.favoriteGenre) {
        score += 8;
        reasons.push(`matches your preferred ${track.genre}`);
      }

      if (userListeningHabits.favoriteMood && track.mood === userListeningHabits.favoriteMood) {
        score += 5;
        reasons.push(`matches your typical ${track.mood} mood`);
      }

      const artistAffinity = userListeningHabits.artistInteractions[track.artistId] || 0;
      if (artistAffinity > 0) {
        score += Math.min(15, artistAffinity * 2);
        reasons.push(`from artists you interact with`);
      }

      if (followedUserIds.includes(track.artistId)) {
        score += 12;
        reasons.push("by a creator you follow");
      }

      // Slight penalty if played recently or liked to focus on discovering other new items
      if (isPlayed) score -= 10;
      if (isLiked) score -= 5;

      // Fallback cold-start scoring if user is new
      if (!userListeningHabits.hasInteractions) {
        score = (track.playCount || 0) * 0.1 + (track.likes || 0) * 0.5;
        reasons.push("Hot upcoming release");
      }

      return {
        ...track,
        recommendationScore: score,
        recommendationReason: reasons.slice(0, 2).join(" & ") || "Trending signal"
      };
    });

    return scored
      .filter(t => t.id)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);
  }, [allTracks, userListeningHabits, likedTrackIds, recentlyPlayed, followedUserIds]);

  // 3. Trending Tracks (high engagement indices)
  const trendingTracks = useMemo(() => {
    return [...allTracks]
      .sort((a, b) => {
        const scoreA = (a.playCount || 0) + (a.likes || 0) * 12;
        const scoreB = (b.playCount || 0) + (b.likes || 0) * 12;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [allTracks]);

  // 4. Emerging Artists Section (fresh growing creators)
  const emergingArtists = useMemo(() => {
    const currentUserUid = auth.currentUser?.uid;
    const candidates = artists.filter(a => a.uid !== currentUserUid && !followedUserIds.includes(a.uid));
    
    const scored = candidates.map(artist => {
      let score = 0;
      const followerCount = artist.followers || 0;
      const isEmerging = followerCount < 3000;
      
      if (isEmerging) score += 15;
      if (userListeningHabits.favoriteGenre && artist.genre && artist.genre.toLowerCase() === userListeningHabits.favoriteGenre.toLowerCase()) {
        score += 10;
      }
      if (artist.verified) score += 5;

      return {
        ...artist,
        score,
        isEmerging
      };
    });

    const results = scored.sort((a, b) => b.score - a.score).slice(0, 4);
    
    // Fallback if no candidate artists to discover
    if (results.length === 0) {
      return artists.slice(0, 4);
    }
    return results;
  }, [artists, followedUserIds, userListeningHabits]);

  // 5. Featured Curated NFT Releases
  const featuredNFTReleases = useMemo(() => {
    const candidates = allNFTs.filter(n => n.ownerId !== auth.currentUser?.uid && n.owner !== auth.currentUser?.uid);

    const scored = candidates.map(nft => {
      let score = 0;
      if (followedUserIds.includes(nft.artistId || '')) score += 15;
      
      if (userListeningHabits.favoriteGenre) {
        const trackObj = allTracks.find(t => t.id === nft.trackId);
        if (trackObj && trackObj.genre === userListeningHabits.favoriteGenre) {
          score += 10;
        }
      }
      if (nft.listingType === 'auction' || nft.isAuction) score += 5;
      
      return { ...nft, calculatedScore: score };
    });

    const results = scored.sort((a, b) => b.calculatedScore - a.calculatedScore).slice(0, 4);
    if (results.length === 0) {
      return allNFTs.slice(0, 4);
    }
    return results;
  }, [allNFTs, followedUserIds, userListeningHabits, allTracks]);

  const [isLoading, setIsLoading] = useState(true);
  const [customVibe, setCustomVibe] = useState('');
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      generateDiscoverWeekly();
    }
  }, [generateDiscoverWeekly]);

  useEffect(() => {
    if (window.location.hash === '#sonic') {
      setTimeout(() => {
        const element = document.getElementById('sonic');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  const discoverWeekly = useMemo(() => 
    allUserPlaylists.find(p => p.title === 'Discover Weekly'),
    [allUserPlaylists]
  );

  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [isVibeSearch, setIsVibeSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data: string | null) => {
    if (data) {
      toast.success(`Scanned: ${data}`);
      setShowScanner(false);
      // TODO: Implement import logic
    }
  };
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'nfts' | 'artists' | 'playlists' | 'users' | 'community'>('all');
  const [aiVibeResults, setAiVibeResults] = useState<any[] | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [bpmRange, setBpmRange] = useState([60, 180]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tonjam_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const history = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(history);
      localStorage.setItem('tonjam_search_history', JSON.stringify(history));
    }
  };

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return {
        tracks: [] as any[],
        nfts: [] as any[],
        artists: [] as any[],
        playlists: [] as any[],
        users: [] as any[]
      };
    }
    return {
      tracks: allTracks.filter(t => 
        t.title?.toLowerCase().includes(q) || 
        t.artist?.toLowerCase().includes(q) || 
        t.genre?.toLowerCase().includes(q)
      ),
      nfts: allNFTs.filter(n => 
        n.title?.toLowerCase().includes(q) || 
        (n as any).title?.toLowerCase().includes(q)
      ),
      artists: artists.filter(a => 
        a.name?.toLowerCase().includes(q) || 
        a.username?.toLowerCase().includes(q) || 
        a.genre?.toLowerCase().includes(q)
      ),
      playlists: allUserPlaylists.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      ),
      users: firestoreUsers.filter(u => 
        u.name?.toLowerCase().includes(q) || 
        (u as any).displayName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      )
    };
  }, [searchQuery, allTracks, allNFTs, artists, allUserPlaylists, firestoreUsers]);

  const hasResults = useMemo(() => {
    return (
      filteredResults.tracks.length > 0 ||
      filteredResults.nfts.length > 0 ||
      filteredResults.artists.length > 0 ||
      filteredResults.playlists.length > 0 ||
      filteredResults.users.length > 0
    );
  }, [filteredResults]);

  const trendingTopics = [
    'TON Alpha Signal',
    'Genesis Drop',
    'Sonic Velocity',
    'Grammys 2026',
    'NFT Jam'
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [setSearchQuery]);

  useEffect(() => {
    const tourShown = localStorage.getItem('tonjam_discover_tour_shown');
    if (!tourShown) {
      setIsTourOpen(true);
      localStorage.setItem('tonjam_discover_tour_shown', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 relative discover-page w-full px-0 max-w-full">
      {/* Search & Filter Header with Navy Blue background; no borders */}
      <div className="sticky top-0 z-40 bg-[#0a122e]/95 backdrop-blur-md py-4 w-full transition-colors duration-300">
        <div className="w-full flex items-center gap-3 px-4 md:px-8 lg:px-12">
          {/* Search Form (from existing) with Navy background */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group bg-[#16224f]/60 p-1 rounded-full shadow-inner">
            {/* Input and suggestions logic... */}
            <div className="relative flex items-center h-10 bg-[#070e24] rounded-full overflow-hidden transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
               <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 h-full bg-transparent border-none focus-visible:ring-0 rounded-none text-xs font-bold uppercase tracking-widest z-10 text-white placeholder:text-slate-500"
                />
            </div>
            
            {/* Recent Searches Dropdown */}
            {isFocused && searchHistory.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#09112a] text-white rounded-2xl shadow-2xl p-4 z-50 overflow-hidden select-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchHistory([]);
                      localStorage.removeItem('tonjam_search_history');
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-[#16224f]/50 px-2 py-1.5 rounded-xl cursor-pointer transition-colors group"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(query);
                      }}
                    >
                      <span className="text-xs text-slate-200">{query}</span>
                      <button
                        type="button"
                        className="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const updated = searchHistory.filter(h => h !== query);
                          setSearchHistory(updated);
                          localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Suggestions logic remains the same */}
          </form>

          {/* Shrunk Filter Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsDiscoverFiltersOpen(true)}
            className="h-8 w-8 rounded-full bg-[#16224f] border-none text-white hover:bg-blue-600 transition-all shrink-0"
          >
            <ListFilter className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Filter Pills with Solid Navy background container & no title/borders */}
        <div className="px-4 md:px-8 lg:px-12 mt-3">
          <div className="w-full filter-tabs py-3 px-5 bg-[#0d1633] backdrop-blur-md rounded-2xl shadow-xl shadow-black/55 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <FilterPills
                  selectedGenre={activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                  onSelect={(v) => setActiveFilter((v ? v.toLowerCase() : 'all') as any)}
                  categories={['All', 'Community', 'Tracks', 'Artists', 'NFTs', 'Playlists', 'Users']}
                />
              </div>
          </div>
        </div>
      </div>
      {/* Main Content Sections */}
      <div className="w-full max-w-full pb-32 space-y-16 mt-8 md:mt-12">
          {/* Sections placeholder */}
          <SectionWrapper title="Artist Discography" isLoading={isLoading}>
              {MOCK_ALBUMS.slice(0, 5).map((album, idx) => (
                  <AlbumCard key={album.id} album={album} index={idx} className="w-[140px] sm:w-[170px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Top Artist Tracks" isLoading={isLoading} skeletonVariant="row">
              {trendingTracks.map(track => (
                  <TrackCard key={track.id} track={track} variant="row" className="w-[280px] sm:w-[320px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Top Artist NFTs" isLoading={isLoading} skeletonVariant="default">
              {featuredNFTReleases.map(nft => (
                  <NFTCard key={nft.id} nft={nft} className="w-[140px] sm:w-[170px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Similar Tracks" isLoading={isLoading} skeletonVariant="row">
              {trendingTracks.slice(0, 5).map(track => (
                  <TrackCard key={track.id} track={track} variant="row" className="w-[280px] sm:w-[320px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Featured Playlist" isLoading={isLoading} skeletonVariant="compact">
              {allUserPlaylists.slice(0, 5).map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} className="w-[140px] sm:w-[170px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Similar Artists" isLoading={isLoading} skeletonVariant="compact">
              {emergingArtists.map(artist => (
                  <ArtistCard key={artist.uid} artist={artist} className="w-[120px] sm:w-[140px] flex-shrink-0" />
              ))}
          </SectionWrapper>
          
          <SectionWrapper title="Recommended" isLoading={isLoading} skeletonVariant="default">
              {recommendedTracks.map(track => (
                  <TrackCard key={track.id} track={track} className="w-[140px] sm:w-[170px] flex-shrink-0" />
              ))}
          </SectionWrapper>
      </div>


      <div className="w-full max-w-full px-4 md:px-8 lg:px-12 pb-32 space-y-12 md:space-y-16 mt-8 md:mt-12">
        

        {isLoading ? (
          <div className="space-y-3">
            <div className="aspect-[2/1] w-full bg-muted rounded-[4px] animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={`cat-loading-${i}`} className="aspect-square bg-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <SkeletonCard key={`track-loading-${i}`} />
                ))}
              </div>
            </div>
          </div>
        ) : !searchQuery ? (
          activeFilter === 'community' ? (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em]">TonJam Radio Relay</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white font-display">Community Feed & Broadcasts</h2>
                </div>
              </div>
              <div className="max-w-3xl mx-auto space-y-6">
                <SocialFeed posts={posts || []} onDeletePost={deletePost} emptyMessage="No community broadcasts found. Connect and tune in." />
              </div>
            </div>
          ) : (
            <>
              {/* Discover Weekly Banner & AI Lab Section */}
            {auth.currentUser && discoverWeekly && (
              <section className="w-full">
                
                {/* Premium Banner */}
                <motion.div
                  whileHover={{ 
                    scale: 1.005,
                    y: -2,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative h-48 md:h-80 rounded-2xl overflow-hidden cursor-pointer"
                >
                  <Card 
                    onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
                    className="relative h-full w-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl group transition-all duration-500 border-none"
                  >
                    <img 
                      src={discoverWeekly.coverUrl} 
                      alt="Discover Weekly" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <CardContent className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex justify-between items-end">
                      <div className="space-y-2 md:space-y-4 max-w-[75%]">
                        <div className="flex items-center gap-2 md:gap-3">
                          <Badge className="bg-blue-600 hover:bg-blue-600 text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm py-0.5 md:py-1 border-none">
                            AI DISCOVERY
                          </Badge>
                          <span className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live.Sync_2026</span>
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-5xl font-bold uppercase tracking-tighter text-white leading-[0.9]">Discover<br />Weekly</h2>
                          <p className="text-[10px] md:text-xs text-blue-400 font-extrabold max-w-md mt-2 md:mt-3 line-clamp-2">
                            {discoverWeekly.description || "Personalized frequency stream generated by Gemini based on your unique neural listening patterns."}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const tracks = discoverWeekly.trackIds?.map(id => allTracks.find(t => t.id === id)).filter(Boolean) as any[];
                          if (tracks && tracks.length > 0) playAll(tracks);
                        }}
                        className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white hover:scale-110 transition-all border-none flex-shrink-0"
                      >
                        <Play className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </section>
            )}

            {/* Browse Categories - Modern Bento Grid */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-ui">Browse Dimensions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {BROWSE_CATEGORIES.map((category, idx) => (
                  <motion.div 
                    key={category.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-600/50 to-cyan-400/50 rounded-xl opacity-0 group-hover:opacity-100 blur-[1px] transition-opacity duration-300"></div>
                    <Card 
                      onClick={() => setSearchQuery(category.title)}
                      className={`${category.color} aspect-[16/9] relative overflow-hidden cursor-pointer border-none shadow-lg group transition-all duration-300 active:scale-95 rounded-xl`}
                    >
                      <CardContent className="p-4 h-full flex flex-col justify-between">
                        <h3 className="text-white font-bold text-lg uppercase leading-[0.9] tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity font-display">
                          {category.title}
                        </h3>
                        <div className="absolute -bottom-2 -right-4 w-32 h-32 group-hover:scale-110 transition-transform duration-500">
                          <img 
                            src={category.image} 
                            alt=""
                            className="w-full h-full object-cover rotate-[25deg] rounded-lg shadow-2xl opacity-60 group-hover:opacity-100"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* PERSONALIZED RECOMMENDATION HUB ANALYTICS & REASONING */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.25em]">Neural Recommendation Engine</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-foreground font-display">Personalized for You</h2>
                </div>
                
                {/* Micro Analysis Tags showing actual items parsed */}
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase font-semibold">
                  <span className="bg-muted/10 px-2 py-1 rounded">History: {recentlyPlayed?.length || 0}</span>
                  <span className="bg-pink-500/5 text-pink-500 px-2 py-1 rounded">Likes: {likedTrackIds?.length || 0}</span>
                  <span className="bg-cyan-500/5 text-cyan-400 px-2 py-1 rounded">Follows: {followedUserIds?.length || 0}</span>
                  <span className="bg-yellow-500/5 text-yellow-500 px-2 py-1 rounded">NFTs: {userNFTs?.length || 0}</span>
                </div>
              </div>

              {/* Personalization Reason Toast / Context */}
              {userListeningHabits.hasInteractions ? (
                <div className="p-4 bg-purple-500/5 rounded-2xl flex items-center gap-3 text-xs text-purple-300 uppercase tracking-wider font-semibold">
                  <Zap className="h-4 w-4 shrink-0 text-purple-400 animate-pulse" />
                  <span>
                    Synchronizing your waves: We found a passion for <strong className="text-white">{userListeningHabits.favoriteGenre || "various"}</strong> music matched with <strong className="text-white">{userListeningHabits.favoriteMood || "your general"}</strong> vibes. Here is your custom daily stream.
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-blue-500/5 rounded-2xl flex items-center gap-3 text-xs text-blue-300 uppercase tracking-wider font-semibold">
                  <Zap className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    New synapse detected: To unlock higher personalization accuracy, stream music, follow artists, or collect item drops. Displaying live network signals.
                  </span>
                </div>
              )}

              {/* Personalized recommended track cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedTracks.map((track) => (
                  <motion.div 
                    key={`rec-track-${track.id}`}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-xl bg-card hover:bg-[#121A3E]/30 relative transition-all duration-300 group flex items-center gap-4 cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                      <img src={track.coverUrl || getPlaceholderImage(track.title)} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {track.recommendationReason}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white truncate uppercase tracking-wide group-hover:text-purple-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] border-none text-zinc-500 uppercase tracking-widest font-mono font-bold">
                      {track.genre}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* TRENDING TRACKS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em]">Network Heatmeter</span>
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Trending Tracks</h2>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => playAll(trendingTracks)}
                  className="text-[10px] uppercase font-bold tracking-widest text-[#5B6BFF] hover:text-white"
                >
                  Play All Trending
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingTracks.map((track, index) => (
                  <motion.div 
                    key={`trending-track-${track.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => playTrack(track)}
                    className="group relative bg-[#0B0F2A] hover:bg-[#121A3E]/30 p-4 rounded-xl flex flex-col justify-between aspect-square transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-2/3 w-full rounded-lg overflow-hidden shrink-0">
                      <img src={track.coverUrl || getPlaceholderImage(track.title)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-mono">
                        #{index + 1}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Play className="h-8 w-8 text-white fill-current" />
                      </div>
                    </div>
                    <div className="mt-3 truncate space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#5B6BFF] transition-colors">{track.title}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* EMERGING ARTISTS */}
            <section className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.25em]">Boutique Signals</span>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Emerging Artists</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {emergingArtists.map((artist) => {
                  const isFollowing = followedUserIds.includes(artist.uid);
                  return (
                    <motion.div 
                      key={`emerging-${artist.uid}`}
                      whileHover={{ y: -3 }}
                      className="group bg-[#0B0F2A] hover:bg-[#121A3E]/30 p-4 rounded-xl text-center flex flex-col items-center justify-between space-y-4 duration-300 transition-all"
                    >
                      <div className="relative cursor-pointer" onClick={() => navigate(`/artist/${artist.uid}`)}>
                        <Avatar className="h-20 w-20 ring-4 ring-white/5 group-hover:ring-cyan-500/30 transition-all duration-300">
                          <AvatarImage src={artist.avatarUrl || getPlaceholderImage(artist.name)} className="object-cover" />
                          <AvatarFallback><User className="h-8 w-8 text-neutral-400" /></AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="space-y-1 text-center truncate w-full">
                        <h4 className="text-[12px] font-bold uppercase tracking-wider text-white group-hover:text-cyan-400 transition-colors cursor-pointer truncate" onClick={() => navigate(`/artist/${artist.uid}`)}>
                          {artist.name}
                        </h4>
                        <p className="text-[9px] text-[#5B6BFF] font-bold uppercase tracking-widest truncate">{artist.genre || "Independent"} Wave</p>
                        <p className="text-[9px] text-zinc-500 truncate">{artist.followers || 0} Followers</p>
                      </div>

                      <Button
                        size="sm"
                        variant={isFollowing ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollowUser(artist.uid);
                        }}
                        className={`w-full py-1 text-[8px] font-bold uppercase tracking-widest rounded-lg h-8 transition-colors ${
                          isFollowing 
                            ? "bg-transparent border border-white/20 text-white hover:bg-white/5" 
                            : "bg-[#5B6BFF] text-white hover:bg-[#5B6BFF]/80"
                        }`}
                      >
                        {isFollowing ? "FOLLOWING" : "+ FOLLOW"}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* FEATURED NFT RELEASES */}
            <section className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.25em]">Mints & Collectibles</span>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Featured NFT Releases</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredNFTReleases.map((nft) => (
                  <motion.div 
                    key={`drop-nft-${nft.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/nft/${nft.id}`)}
                    className="group bg-[#0B0F2A] hover:bg-[#121A3E]/30 p-4 rounded-xl flex flex-col justify-between aspect-square transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-2/3 w-full rounded-lg overflow-hidden shrink-0">
                      <img src={nft.coverUrl || nft.imageUrl || getPlaceholderImage(nft.title)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                        {nft.listingType || "Fixed"}
                      </div>
                    </div>
                    <div className="mt-3 truncate space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-yellow-500 transition-colors">{nft.title}</h4>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>{nft.edition}</span>
                        <span className="text-yellow-400 font-bold">{nft.price} TON</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Community Activity Feed Widget */}
            {posts && posts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#5B6BFF] uppercase tracking-[0.25em]">Live Network Hub</span>
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">Community Sync Feed</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveFilter('community')}
                    className="h-auto p-0 text-[10px] uppercase font-bold tracking-widest text-[#5B6BFF] hover:text-[#5B6BFF]/80 hover:bg-transparent"
                  >
                    Enter Live Lobby →
                  </Button>
                </div>
                <div className="bg-[#0B0F2A] rounded-xl p-4 space-y-4">
                  <SocialFeed posts={posts.slice(0, 3)} onDeletePost={deletePost} />
                </div>
              </section>
            )}

            {/* Albums Section */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white font-bold">Featured Albums</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {MOCK_ALBUMS.map((album, index) => (
                    <CarouselItem key={album.id} className="basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[12.5%] pl-3">
                      <AlbumCard album={album} index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>

            {/* Trending Artist Leaderboard with Sparklines */}
            <section className="space-y-4">
              <TrendingArtistLeaderboard limit={5} />
            </section>
            
            {/* Artist Leaderboard */}
            <section className="space-y-4">
              <ArtistLeaderboard artists={artists.slice(0, 5)} title="Top Artists" />
            </section>
          </>
          )
        ) : (
          <div className="space-y-12">
            {hasResults ? (
              <>
                {/* Results categorization */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Left Column: Top Result & Tracks */}
                  <div className="lg:col-span-12 space-y-12">
                    
                    {/* Top Result */}
                    {(activeFilter === 'all' || activeFilter === 'artists') && filteredResults.artists.length > 0 && (
                      <section>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-6">Discovery Identification</h2>
                        <Card 
                          onClick={() => navigate(`/artist/${filteredResults.artists[0].uid}`)}
                          className="max-w-2xl bg-white/[0.02] hover:bg-white/[0.05] border-none transition-all p-8 rounded-[4px] group cursor-pointer"
                        >
                          <div className="flex flex-col md:flex-row items-center gap-8">
                            <Avatar className="h-40 w-40 shadow-2xl ring-8 ring-white/[0.02]">
                              <AvatarImage src={filteredResults.artists[0].avatarUrl || getPlaceholderImage(filteredResults.artists[0].name)} className="object-cover" />
                              <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left space-y-4">
                              <div>
                                <Badge className="bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-none text-[9px] font-bold uppercase tracking-[0.2em] mb-2 px-3 py-1">
                                  Verified Entity
                                </Badge>
                                <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.8] mb-2">
                                  {filteredResults.artists[0].name}
                                </h3>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Artist
                                  </span>
                                  <Separator orientation="vertical" className="h-3 bg-white/10" />
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {Math.floor(Math.random() * 800 + 200)}k Monthly Listeners
                                  </span>
                                </div>
                              </div>
                              <Button className="rounded-full px-8 bg-foreground text-background font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
                                Explore Archive
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </section>
                    )}

                    {/* Tracks - List View */}
                    {(activeFilter === 'all' || activeFilter === 'tracks') && filteredResults.tracks.length > 0 && (
                      <section className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 font-bold">Sonic Archive</h2>
                          {activeFilter === 'all' && filteredResults.tracks.length > 4 && (
                            <Button variant="ghost" onClick={() => setActiveFilter('tracks')} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                              View all
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                              <SkeletonCard key={i} variant="row" />
                            ))
                          ) : (
                            filteredResults.tracks.slice(0, activeFilter === 'all' ? 4 : undefined).map((track, idx) => (
                              <TrackCard key={`${track.id}-${idx}`} track={track} variant="row" />
                            ))
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Grid Sections: Artists, Users, NFTs */}
                <div className="space-y-16">
                  {/* Artists */}
                  {(activeFilter === 'all' || activeFilter === 'artists') && filteredResults.artists.length > 1 && (
                    <section className="space-y-8">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Similar Signals</h2>
                      <div className="flex flex-col gap-2">
                        {filteredResults.artists.slice(activeFilter === 'all' ? 1 : 0).map((artist) => (
                          <ArtistListItem key={artist.uid} artist={artist} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Users */}
                  {(activeFilter === 'all' || activeFilter === 'users') && filteredResults.users.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Network Nodes</h2>
                      <div className="flex flex-col gap-2">
                        {filteredResults.users.map((u) => (
                          <div 
                            key={u.uid}
                            onClick={() => navigate((u.isVerifiedArtist || u.verified) ? `/artist/${u.uid}` : `/user/${u.uid}`)}
                            className="group flex items-center gap-4 p-3 rounded-[4px] bg-muted/10 hover:bg-muted/50 cursor-pointer transition-all"
                          >
                            <Avatar className="h-12 w-12 rounded-[4px] shadow-sm grayscale group-hover:grayscale-0 transition-all duration-300">
                              <AvatarImage src={u.avatar || getPlaceholderImage(u.name)} className="object-cover" />
                              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-[11px] sm:text-[13px] font-semibold uppercase tracking-tight">{u.name}</h4>
                              <p className="text-[9px] font-bold text-blue-500/80 uppercase tracking-widest">{u.username.replace('@', '')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* NFTs */}
                  {(activeFilter === 'all' || activeFilter === 'nfts') && (
                    filteredResults.nfts.length > 0 ? (
                      <section className="space-y-8">
                        <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Digital Collectibles</h2>
                        <div className="flex flex-col gap-2">
                          {filteredResults.nfts.map((nft) => (
                            <NFTCard key={nft.id} nft={nft} variant="row" />
                          ))}
                        </div>
                      </section>
                    ) : activeFilter === 'nfts' ? (
                      <EmptyNFTState
                        title="No NFTs Found"
                        description="Our scanners mapped zero audio NFTs corresponding to your query. Modify your search syntax or explore other categories."
                        onReset={() => {
                          setSearchQuery('');
                          setActiveFilter('all');
                        }}
                        actionLabel="Clear Search Filter"
                      />
                    ) : null
                  )}
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 text-center space-y-8"
              >
                <div className="relative">
                  <Search className="h-24 w-24 text-white/5" strokeWidth={1} />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground/80">Void Detected</h3>
                  <p className="text-muted-foreground max-w-xs text-sm font-medium">Spelling check required. No matching data streams found for your current query.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="rounded-full px-8 border-none bg-white/5 hover:bg-white/10"
                >
                  Reset Stream
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default Discover;
