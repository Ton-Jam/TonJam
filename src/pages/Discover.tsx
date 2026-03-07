import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, History, Satellite, Bolt, ChevronRight, Filter, SlidersHorizontal, Music, User, Gem, Play, Disc, Sparkles, Globe, Mic, TrendingUp, RotateCcw } from 'lucide-react';

import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, APP_LOGO, GENRES, CURATED_PLAYLISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import ArtistCard from '@/components/ArtistCard';
import NFTCard from '@/components/NFTCard';
import GenreCard from '@/components/GenreCard';
import SectionHeader from '@/components/SectionHeader';
import PlaylistCard from '@/components/PlaylistCard';
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
  const { addNotification, artists, getTrendingTracks, getTopNFTTracks, allPlaylists, searchQuery: search, setSearchQuery: setSearch } = useAudio();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [activeFilter, setActiveFilter] = useState<'Artists' | 'Tracks' | 'NFTs' | 'Playlists'>('Tracks');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
      results = allPlaylists;
      if (search) {
        results = results.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      }
    }
    return results;
  }, [search, activeFilter, selectedGenre, sortBy, artists, allPlaylists]);

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
    <div className="p-4 lg:p-6 space-y-12 w-full pb-32">
      {/* Hero Search Section */}
      <div className="relative py-12 px-6 rounded-[10px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase mb-4 leading-none">
            Discover <span className="text-blue-500">Sonic</span> Signals
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-8">
            Decentralized Music Discovery Engine v2.6
          </p>

          <div className="relative" ref={searchContainerRef}>
            <div className="relative z-20 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-4 w-4" />
                <input 
                  type="text" 
                  value={search} 
                  onFocus={() => setIsSearchFocused(true)} 
                  onChange={(e) => { setSearch(e.target.value); setDisplayLimit(INITIAL_LIMIT); }} 
                  onKeyDown={(e) => { if (e.key === 'Enter') { addToRecentSearches(search); setIsSearchFocused(false); } }} 
                  placeholder="Search tracks, artists, or NFTs..." 
                  className={`w-full bg-white/5 border border-white/10 rounded-[10px] py-5 pl-12 pr-12 text-base outline-none transition-all placeholder:text-white/10 text-white backdrop-blur-xl ${isSearchFocused ? 'bg-white/10 border-blue-500/50 ring-4 ring-blue-500/10' : ''}`} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {search && (
                    <button onClick={clearInput} className="text-white/20 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={toggleVoiceSearch} 
                    className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-5 rounded-[10px] border transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Advanced Filters Drawer (Simulated) */}
            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-3 z-40 bg-[#0A0A0A] border border-white/10 rounded-[10px] p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sort By</h4>
                    <div className="flex flex-wrap gap-2">
                      {TRACK_SORT_OPTIONS.map(option => (
                        <button 
                          key={option} 
                          onClick={() => setSortBy(option)}
                          className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${sortBy === option ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">BPM Range</h4>
                    <div className="flex items-center gap-4">
                      <div className="h-1 flex-1 bg-white/5 rounded-full relative">
                        <div className="absolute left-1/4 right-1/4 top-0 bottom-0 bg-blue-500 rounded-full"></div>
                        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500"></div>
                        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500"></div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">80-140</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Vibe</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Chill', 'Energetic', 'Dark', 'Euphoric'].map(vibe => (
                        <button key={vibe} className="px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-white/5 text-white/40 hover:text-white transition-all">
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions Overlay */}
            {isSearchFocused && (search.length > 1 || recentSearches.length > 0 || search.length === 0) && (
              <div className="absolute top-full left-0 right-0 mt-3 z-50 bg-[#0A0A0A] border border-white/10 rounded-[10px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4">
                  {search.length > 1 && suggestions.length > 0 ? (
                     <>
                       <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-2">Suggestions</h3>
                       <div className="space-y-1">
                         {suggestions.map((item) => (
                           <div key={`${item.type}-${item.id}`} onClick={() => handleSuggestionClick(item)} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-[10px] cursor-pointer transition-all">
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
                  ) : search.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                      <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Recent Searches</h3>
                          {recentSearches.length > 0 && (
                            <button onClick={clearRecentSearches} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Clear All</button>
                          )}
                        </div>
                        {recentSearches.length > 0 ? (
                          <div className="space-y-1">
                            {recentSearches.map((term, idx) => (
                              <div key={idx} onClick={() => handleRecentSearchClick(term)} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-[10px] cursor-pointer transition-all">
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
                        ) : (
                          <p className="px-2 py-4 text-[10px] text-white/10 uppercase tracking-widest italic">No recent history</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 px-2">Trending Searches</h3>
                        <div className="space-y-1">
                          {['Synthwave', 'Neon Voyager', 'TON Top 50', 'Cyberpunk'].map((term, idx) => (
                            <div key={idx} onClick={() => handleRecentSearchClick(term)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-[10px] cursor-pointer transition-all group">
                              <TrendingUp className="h-4 w-4 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
                              <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{term}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discovery Hub */}
      {!search && !selectedGenre && (
        <>
          {/* Curated Playlists */}
          <section>
            <SectionHeader title="Curated Playlists" viewAllLink="/explore/playlists?title=Curated Playlists&filter=curated" />
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
              {CURATED_PLAYLISTS.map(playlist => (
                <div key={playlist.id} className="flex-shrink-0 w-64 md:w-72">
                  <PlaylistCard playlist={playlist} onClick={() => navigate(`/library`)} />
                </div>
              ))}
            </div>
          </section>

          {/* Trending Tracks */}
          <section>
            <SectionHeader title="Trending Now" subtitle="Most streamed tracks on TON" viewAllLink="/explore/tracks?title=Trending Now&filter=trending" />
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
              {trendingTracks.map(track => (
                <div key={track.id} className="flex-shrink-0 w-40 sm:w-48">
                  <TrackCard track={track} />
                </div>
              ))}
            </div>
          </section>

          {/* Genre Exploration Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader title="Explore Genres" className="mb-0" />
              <button 
                onClick={handleSurpriseMe}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
              >
                <RotateCcw className="h-3 w-3" />
                Surprise Me
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {GENRES.map(genre => (
                <GenreCard 
                  key={genre.id} 
                  genre={genre} 
                  onClick={() => handleGenreToggle(genre.name)}
                  isSelected={selectedGenre === genre.name}
                />
              ))}
            </div>
          </section>

          {/* Top NFT Sales */}
          <section>
            <SectionHeader title="Top NFT Sales" subtitle="Highest valued music artifacts" viewAllLink="/explore/nfts?title=Top NFT Sales&filter=top_nfts" />
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
              {topNFTTracks.map(track => (
                <div key={track.id} className="flex-shrink-0 w-40 sm:w-48">
                  <TrackCard track={track} />
                </div>
              ))}
            </div>
          </section>

          {/* Decentralized Library Info */}
          <section className="glass border border-blue-500/10 bg-white/[0.02] p-8 rounded-[10px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Globe className="h-16 w-16 text-blue-500" /></div>
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Decentralized Storage Active</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                TonJam indexes music NFTs directly from the TON blockchain. All audio files and metadata are stored on decentralized protocols like IPFS and Arweave, ensuring your music remains censorship-resistant and permanently accessible.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">IPFS Node Connected</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">TON Indexer Syncing</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Search Results / Filtered View */}
      {(search || selectedGenre) && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={clearInput} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
                  {search ? `Results for "${search}"` : `Genre: ${selectedGenre}`}
                </h2>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{filteredResults.length} Signals Detected</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {['Tracks', 'Artists', 'NFTs', 'Playlists'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter as any)} 
                  className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          {visibleResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {visibleResults.map((item, idx) => (
                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  {activeFilter === 'Tracks' && <TrackCard track={item as Track} />}
                  {activeFilter === 'Artists' && <ArtistCard artist={item as any} />}
                  {activeFilter === 'NFTs' && <NFTCard nft={item as any} />}
                  {activeFilter === 'Playlists' && <PlaylistCard playlist={item as any} onClick={() => navigate('/library')} />}
                </div>
              ))}
              {visibleResults.length < filteredResults.length && (
                <div ref={sentinelRef} className="col-span-full py-12 flex items-center justify-center">
                  <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[10px]">
              <Satellite className="h-12 w-12 text-white/5 mb-4 animate-pulse" />
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">No signals detected in this sector</p>
              <button onClick={clearInput} className="mt-6 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Reset Scanner</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Discover;
