import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DiscoverSearchBar from '@/components/DiscoverSearchBar';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Music, User, Gem, RotateCcw, Satellite, ChevronRight, Sparkles, Filter, Calendar, DollarSign, Award, Layers } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, GENRES, MOCK_USERS, APP_LOGO } from '@/constants';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import NFTCard from '@/components/NFTCard';
import PlaylistListItem from '@/components/PlaylistListItem';
import ArtistListItem from '@/components/ArtistListItem';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const RECENT_SEARCHES_KEY = 'tonjam_recent_searches';
const INITIAL_LIMIT = 12;
const LOAD_MORE_COUNT = 12;
const TRACK_SORT_OPTIONS = ['Newest', 'Popularity', 'Most Liked'];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack, addNotification, artists, getTrendingTracks, getTopNFTTracks, allPlaylists, searchQuery: search, setSearchQuery: setSearch, generateDiscoverWeekly, isDiscoverFiltersOpen: showFilters, setIsDiscoverFiltersOpen: setShowFilters } = useAudio();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  useEffect(() => {
    generateDiscoverWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeFilter, setActiveFilter] = useState<'Artists' | 'Tracks' | 'NFTs' | 'Playlists' | 'Users' | 'All'>('All');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rarity: 'All',
    editionType: 'All',
    timeframe: 'All Time'
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [suggestions, setSuggestions] = useState<{id: string, title: string, type: string, subtitle?: string}[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleVoiceSearch = useCallback(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addNotification("Voice search is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      addNotification("Listening...", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        addNotification("Microphone access denied.", "error");
      } else if (event.error !== 'aborted') {
        addNotification(`Voice search error: ${event.error}`, "error");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition", error);
      setIsListening(false);
    }
  }, [isListening, setSearch, addNotification]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch, setSearch]);

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + LOAD_MORE_COUNT);
  }, []);

  const sentinelRef = useInfiniteScroll(loadMore);

  const trendingTracks = useMemo(() => getTrendingTracks(), [getTrendingTracks]);
  const topNFTTracks = useMemo(() => getTopNFTTracks(), [getTopNFTTracks]);

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const newSuggestions: {id: string, title: string, type: string, subtitle?: string}[] = [];

    MOCK_TRACKS.forEach(t => {
      if (t.title.toLowerCase().includes(lowerSearch) || t.artist.toLowerCase().includes(lowerSearch)) {
        newSuggestions.push({ id: t.id, title: t.title, type: 'Track', subtitle: t.artist });
      }
    });

    artists.forEach(a => {
      if (a.name.toLowerCase().includes(lowerSearch)) {
        newSuggestions.push({ id: a.id, title: a.name, type: 'Artist', subtitle: 'Artist' });
      }
    });

    MOCK_NFTS.forEach(n => {
      if (n.title.toLowerCase().includes(lowerSearch)) {
        newSuggestions.push({ id: n.id, title: n.title, type: 'NFT', subtitle: n.creator });
      }
    });

    MOCK_USERS.forEach(u => {
      if (u.name.toLowerCase().includes(lowerSearch) || u.handle.toLowerCase().includes(lowerSearch)) {
        newSuggestions.push({ id: u.id, title: u.name, type: 'User', subtitle: u.handle });
      }
    });

    setSuggestions(newSuggestions.slice(0, 5));
  }, [search, artists]);

  const addToRecentSearches = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    addNotification("Search memory purged", "info");
  };

  const handleRecentSearchClick = (term: string) => {
    setSearch(term);
    setIsSearchFocused(false);
    addToRecentSearches(term);
  };

  const handleSuggestionClick = (item: {title: string, type: string}) => {
    setSearch(item.title);
    setIsSearchFocused(false);
    addToRecentSearches(item.title);
    if (item.type === 'Track') setActiveFilter('Tracks');
    if (item.type === 'Artist') setActiveFilter('Artists');
    if (item.type === 'NFT') setActiveFilter('NFTs');
    if (item.type === 'User') setActiveFilter('Users');
  };

  const filteredTracks = useMemo(() => {
    let results = [...MOCK_TRACKS];
    if (search) {
      results = results.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedGenre) {
      results = results.filter(t => t.genre.toLowerCase() === selectedGenre.toLowerCase());
    }
    
    // Advanced Filters for Tracks
    if (filters.minPrice) {
      results = results.filter(t => parseFloat(t.price || '0') >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(t => parseFloat(t.price || '0') <= parseFloat(filters.maxPrice));
    }
    if (filters.timeframe !== 'All Time') {
      const now = new Date();
      results = results.filter(t => {
        if (!t.releaseDate) return false;
        const releaseDate = new Date(t.releaseDate);
        const diffTime = Math.abs(now.getTime() - releaseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filters.timeframe === 'Last 24h') return diffDays <= 1;
        if (filters.timeframe === 'Last Week') return diffDays <= 7;
        if (filters.timeframe === 'Last Month') return diffDays <= 30;
        return true;
      });
    }

    if (sortBy === 'Popularity') {
      results.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (sortBy === 'Most Liked') {
      results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'Newest') {
      results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
    return results;
  }, [search, selectedGenre, filters, sortBy]);

  const filteredNFTs = useMemo(() => {
    let results = [...MOCK_NFTS];
    if (search) {
      results = results.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.creator.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Advanced Filters for NFTs
    if (filters.minPrice) {
      results = results.filter(n => parseFloat(n.price) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(n => parseFloat(n.price) <= parseFloat(filters.maxPrice));
    }
    if (filters.rarity !== 'All') {
      results = results.filter(n => 
        (n.traits?.some(attr => attr.trait_type === 'Rarity' && attr.value === filters.rarity)) ||
        (n.attributes?.some(attr => attr.trait_type === 'Rarity' && attr.value === filters.rarity))
      );
    }
    if (filters.editionType !== 'All') {
      results = results.filter(n => n.edition === filters.editionType);
    }
    if (filters.timeframe !== 'All Time') {
      const now = new Date();
      results = results.filter(n => {
        const mintedEvent = n.history?.find(h => h.event === 'Minted');
        if (!mintedEvent?.date) return false;
        const mintedDate = new Date(mintedEvent.date);
        const diffTime = Math.abs(now.getTime() - mintedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filters.timeframe === 'Last 24h') return diffDays <= 1;
        if (filters.timeframe === 'Last Week') return diffDays <= 7;
        if (filters.timeframe === 'Last Month') return diffDays <= 30;
        return true;
      });
    }

    if (sortBy === 'Price (High to Low)') {
      results.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'Price (Low to High)') {
      results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'Newest') {
      results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
    return results;
  }, [search, filters, sortBy]);

  const filteredResults = useMemo(() => {
    if (activeFilter === 'Tracks') return filteredTracks;
    if (activeFilter === 'NFTs') return filteredNFTs;
    
    let results: any[] = [];
    if (activeFilter === 'Artists') {
      results = allPlaylists;
      if (search) {
        results = results.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      }
    } else if (activeFilter === 'Users') {
      results = MOCK_USERS;
      if (search) {
        results = results.filter(u =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.handle.toLowerCase().includes(search.toLowerCase())
        );
      }
    }
    return results;
  }, [search, activeFilter, selectedGenre, sortBy, artists, allPlaylists]);

  const searchActions = useMemo(() => {
    const actions: any[] = [];
    if (!search) return [];

    // Tracks
    MOCK_TRACKS.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5).forEach(t => {
      actions.push({
        id: `track-${t.id}`,
        label: t.title,
        icon: <Music className="h-4 w-4 text-blue-500" />,
        description: t.artist,
        end: "Track",
        onClick: () => {
          playTrack(t);
          addToRecentSearches(search);
          navigate(`/track/${t.id}`);
        }
      });
    });

    // Artists
    artists.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).slice(0, 3).forEach(a => {
      actions.push({
        id: `artist-${a.id}`,
        label: a.name,
        icon: <User className="h-4 w-4 text-purple-500" />,
        description: "Artist",
        end: "Artist",
        onClick: () => {
          navigate(`/artist/${a.id}`);
          addToRecentSearches(search);
        }
      });
    });

    // NFTs
    MOCK_NFTS.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).slice(0, 3).forEach(n => {
      actions.push({
        id: `nft-${n.id}`,
        label: n.title,
        icon: <Gem className="h-4 w-4 text-amber-500" />,
        description: n.creator,
        end: "NFT",
        onClick: () => {
          navigate(`/nft/${n.id}`);
          addToRecentSearches(search);
        }
      });
    });

    return actions;
  }, [search, artists, playTrack, navigate]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, displayLimit);
  }, [filteredResults, displayLimit]);

  const handleGenreToggle = (genre: string) => {
    setDisplayLimit(INITIAL_LIMIT);
    if (selectedGenre === genre) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genre);
      addToRecentSearches(genre);
    }
  };

  const clearInput = () => {
    setSearch('');
    setSelectedGenre(null);
  };

  const FilterSortBar = ({ activeFilter, selectedGenre, sortBy, setSelectedGenre, setSortBy }: any) => {
    const sortOptions: Record<string, string[]> = {
      Tracks: ['Newest', 'Popularity', 'Most Liked'],
      Artists: ['Newest', 'Popularity'],
      NFTs: ['Newest', 'Price (High to Low)', 'Price (Low to High)'],
    };

    const currentSortOptions = sortOptions[activeFilter as keyof typeof sortOptions] || [];

    return (
      <div className="flex items-center gap-4 py-4 filter-section">
        {activeFilter !== 'NFTs' && activeFilter !== 'Playlists' && activeFilter !== 'Users' && (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`flex-shrink-0 px-[4px] py-[0px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                selectedGenre === null 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                  : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-foreground border-silver-300 dark:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 inactive-pill'
              }`}
            >
              All Genres
            </button>
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.name)}
                className={`flex-shrink-0 px-[4px] py-[0px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  selectedGenre === g.name 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                    : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-foreground border-silver-300 dark:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 inactive-pill'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
        {currentSortOptions.length > 0 && (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            {currentSortOptions.map(o => (
              <button
                key={o}
                onClick={() => setSortBy(o)}
                className={`flex-shrink-0 px-[4px] py-[0px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  sortBy === o 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                    : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-foreground border-silver-300 dark:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 inactive-pill'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleVoiceSearch = handleVoiceSearch;

  const handleSurpriseMe = () => {
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)].name;
    handleGenreToggle(randomGenre);
    addNotification(`Exploring ${randomGenre} sector`, "info");
  };

  return (
    <div className="w-full pb-4">
      {/* Search Section */}
      <div className="sticky top-0 lg:top-[var(--header-height,64px)] z-50 w-full bg-background/95 backdrop-blur-xl transition-all duration-300" ref={searchContainerRef}>
        <div className="max-w-7xl mx-auto px-4 lg:px-4 py-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 relative group w-full flex items-center gap-4">
                <div className="relative flex-1">
                  <DiscoverSearchBar 
                    onSearch={(q) => setSearch(q)}
                    placeholder="Search tracks, artists, or NFTs..."
                    actions={searchActions}
                    onVoiceSearch={toggleVoiceSearch}
                    isListening={isListening}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-4 md:pb-4 sticky top-[80px] z-40 bg-background/95 backdrop-blur-xl pt-2">
                <button 
                  onClick={handleSurpriseMe}
                  className="flex-shrink-0 px-[10px] py-[6px] bg-white dark:bg-muted/50 border border-silver-300 dark:border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-foreground hover:bg-blue-500/10 hover:border-blue-500/60 transition-all flex items-center gap-4 group/surprise inactive-pill"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 group-hover/surprise:animate-spin" />
                  Surprise Me
                </button>
                
                <div className="flex items-center gap-4">
                  {['All', 'Tracks', 'Artists', 'NFTs', 'Playlists', 'Users'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`flex-shrink-0 px-[10px] py-[6px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        activeFilter === filter
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg active-pill'
                          : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-foreground border-silver-300 dark:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 inactive-pill'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border/50 mt-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> Price Range (TON)
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                        className="w-full bg-muted/30 border border-border/50 rounded-lg p-2 text-xs focus:border-blue-500/50 outline-none"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                        className="w-full bg-muted/30 border border-border/50 rounded-lg p-2 text-xs focus:border-blue-500/50 outline-none"
                      />
                    </div>
                  </div>

                  {/* Rarity Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Award className="h-3 w-3" /> Rarity
                    </label>
                    <select 
                      value={filters.rarity}
                      onChange={(e) => setFilters({...filters, rarity: e.target.value})}
                      className="w-full bg-muted/30 border border-border/50 rounded-lg p-2 text-xs focus:border-blue-500/50 outline-none appearance-none"
                    >
                      <option value="All">All Rarities</option>
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>

                  {/* Edition Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Layers className="h-3 w-3" /> Edition Type
                    </label>
                    <select 
                      value={filters.editionType}
                      onChange={(e) => setFilters({...filters, editionType: e.target.value})}
                      className="w-full bg-muted/30 border border-border/50 rounded-lg p-2 text-xs focus:border-blue-500/50 outline-none appearance-none"
                    >
                      <option value="All">All Types</option>
                      <option value="Standard">Standard</option>
                      <option value="Limited">Limited</option>
                      <option value="Unique">Unique (1/1)</option>
                    </select>
                  </div>

                  {/* Timeframe */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Release Date
                    </label>
                    <select 
                      value={filters.timeframe}
                      onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
                      className="w-full bg-muted/30 border border-border/50 rounded-lg p-2 text-xs focus:border-blue-500/50 outline-none appearance-none"
                    >
                      <option value="All Time">All Time</option>
                      <option value="Last 24h">Last 24h</option>
                      <option value="Last Week">Last Week</option>
                      <option value="Last Month">Last Month</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pb-4">
                  <button 
                    onClick={() => setFilters({ minPrice: '', maxPrice: '', rarity: 'All', editionType: 'All', timeframe: 'All Time' })}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                  >
                    Clear Advanced Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6">
        {/* Recommendations Section (Visible when no search) */}
        {!search && !selectedGenre && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 animate-in fade-in duration-700"
          >
            <SearchCategorySection 
              title="Trending Tracks" 
              items={trendingTracks.slice(0, 5)}
              renderItem={(item) => <TrackCard track={item} className="border border-blue-500/30" />}
              viewAllLink="/explore/tracks?title=Trending Tracks"
              grid
            />

            <SearchCategorySection 
              title="Top Artists" 
              items={artists.slice(0, 5)}
              renderItem={(item) => <ArtistListItem artist={item} />}
              viewAllLink="/explore/artists?title=Top Artists"
            />

            <SearchCategorySection 
              title="Featured NFTs" 
              items={MOCK_NFTS.slice(0, 5)}
              renderItem={(item) => <NFTCard nft={item} />}
              viewAllLink="/explore/nfts?title=Featured NFTs"
              grid
            />
          </motion.section>
        )}

        {/* Search Results / Filtered View */}
        {(search || selectedGenre) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
              <div className="flex items-center gap-4">
                <button onClick={clearInput} className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95">
                  <RotateCcw className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-[20px] font-black text-foreground uppercase tracking-tighter leading-none mb-4">
                    {search ? `Results for "${search}"` : activeFilter !== 'All' ? activeFilter : 'Discover'}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{filteredResults.length} Signals Detected</p>
                  </div>
                </div>
              </div>
              {activeFilter !== 'All' && (
                <FilterSortBar activeFilter={activeFilter} selectedGenre={selectedGenre} sortBy={sortBy} setSelectedGenre={setSelectedGenre} setSortBy={setSortBy} />
              )}
            </div>
            
            {activeFilter === 'All' ? (
              <div className="space-y-4">
                {/* Tracks Section */}
                <SearchCategorySection 
                  title="Tracks" 
                  items={filteredTracks.slice(0, 10)}
                  renderItem={(item) => <TrackCard track={item} className="border border-blue-500/30" />}
                  viewAllLink={`/explore/tracks?title=Search Results: Tracks&search=${search}`}
                  grid
                  isEmpty={filteredTracks.length === 0}
                />

                {/* Artists Section */}
                <SearchCategorySection 
                  title="Artists" 
                  items={artists.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)}
                  renderItem={(item) => <ArtistListItem artist={item} />}
                  viewAllLink={`/explore/artists?title=Search Results: Artists&search=${search}`}
                  isEmpty={!artists.some(a => a.name.toLowerCase().includes(search.toLowerCase()))}
                />

                {/* NFTs Section */}
                <SearchCategorySection 
                  title="NFTs" 
                  items={filteredNFTs.slice(0, 5)}
                  renderItem={(item) => <NFTCard nft={item} />}
                  viewAllLink={`/explore/nfts?title=Search Results: NFTs&search=${search}`}
                  grid
                  isEmpty={filteredNFTs.length === 0}
                />

                {/* Playlists Section */}
                <SearchCategorySection 
                  title="Playlists" 
                  items={allPlaylists.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5)}
                  renderItem={(item) => <PlaylistListItem playlist={item} onClick={() => navigate(`/playlist/${item.id}`)} />}
                  viewAllLink={`/explore/playlists?title=Search Results: Playlists&search=${search}`}
                  isEmpty={!allPlaylists.some(p => p.title.toLowerCase().includes(search.toLowerCase()))}
                />

                {/* Users Section */}
                <SearchCategorySection 
                  title="Users" 
                  items={MOCK_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase())).slice(0, 5)}
                  renderItem={(item) => <UserCard user={item} />}
                  viewAllLink={`/explore/users?title=Search Results: Users&search=${search}`}
                  grid
                  isEmpty={!MOCK_USERS.some(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase()))}
                />
                
                {/* Empty State for "All" filter */}
                {filteredTracks.length === 0 &&
                 artists.every(a => !a.name.toLowerCase().includes(search.toLowerCase())) &&
                 filteredNFTs.length === 0 &&
                 allPlaylists.every(p => !p.title.toLowerCase().includes(search.toLowerCase())) &&
                 MOCK_USERS.every(u => !u.name.toLowerCase().includes(search.toLowerCase()) && !u.handle.toLowerCase().includes(search.toLowerCase())) && (
                  <div className="py-4 text-center flex flex-col items-center justify-center bg-muted/50 border border-border rounded-[10px]">
                    <Satellite className="h-12 w-12 text-foreground/5 mb-4 animate-pulse" />
                    <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">No signals detected in this sector</p>
                    <p className="text-muted-foreground/30 text-[10px] mt-4">Try broadening your search or clearing filters.</p>
                    <button onClick={clearInput} className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Reset Scanner</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {visibleResults.length > 0 ? (
                  <div className={`grid gap-4 ${activeFilter === 'Tracks' || activeFilter === 'Artists' || activeFilter === 'Playlists' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
                    {visibleResults.map((item, idx) => (
                      <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        {activeFilter === 'Tracks' && <TrackCard track={item as Track} variant="row" className="border border-blue-500/30" />}
                        {activeFilter === 'Artists' && <ArtistListItem artist={item as any} />}
                        {activeFilter === 'NFTs' && <NFTCard nft={item as any} />}
                        {activeFilter === 'Playlists' && <PlaylistListItem playlist={item as any} onClick={() => navigate(`/playlist/${item.id}`)} />}
                        {activeFilter === 'Users' && <UserCard user={item as any} />}
                      </div>
                    ))}
                    {visibleResults.length < filteredResults.length && (
                      <div ref={sentinelRef} className="col-span-full py-4 flex items-center justify-center">
                        <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center flex flex-col items-center justify-center bg-muted/50 border border-border rounded-[10px]">
                    <Satellite className="h-12 w-12 text-foreground/5 mb-4 animate-pulse" />
                    <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">No signals detected in this sector</p>
                    <p className="text-muted-foreground/30 text-[10px] mt-4">Try broadening your search or clearing filters.</p>
                    <button onClick={clearInput} className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Reset Scanner</button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const SearchCategorySection = ({ 
  title, 
  items, 
  renderItem, 
  viewAllLink, 
  grid = false,
  isEmpty = false
}: { 
  title: string; 
  items: any[]; 
  renderItem: (item: any) => React.ReactNode; 
  viewAllLink: string;
  grid?: boolean;
  isEmpty?: boolean;
}) => {
  const navigate = useNavigate();
  
  if (isEmpty) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
        <button 
          onClick={() => navigate(viewAllLink)}
          className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-4"
        >
          View All <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item, idx) => (
          <div key={item.id || idx} className={`flex-shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300 ${grid ? 'w-[200px] sm:w-[240px]' : 'w-full max-w-[400px]'}`} style={{ animationDelay: `${idx * 50}ms` }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Discover;
