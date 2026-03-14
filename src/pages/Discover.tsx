import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DiscoverSearchBar from '@/components/DiscoverSearchBar';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Music, User, Gem, RotateCcw, Satellite, ChevronRight, Sparkles } from 'lucide-react';

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [suggestions, setSuggestions] = useState<{id: string, title: string, type: string, subtitle?: string}[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const filteredResults = useMemo(() => {
    let results: any[] = [];
    if (activeFilter === 'Tracks') {
      results = [...MOCK_TRACKS];
      if (search) {
        results = results.filter(t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.artist.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (selectedGenre) {
        results = results.filter(t => t.genre.toLowerCase() === selectedGenre.toLowerCase());
      }
      if (sortBy === 'Popularity') {
        results.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
      } else if (sortBy === 'Most Liked') {
        results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (sortBy === 'Newest') {
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      }
    } else if (activeFilter === 'Artists') {
      results = [...artists];
      if (search) {
        results = results.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (selectedGenre) {
        results = results.filter(a => a.genre?.toLowerCase() === selectedGenre.toLowerCase());
      }
    } else if (activeFilter === 'NFTs') {
      results = MOCK_NFTS;
      if (search) {
        results = results.filter(n =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.creator.toLowerCase().includes(search.toLowerCase())
        );
      }
    } else if (activeFilter === 'Playlists') {
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

  const toggleVoiceSearch = () => {
    setIsListening(!isListening);
    if (!isListening) {
      addNotification("Listening for sonic signals...", "info");
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        const randomTerms = ['Synthwave', 'Neon Voyager', 'TON Top 50', 'Cyberpunk'];
        const term = randomTerms[Math.floor(Math.random() * randomTerms.length)];
        setSearch(term);
        addToRecentSearches(term);
        addNotification(`Detected: "${term}"`, "success");
      }, 2000);
    }
  };

  const handleSurpriseMe = () => {
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)].name;
    handleGenreToggle(randomGenre);
    addNotification(`Exploring ${randomGenre} sector`, "info");
  };

  return (
    <div className="w-full pb-32">
      {/* Search Section */}
      <div className="sticky top-[64px] z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50" ref={searchContainerRef}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 relative group w-full">
                <div className="relative w-full">
                  <DiscoverSearchBar 
                    onSearch={(q) => setSearch(q)}
                    placeholder="Search tracks, artists, or NFTs..."
                    actions={searchActions}
                    onVoiceSearch={toggleVoiceSearch}
                    isListening={isListening}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSurpriseMe}
                className="flex-shrink-0 px-3 py-1.5 bg-muted/50 border border-border rounded-full text-[8px] font-bold uppercase tracking-widest text-foreground hover:bg-muted hover:border-neutral-500/50 transition-all flex items-center gap-1.5 group/surprise"
              >
                <Sparkles className="h-3 w-3 text-amber-500 group-hover/surprise:animate-spin" />
                Surprise Me
              </button>
            </div>
            
            {/* Horizontal Filter Buttons */}
            <div className="w-full flex overflow-x-auto no-scrollbar gap-2 pb-2 justify-center">
              {[
                { id: 'All', icon: Sparkles },
                { id: 'Tracks', icon: Music },
                { id: 'Artists', icon: User },
                { id: 'NFTs', icon: Gem },
                { id: 'Playlists', icon: RotateCcw },
                { id: 'Users', icon: Satellite }
              ].map(filter => (
                <button 
                  key={filter.id} 
                  onClick={() => setActiveFilter(filter.id as any)} 
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 border ${
                    activeFilter === filter.id 
                      ? 'bg-blue-600 text-foreground border-neutral-500/50 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground hover:border-border/80'
                  }`}
                >
                  <filter.icon className={`h-3 w-3 ${activeFilter === filter.id ? 'text-foreground' : 'text-foreground/30'}`} />
                  {filter.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-16 mt-12">
        {/* Recommendations Section (Visible when no search) */}
        {!search && !selectedGenre && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 animate-in fade-in duration-700"
          >
            <SearchCategorySection 
              title="Trending Tracks" 
              items={trendingTracks.slice(0, 5)}
              renderItem={(item) => <TrackCard track={item} />}
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
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/50">
              <div className="flex items-center gap-6">
                <button onClick={clearInput} className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95">
                  <RotateCcw className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2">
                    {search ? `Results for "${search}"` : `Genre: ${selectedGenre}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{filteredResults.length} Signals Detected</p>
                  </div>
                </div>
              </div>
            </div>
            
            {activeFilter === 'All' ? (
              <div className="space-y-12">
                {/* Tracks Section */}
                <SearchCategorySection 
                  title="Tracks" 
                  items={MOCK_TRACKS.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase())).slice(0, 10)}
                  renderItem={(item) => <TrackCard track={item} />}
                  viewAllLink={`/explore/tracks?title=Search Results: Tracks&search=${search}`}
                  grid
                  isEmpty={!MOCK_TRACKS.some(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))}
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
                  items={MOCK_NFTS.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.creator.toLowerCase().includes(search.toLowerCase())).slice(0, 5)}
                  renderItem={(item) => <NFTCard nft={item} />}
                  viewAllLink={`/explore/nfts?title=Search Results: NFTs&search=${search}`}
                  grid
                  isEmpty={!MOCK_NFTS.some(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.creator.toLowerCase().includes(search.toLowerCase()))}
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
              </div>
            ) : (
              <>
                {visibleResults.length > 0 ? (
                  <div className={`grid gap-4 ${activeFilter === 'Tracks' || activeFilter === 'Artists' || activeFilter === 'Playlists' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
                    {visibleResults.map((item, idx) => (
                      <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        {activeFilter === 'Tracks' && <TrackCard track={item as Track} variant="row" />}
                        {activeFilter === 'Artists' && <ArtistListItem artist={item as any} />}
                        {activeFilter === 'NFTs' && <NFTCard nft={item as any} />}
                        {activeFilter === 'Playlists' && <PlaylistListItem playlist={item as any} onClick={() => navigate(`/playlist/${item.id}`)} />}
                        {activeFilter === 'Users' && <UserCard user={item as any} />}
                      </div>
                    ))}
                    {visibleResults.length < filteredResults.length && (
                      <div ref={sentinelRef} className="col-span-full py-12 flex items-center justify-center">
                        <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-24 text-center flex flex-col items-center justify-center bg-muted/50 border border-border rounded-[10px]">
                    <Satellite className="h-12 w-12 text-foreground/5 mb-4 animate-pulse" />
                    <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">No signals detected in this sector</p>
                    <button onClick={clearInput} className="mt-6 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Reset Scanner</button>
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
          className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          View All <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className={grid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
        {items.map((item, idx) => (
          <div key={item.id || idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Discover;
