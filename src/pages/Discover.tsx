import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, History, Satellite, Bolt, ChevronRight, Filter, SlidersHorizontal, Music, User, Gem } from 'lucide-react';

import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import NFTCard from '@/components/NFTCard';
import SectionHeader from '@/components/SectionHeader';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const GENRES = ['Electronic', 'Synthwave', 'Ambient', 'Lofi', 'Pop', 'Hip Hop', 'Rock', 'Techno', 'House', 'Phonk', 'Experimental'];
const RECENT_SEARCHES_KEY = 'tonjam_recent_searches';
const INITIAL_LIMIT = 12;
const LOAD_MORE_COUNT = 12;
const TRACK_SORT_OPTIONS = ['Newest', 'Popularity', 'Most Liked'];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification, userTracks, userNFTs, artists } = useAudio();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<'Artists' | 'Tracks' | 'NFTs' | 'Playlists'>('Tracks');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [suggestions, setSuggestions] = useState<{id: string, title: string, type: string, subtitle?: string}[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + LOAD_MORE_COUNT);
  }, []);

  const sentinelRef = useInfiniteScroll(loadMore);

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
      results = [];
    }
    return results;
  }, [search, activeFilter, selectedGenre, sortBy, artists]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, displayLimit);
  }, [filteredResults, displayLimit]);

  const trendingNfts = useMemo(() => {
    return [...MOCK_NFTS]
      .sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
      .slice(0, 4);
  }, []);

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

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto pb-32">
      <div className="space-y-8">
        {/* Search & Filters */}
        <div className="space-y-6">
          <div className="relative" ref={searchContainerRef}>
            <div className="relative z-20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-4 w-4" />
              <input 
                type="text" 
                value={search} 
                onFocus={() => setIsSearchFocused(true)} 
                onChange={(e) => { setSearch(e.target.value); setDisplayLimit(INITIAL_LIMIT); }} 
                onKeyDown={(e) => { if (e.key === 'Enter') { addToRecentSearches(search); setIsSearchFocused(false); } }} 
                placeholder={`Search ${activeFilter.toLowerCase()}...`} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder:text-white/20 text-white" 
              />
              {search && (
                <button onClick={clearInput} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Suggestions / Recent Searches Overlay */}
            {isSearchFocused && (search.length > 1 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-3 z-50 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4">
                  {search.length > 1 && suggestions.length > 0 ? (
                     <>
                       <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-2">Suggestions</h3>
                       <div className="space-y-1">
                         {suggestions.map((item) => (
                           <div key={`${item.type}-${item.id}`} onClick={() => handleSuggestionClick(item)} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                             <div className="flex items-center gap-3">
                               {item.type === 'Track' && <Music className="h-4 w-4 text-blue-500" />}
                               {item.type === 'Artist' && <User className="h-4 w-4 text-purple-500" />}
                               {item.type === 'NFT' && <Gem className="h-4 w-4 text-amber-500" />}
                               <div>
                                 <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.title}</p>
                                 <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.type} • {item.subtitle}</p>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </>
                  ) : search.length > 1 && suggestions.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-xs">No matches found</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Recent Searches</h3>
                        <button onClick={clearRecentSearches} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Clear All</button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((term, idx) => (
                          <div key={idx} onClick={() => handleRecentSearchClick(term)} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                              <History className="h-4 w-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                              <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{term}</span>
                            </div>
                            <button onClick={(e) => removeRecentSearch(e, term)} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-all">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['Tracks', 'Artists', 'NFTs', 'Playlists'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => { setActiveFilter(filter as any); setDisplayLimit(INITIAL_LIMIT); }} 
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {activeFilter === 'Tracks' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <SlidersHorizontal className="h-3 w-3 text-white/20" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)} 
                    className="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer"
                  >
                    {TRACK_SORT_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-neutral-900">{opt}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Genre Chips */}
          {(activeFilter === 'Tracks' || activeFilter === 'Artists') && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setSelectedGenre(null)} 
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${ !selectedGenre ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20 hover:text-white/40' }`}
              >
                All Genres
              </button>
              {GENRES.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleGenreToggle(tag)} 
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${ selectedGenre === tag ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-white/20 hover:text-white/40' }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Section */}
        <section>
          <SectionHeader 
            title={search || selectedGenre ? `Results for "${search || selectedGenre}"` : `Explore ${activeFilter}`} 
          />
          
          {visibleResults.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
              {visibleResults.map((item, idx) => (
                <div key={item.id} className="min-w-[280px] sm:min-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  {activeFilter === 'Tracks' && <TrackCard track={item as Track} />}
                  {activeFilter === 'Artists' && <UserCard user={item as any} variant="portrait" />}
                  {activeFilter === 'NFTs' && <NFTCard nft={item as any} />}
                  {activeFilter === 'Playlists' && <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 text-[10px] font-bold uppercase tracking-widest text-center">Playlist UI coming soon</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl">
              <Satellite className="h-12 w-12 text-white/5 mb-4 animate-pulse" />
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">No signals detected in this sector</p>
              <button onClick={clearInput} className="mt-6 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Reset Scanner</button>
            </div>
          )}

          {visibleResults.length < filteredResults.length && (
            <div ref={sentinelRef} className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </section>

        {/* Trending Section */}
        {!search && !selectedGenre && (
          <section className="space-y-10 pt-10 border-t border-white/5">
            <div>
              <SectionHeader title="Trending NFTs" viewAllLink="/marketplace" />
              <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                {trendingNfts.map(nft => (
                  <div key={nft.id} className="min-w-[280px] sm:min-w-[320px]">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Discover;
