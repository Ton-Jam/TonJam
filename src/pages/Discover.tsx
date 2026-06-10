import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { krupyVibesSearch } from '@/services/krupyVibesService';
import { Joyride } from 'react-joyride';
import { motion, AnimatePresence } from 'motion/react';
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
  Zap
} from 'lucide-react';
import { GENRES, MOODS, MOCK_ALBUMS } from '@/constants';
import { auth } from '@/lib/firebase';
import { APP_LOGO } from '@/constants';
import NFTCard from '@/components/NFTCard';
import EmptyNFTState from '@/components/EmptyNFTState';
import TrendingNFTCard from '@/components/TrendingNFTCard';
import TrackCard from '@/components/TrackCard';
import AlbumCard from '@/components/AlbumCard';
import ArtistListItem from '@/components/ArtistListItem';
import TrendingArtistLeaderboard from '@/components/TrendingArtistLeaderboard';
import SkeletonCard from '@/components/SkeletonCard';
import SonicSearchSection from '@/components/SonicSearchSection';
import { FilterSection } from '@/components/FilterSection';
import { useAudio } from '@/context/AudioContext';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getPlaceholderImage } from '@/lib/utils';

// shadcn imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
    followedUserIds,
    isDiscoverFiltersOpen,
    setIsDiscoverFiltersOpen
  } = useAudio();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const { 
    generateDiscoverWeekly,
    playlists: allUserPlaylists
  } = useAudio();

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'nfts' | 'artists' | 'playlists' | 'users'>('all');
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

  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return;
    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 10);
      localStorage.setItem('tonjam_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tonjam_search_history');
  };

  const handleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsVoiceSearchActive(true);
    recognition.onend = () => setIsVoiceSearchActive(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      addToSearchHistory(transcript);
    };

    recognition.start();
  };

  const filteredResults = useMemo(() => {
    if (aiVibeResults) {
      return { tracks: aiVibeResults, nfts: [], artists: [], users: [] };
    }
    const query = searchQuery.toLowerCase();
    
    const sortPrioritizeFollowed = (a: any, b: any, getId: (item: any) => string | undefined) => {
      const aFollowed = followedUserIds.includes(getId(a) || '');
      const bFollowed = followedUserIds.includes(getId(b) || '');
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;
      return 0;
    };

    const tracks = allTracks.filter((t: any) => {
      const matchesQuery = (query === '' || 
        (t.title || '').toLowerCase().includes(query) || 
        (t.artist || '').toLowerCase().includes(query) ||
        (t.genre || '').toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
      if (t.bpm && (t.bpm < bpmRange[0] || t.bpm > bpmRange[1])) return false;
      if (selectedKeys.length > 0 && t.key) {
        const matchesKey = selectedKeys.some(sk => t.key.startsWith(sk));
        if (!matchesKey) return false;
      }
      if (selectedMoods.length > 0 && t.mood && !selectedMoods.includes(t.mood)) return false;
      if (onlyVerified && !t.artistVerified) return false;
      return true;
    }).sort((a: any, b: any) => sortPrioritizeFollowed(a, b, t => t.artistId));
    
    const nfts = allNFTs.filter((n: any) => {
      const q = query;
      const matchesQuery = (q === '' ||
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.artist && n.artist.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)));
      
      if (!matchesQuery) return false;
      if (onlyVerified && !n.artistVerified) return false;
      return true;
    }).sort((a: any, b: any) => sortPrioritizeFollowed(a, b, n => n.artistId));
    
    const filteredArtists = artists.filter((a: any) => {
      const matchesQuery = (query === '' || (a.name || '').toLowerCase().includes(query) || 
        (a.genre && a.genre.toLowerCase().includes(query)));
      
      if (!matchesQuery) return false;
      if (onlyVerified && !a.verified) return false;
      return true;
    }).sort((a: any, b: any) => sortPrioritizeFollowed(a, b, art => art.uid));

    const users = firestoreUsers.filter((u: any) => {
      const matchesQuery = (query === '' || (u.name || '').toLowerCase().includes(query) || 
        (u.username || '').toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
      if (onlyVerified && !u.isVerifiedArtist) return false;
      return true;
    }).sort((a: any, b: any) => sortPrioritizeFollowed(a, b, usr => usr.uid));

    return { tracks, nfts, artists: filteredArtists, users };
  }, [searchQuery, allTracks, artists, allNFTs, firestoreUsers, bpmRange, selectedKeys, selectedMoods, onlyVerified, followedUserIds, aiVibeResults]);

  const hasResults = filteredResults.tracks.length > 0 || 
                     filteredResults.nfts.length > 0 || 
                     filteredResults.artists.length > 0 ||
                     filteredResults.users.length > 0;

  useEffect(() => {
    // Basic vibe detection: "mood", "vibe", "feeling", "like"
    const vibeKeywords = ['mood', 'vibe', 'feeling', 'like', 'sounds like', 'atmosphere'];
    const lowerQuery = searchQuery.toLowerCase();
    const isVibeQuery = vibeKeywords.some(k => lowerQuery.includes(k)) || isVibeSearch;

    if (isVibeQuery && searchQuery.length > 5) {
       krupyVibesSearch(searchQuery, allTracks).then(setAiVibeResults);
    } else {
       setAiVibeResults(null);
    }
  }, [searchQuery, isVibeSearch, allTracks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToSearchHistory(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Atmospheric Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 -left-24 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -z-10" />
      
      {/* DJ Krupy Background Decoration */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-20 opacity-[0.02] overflow-hidden">
        <img src={APP_LOGO} className="w-[120vw] h-[120vw] animate-[spin_120s_linear_infinite] grayscale" alt="" />
      </div>
      
      <Joyride
        steps={[
          {
            target: '.discover-search-input',
            content: 'Use the search bar to find your favorite tracks, artists, or NFTs.',
          },
          {
            target: '.filter-tabs',
            content: 'Filter results by category.',
          }
        ]}
        run={isTourOpen}
        continuous
      />

      {/* Search Header - Sticky & Atmospheric with standard top padding */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg pt-5 pb-3 w-full border-b border-blue-500/10 transition-colors duration-300">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3 px-4">
          <form 
            onSubmit={handleSearchSubmit} 
            className="relative flex-1 group"
          >
            {/* Shiny Gradient Border Effect */}
            <div className={`absolute -inset-[1px] rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 opacity-20 blur-[2px] transition-all duration-500 ${isFocused ? 'opacity-60 blur-[4px] scale-[1.01]' : 'group-hover:opacity-40 blur-[2px]'}`} />
            
            <div className={`relative flex items-center h-11 bg-background border transition-all duration-300 ease-in-out rounded-full overflow-hidden focus-within:scale-[1.02] ${isFocused ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-blue-500/30 group-hover:border-blue-500/50'}`}>
              <div className="absolute left-4 z-10 pointer-events-none">
                <Search className={`h-4 w-4 transition-colors ${isFocused ? 'text-blue-500' : 'text-zinc-500'}`} />
              </div>
              
              <Input
                type="text"
                placeholder="Search artists, tracks, NFTs..."
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-24 h-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-all discover-search-input text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 z-10"
              />

              <div className="absolute right-3 flex items-center gap-1.5 z-20">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`h-8 w-8 rounded-full transition-all ${isVoiceSearchActive ? 'text-rose-500 bg-rose-500/10 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {isVoiceSearchActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Suggestions Command Palette */}
            <AnimatePresence>
              {isFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/40 shadow-none rounded-[4px] overflow-hidden z-50 p-2"
                >
                  <Command className="bg-transparent border-none">
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty className="py-6 text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold">No results identified</CommandEmpty>
                      
                      {searchQuery ? (
                        <CommandGroup heading="Suggestions">
                           {filteredResults.tracks.slice(0, 3).map((track) => (
                             <CommandItem 
                               key={`track-${track.id}`}
                               onSelect={() => {
                                 setSearchQuery(track.title);
                                 setIsFocused(false);
                                 navigate(`/track/${track.id}`);
                               }}
                               className="rounded-[4px] flex items-center justify-between group cursor-pointer"
                             >
                               <div className="flex items-center gap-3">
                                 <Music className="h-3.5 w-3.5 text-zinc-500" />
                                 <span className="text-sm font-medium">{track.title}</span>
                               </div>
                             </CommandItem>
                           ))}
                           {filteredResults.artists.slice(0, 3).map((artist) => (
                             <CommandItem 
                               key={`artist-${artist.uid}`}
                               onSelect={() => {
                                 setSearchQuery(artist.name);
                                 setIsFocused(false);
                                 navigate(`/artist/${artist.uid}`);
                               }}
                               className="rounded-[4px] flex items-center justify-between group cursor-pointer"
                             >
                               <div className="flex items-center gap-3">
                                 <User className="h-3.5 w-3.5 text-zinc-500" />
                                 <span className="text-sm font-medium">{artist.name}</span>
                               </div>
                             </CommandItem>
                           ))}
                        </CommandGroup>
                      ) : (
                        <>
                          {searchHistory.length > 0 && (
                            <CommandGroup heading={<span className="flex items-center gap-2"><History className="h-3 w-3" /> Recent Searches</span>}>
                              {searchHistory.map((item, index) => (
                                <CommandItem 
                                  key={`hist-${index}`}
                                  onSelect={() => {
                                    setSearchQuery(item);
                                    setIsFocused(false);
                                  }}
                                  className="rounded-[4px] flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <Search className="h-3.5 w-3.5 text-zinc-500" />
                                    <span className="text-sm font-medium">{item}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearchHistory(prev => prev.filter(t => t !== item));
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          
                          <CommandSeparator className="bg-white/5" />
                          
                          <CommandGroup heading={<span className="flex items-center gap-2"><TrendingUp className="h-3 w-3" /> Trending</span>}>
                            {trendingTopics.map((topic, index) => (
                              <CommandItem 
                                key={`trend-${index}`}
                                onSelect={() => {
                                    setSearchQuery(topic);
                                    setIsFocused(false);
                                }}
                                className="rounded-[4px] flex items-center gap-3 cursor-pointer"
                              >
                                <Zap className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-sm font-medium">{topic}</span>
                                <CommandShortcut className="text-blue-500/50">#hot</CommandShortcut>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Advanced Filters Sheet */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsDiscoverFiltersOpen(true)}
            className="h-11 w-11 rounded-[4px] bg-muted/20 border border-border/40 text-muted-foreground hover:bg-muted/40 transition-all shrink-0"
          >
            <ListFilter className="h-4 w-4 text-foreground" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs Section - Sticky directly below Header */}
      <div className="sticky top-[76px] z-40 bg-background/95 backdrop-blur-lg py-3 w-full border-b border-blue-500/10 transition-colors duration-300">
        <div className="w-full filter-tabs">
          <Tabs value={activeFilter} onValueChange={(v: any) => setActiveFilter(v)} className="w-full">
            <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 flex justify-start md:justify-center py-1">
              <TabsList className="bg-transparent h-auto p-0 gap-2 flex flex-nowrap min-w-max">
                {(['all', 'tracks', 'artists', 'nfts', 'playlists', 'users'] as const).map((filter) => (
                  <TabsTrigger
                    key={filter}
                    value={filter}
                    className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-transparent hover:bg-white/5 text-muted-foreground border border-[#C0C0C0]/25 data-[state=active]:border-transparent hover:border-[#C0C0C0]/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground shrink-0 cursor-pointer h-auto"
                  >
                    {filter}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>


      <div className="w-full max-w-full px-4 pb-24 space-y-6">
        

        {isLoading ? (
          <div className="space-y-12">
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
          <>
            {/* Discover Weekly Banner - Premium Look */}
            {auth.currentUser && discoverWeekly && (
              <section>
                <Card 
                  onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
                  className="relative h-48 md:h-80 rounded-2xl overflow-hidden cursor-pointer border-none shadow-none group transition-all duration-500 bg-background"
                >
                  <img 
                    src={discoverWeekly.coverUrl} 
                    alt="Discover Weekly" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <CardContent className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex justify-between items-end">
                    <div className="space-y-2 md:space-y-4 max-w-[70%]">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Badge className="bg-blue-600 hover:bg-blue-600 text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm py-0.5 md:py-1 border-none">
                          Daily Frequency
                        </Badge>
                        <span className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live.Sync_2026</span>
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-[0.9]">Discover<br />Weekly</h2>
                        <p className="text-[10px] md:text-sm text-blue-400 font-extrabold max-w-md mt-2 md:mt-4 line-clamp-2">Personalized frequency stream based on your unique neural listening patterns.</p>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      className="h-10 w-10 md:h-16 md:w-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white hover:scale-110 transition-all border-none flex-shrink-0"
                    >
                      <Play className="h-5 w-5 md:h-8 md:w-8 fill-current" />
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {searchHistory.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800">Recent exploration</h2>
                  <Button variant="ghost" size="sm" onClick={clearSearchHistory} className="h-auto p-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground">
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, idx) => (
                    <Badge
                      key={`history-${idx}`}
                      variant="secondary"
                      onClick={() => setSearchQuery(term)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium cursor-pointer transition-colors border-none"
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Browse Categories - Modern Bento Grid */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800 font-ui">Browse Dimensions</h2>
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

            {/* Albums Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800">Featured Albums</h2>
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
                    <CarouselItem key={album.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                      <AlbumCard album={album} index={index} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>

            {/* Trending Artist Leaderboard with Sparklines */}
            <section className="space-y-6">
              <TrendingArtistLeaderboard limit={5} />
            </section>

            {/* AI Dj Krupy Section removed to avoid duplication on Home screen context */}
          </>
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
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-800/60 mb-6">Discovery Identification</h2>
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
                          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-800/60 font-bold">Sonic Archive</h2>
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-800/60">Similar Signals</h2>
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
                      <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-800/60">Network Nodes</h2>
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
                        <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-800/60">Digital Collectibles</h2>
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
