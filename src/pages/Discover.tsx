import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { GENRES, MOODS } from '@/constants';
import { auth } from '@/lib/firebase';
import NFTCard from '@/components/NFTCard';
import TrackCard from '@/components/TrackCard';
import SkeletonCard from '@/components/SkeletonCard';
import SonicSearchSection from '@/components/SonicSearchSection';
import { useAudio } from '@/context/AudioContext';
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
    playTrack
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'nfts' | 'artists' | 'playlists' | 'users'>('all');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
    const query = searchQuery.toLowerCase();
    
    let tracks = allTracks.filter(t => 
      (query === '' || t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query))
    );
    
    const nfts = allNFTs.filter(n => {
      if (query === '') return true;
      const q = query;
      return (
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.artist && n.artist.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q))
      );
    });
    
    const filteredArtists = artists.filter(a => 
      query === '' || a.name.toLowerCase().includes(query) || 
      (a.genre && a.genre.toLowerCase().includes(query))
    );

    const users = firestoreUsers.filter(u => 
      query === '' || u.name.toLowerCase().includes(query) || 
      u.username.toLowerCase().includes(query)
    );

    return { tracks, nfts, artists: filteredArtists, users };
  }, [searchQuery, allTracks, artists, allNFTs, firestoreUsers]);

  const hasResults = filteredResults.tracks.length > 0 || 
                     filteredResults.nfts.length > 0 || 
                     filteredResults.artists.length > 0 ||
                     filteredResults.users.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToSearchHistory(searchQuery);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-24 relative overflow-hidden">
      {/* Atmospheric Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 -left-24 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />
      
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

      {/* Search Header - Sticky & Atmospheric */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 bg-background/80 backdrop-blur-3xl pt-5 pb-3 px-[var(--page-margin)] md:px-[var(--page-margin-md)] lg:px-[var(--page-margin-lg)]">
        <form 
          onSubmit={handleSearchSubmit} 
          className="relative max-w-2xl mx-auto w-full"
        >
          <div className="relative flex items-center group">
            <div className="absolute left-4 z-10 pointer-events-none">
              <Search className={`h-4 w-4 transition-colors ${isFocused ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </div>
            <Input
              type="text"
              placeholder="Search artists, tracks, NFTs..."
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-24 h-12 bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-xl transition-all discover-search-input text-sm font-medium"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
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
                      className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg"
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
                className={`h-9 w-9 rounded-lg transition-all ${isVoiceSearchActive ? 'text-rose-500 bg-rose-500/10 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {isVoiceSearchActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isFocused && !searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 p-6 border-none"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Recent Searches */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                      </div>
                      {searchHistory.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearSearchHistory} 
                          className="h-auto p-0 text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {searchHistory.length > 0 ? (
                        searchHistory.map((item, index) => (
                          <div 
                            key={`hist-${index}`}
                            className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => {
                              setSearchQuery(item);
                              setIsFocused(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Search className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{item}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchHistory(prev => prev.filter(t => t !== item));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground/50 italic px-2">No recent history</p>
                      )}
                    </div>
                  </div>

                  {/* Trending Topics */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic, index) => (
                        <Badge
                          key={`trend-${index}`}
                          variant="secondary"
                          className="px-3 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 rounded-full cursor-pointer transition-all border-none"
                          onClick={() => {
                            setSearchQuery(topic);
                            setIsFocused(false);
                          }}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Filter Tabs - Pill Buttons */}
        <div className="mt-3 flex justify-center filter-tabs">
          <Tabs value={activeFilter} onValueChange={(v: any) => setActiveFilter(v)} className="w-full max-w-2xl">
            <div className="overflow-x-auto no-scrollbar scroll-smooth flex justify-start md:justify-center px-4">
              <TabsList className="bg-transparent h-auto p-0 gap-2 flex flex-nowrap min-w-max">
                {(['all', 'tracks', 'artists', 'nfts', 'playlists', 'users'] as const).map((filter) => (
                  <TabsTrigger
                    key={filter}
                    value={filter}
                    className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-white/5 border-none shadow-none hover:data-[state=inactive]:bg-white/10 shrink-0"
                  >
                    {filter}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="page-container pt-[120px] pb-6 space-y-10">
        {!searchQuery ? (
          <>
            {/* Discover Weekly Banner - Premium Look */}
            {auth.currentUser && discoverWeekly && (
              <section>
                <Card 
                  onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
                  className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden cursor-pointer border-none shadow-2xl group transition-all duration-500"
                >
                  <img 
                    src={discoverWeekly.coverUrl} 
                    alt="Discover Weekly" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <CardContent className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex justify-between items-end">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600 hover:bg-blue-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-sm py-1 border-none">
                          Daily Frequency
                        </Badge>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live.Sync_2026</span>
                      </div>
                      <div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">Discover<br />Weekly</h2>
                        <p className="text-sm text-white/50 font-medium max-w-md mt-4">Personalized frequency stream based on your unique neural listening patterns.</p>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/40 hover:scale-110 transition-all border-none"
                    >
                      <Play className="h-8 w-8 fill-current" />
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Recent Searches */}
            <div id="sonic">
              <SonicSearchSection />
            </div>

            {searchHistory.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent exploration</h2>
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
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Browse Dimensions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {BROWSE_CATEGORIES.map((category) => (
                  <Card 
                    key={category.id}
                    onClick={() => setSearchQuery(category.title)}
                    className={`${category.color} aspect-square relative overflow-hidden cursor-pointer border-none shadow-lg group transition-all duration-300 active:scale-95`}
                  >
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      <h3 className="text-white font-black text-lg uppercase leading-[0.9] tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
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
                ))}
              </div>
            </section>
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
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Primary Identification</h2>
                        <Card 
                          onClick={() => navigate(`/artist/${filteredResults.artists[0].uid}`)}
                          className="max-w-2xl bg-white/[0.02] hover:bg-white/[0.05] border-none transition-all p-8 rounded-[2rem] group cursor-pointer"
                        >
                          <div className="flex flex-col md:flex-row items-center gap-8">
                            <Avatar className="h-40 w-40 shadow-2xl ring-8 ring-white/[0.02]">
                              <AvatarImage src={filteredResults.artists[0].avatarUrl || getPlaceholderImage(filteredResults.artists[0].name)} className="object-cover" />
                              <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left space-y-4">
                              <div>
                                <Badge className="bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-none text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-3 py-1">
                                  Verified Entity
                                </Badge>
                                <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.8] mb-2">
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
                              <Button className="rounded-full px-8 bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
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
                          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Digital Artifacts</h2>
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Similar Signals</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                        {filteredResults.artists.slice(activeFilter === 'all' ? 1 : 0).map((artist) => (
                          <div 
                            key={artist.uid}
                            onClick={() => navigate(`/artist/${artist.uid}`)}
                            className="group cursor-pointer text-center space-y-4"
                          >
                            <Avatar className="h-full w-full aspect-square shadow-xl group-hover:scale-105 transition-transform duration-500 ring-4 ring-transparent group-hover:ring-white/5">
                              <AvatarImage src={artist.avatarUrl || getPlaceholderImage(artist.name)} className="object-cover" />
                              <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-tighter truncate">{artist.name}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Users */}
                  {(activeFilter === 'all' || activeFilter === 'users') && filteredResults.users.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Nodes</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                        {filteredResults.users.map((u) => (
                          <div 
                            key={u.uid}
                            onClick={() => navigate(`/user/${u.uid}`)}
                            className="group cursor-pointer text-center space-y-4"
                          >
                            <Avatar className="h-full w-full aspect-square shadow-xl group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0 ring-4 ring-transparent group-hover:ring-blue-500/20">
                              <AvatarImage src={u.avatar || getPlaceholderImage(u.name)} className="object-cover" />
                              <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-tighter truncate">{u.name}</h4>
                              <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">@{u.username}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* NFTs */}
                  {(activeFilter === 'all' || activeFilter === 'nfts') && filteredResults.nfts.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Blockchain Assets</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {filteredResults.nfts.map((nft) => (
                          <div key={nft.id} className="transition-all hover:translate-y-[-4px]">
                            <NFTCard nft={nft} />
                          </div>
                        ))}
                      </div>
                    </section>
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
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground/80 italic">Void Detected</h3>
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
