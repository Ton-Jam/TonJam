import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS } from '../constants';
import TrackCard from '../components/TrackCard';
import UserCard from '../components/UserCard';
import NFTCard from '../components/NFTCard';
import { semanticSearchTracks } from '../services/geminiService';
import { Track } from '../types';
import { useAudio } from '../context/AudioContext';

const GENRES = ['Electronic', 'Synthwave', 'Ambient', 'Lofi', 'Pop', 'Hip Hop', 'Rock', 'Techno', 'House', 'Phonk', 'Experimental'];
const VIBE_CHIPS = ['Night Drive', 'Cyberpunk', 'Focus', 'After-Hours', 'Neural Chill', 'Glitch-Hop', 'Distopian', 'Hyperpop', 'Basement Techno'];
const RECENT_SEARCHES_KEY = 'tonjam_recent_searches';
const INITIAL_LIMIT = 12;

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useAudio();
  
  // Initialize state from URL if present
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialVibe = queryParams.get('vibe') === 'true';

  const [search, setSearch] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<'Artists' | 'Tracks' | 'NFTs' | 'Playlists'>('Tracks');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const filteredResults = useMemo(() => {
    let results: any[] = [];

    if (activeFilter === 'Tracks') {
      results = MOCK_TRACKS;
      if (search) {
        results = results.filter(t => 
          t.title.toLowerCase().includes(search.toLowerCase()) || 
          t.artist.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (selectedGenre) {
        results = results.filter(t => t.genre.toLowerCase() === selectedGenre.toLowerCase());
      }
    } else if (activeFilter === 'Artists') {
      results = MOCK_ARTISTS;
      if (search) {
        results = results.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
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
      // Mocking playlists for search since we don't have a global playlist constant
      results = [];
    }

    return results;
  }, [search, activeFilter, selectedGenre]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, displayLimit);
  }, [filteredResults, displayLimit]);

  const nftTrackRecommendations = useMemo(() => {
    return MOCK_NFTS.slice(0, 6);
  }, []);

  const featuredNFTTracks = useMemo(() => {
    // Specifically pick 4 NFT tracks as requested
    return MOCK_NFTS.slice(0, 4);
  }, []);

  const trendingNfts = useMemo(() => {
    return [...MOCK_NFTS]
      .sort((a, b) => {
        const offersA = a.offers?.length || 0;
        const offersB = b.offers?.length || 0;
        if (offersB !== offersA) return offersB - offersA;
        return parseFloat(b.price) - parseFloat(a.price);
      })
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

  const SectionHeader = ({ title, onAction }: { title: string, onAction?: () => void }) => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black tracking-tighter uppercase text-white flex items-center gap-3 leading-none">
        <i className="fas fa-bolt text-blue-400 text-xs"></i>
        {title}
      </h2>
      {onAction && (
        <button 
          onClick={onAction}
          className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors"
        >
          View All
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 bg-black min-h-screen">
      <div className="px-4 md:px-12 mb-6 pt-6">
        {/* GENRE CHIPS - At the very top */}
        {activeFilter === 'Tracks' && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
              <button 
                onClick={() => setSelectedGenre(null)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                  !selectedGenre 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                All Signals
              </button>
              {GENRES.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleGenreToggle(tag)} 
                  className={`flex-shrink-0 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                    selectedGenre === tag 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* SEARCH BAR */}
        <div className="relative mb-4" ref={searchContainerRef}>
          <div className="relative z-20">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
            <input 
              type="text" 
              value={search}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setDisplayLimit(INITIAL_LIMIT);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addToRecentSearches(search);
                  setIsSearchFocused(false);
                }
              }}
              placeholder={`Search ${activeFilter.toLowerCase()}...`} 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-xs outline-none transition-all placeholder:text-white/20 shadow-inner shadow-black/20 text-white focus:border-blue-500/50"
            />
            {search && (
              <button 
                onClick={clearInput}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/20 hover:text-white transition-colors"
              >
                <i className="fas fa-times-circle text-xs"></i>
              </button>
            )}
          </div>

          {/* Recent Search Overlay */}
          {isSearchFocused && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 z-50 bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-3xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5 px-2">
                  <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em]">Relay Logs</h3>
                  <button onClick={clearRecentSearches} className="text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest border-b border-blue-500/20 pb-0.5">Purge Archives</button>
                </div>
                <div className="space-y-1.5">
                  {recentSearches.map((term, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleRecentSearchClick(term)}
                      className="flex items-center justify-between group p-4 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                          <i className="fas fa-history text-xs"></i>
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-tight text-white/60 group-hover:text-white">{term}</span>
                      </div>
                      <button onClick={(e) => removeRecentSearch(e, term)} className="opacity-0 group-hover:opacity-100 p-3 text-white/10 hover:text-red-500 transition-all transform hover:scale-110">
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENTITY FILTER */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Artists', 'Tracks', 'NFTs', 'Playlists'].map(filter => (
            <button 
              key={filter}
              onClick={() => {
                setActiveFilter(filter as any);
                setDisplayLimit(INITIAL_LIMIT);
              }}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-white text-black shadow-sm' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        <section className="px-4 md:px-12">
          <SectionHeader 
            title={search || selectedGenre ? `Scanner Output: ${search || selectedGenre}` : `Network ${activeFilter}`} 
            onAction={() => navigate(`/explore/${activeFilter.toLowerCase()}?title=${encodeURIComponent(search || selectedGenre || `Network ${activeFilter}`)}`)}
          />
          
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
            {visibleResults.length > 0 ? (
              visibleResults.map((item, idx) => (
                <div key={item.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  {activeFilter === 'Tracks' && <TrackCard track={item as Track} />}
                  {activeFilter === 'Artists' && <UserCard user={item as any} variant="portrait" />}
                  {activeFilter === 'NFTs' && <NFTCard nft={item as any} />}
                  {activeFilter === 'Playlists' && <div className="p-4 glass rounded-xl text-white/50 text-xs">Playlist rendering...</div>}
                </div>
              ))
            ) : (
              <div className="w-full py-20 text-center flex flex-col items-center glass rounded-xl border border-dashed border-white/10 bg-[#050505]/50">
                 <i className="fas fa-satellite-dish text-4xl text-white/5 mb-4 animate-pulse"></i>
                 <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] px-8 leading-relaxed text-center">Protocol Mismatch. Zero signals detected.</p>
                 <button onClick={clearInput} className="mt-6 text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] border-b border-blue-500/20 pb-1">Reset Filters</button>
              </div>
            )}
          </div>
        </section>

        {/* Trending Protocols - Horizontal Scroll */}
        <section className="px-4 md:px-12">
          <SectionHeader title="Trending Protocols" onAction={() => navigate('/marketplace')} />
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
            {trendingNfts.map((nft, idx) => (
              <div key={nft.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <NFTCard nft={nft} />
              </div>
            ))}
          </div>
        </section>

        {/* Recommended NFT Frequencies - Horizontal Scroll */}
        <section className="px-4 md:px-12">
          <SectionHeader title="Recommended NFT Frequencies" />
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 mask-linear-fade">
            {featuredNFTTracks.map((nft, idx) => (
              <div key={nft.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <NFTCard nft={nft} />
              </div>
            ))}
          </div>
        </section>

        {/* Alpha Collectibles - Horizontal Scroll */}
        <section className="px-4 md:px-12">
          <SectionHeader title="Alpha Collectibles" onAction={() => navigate('/explore/nfts?title=Alpha%20Collectibles')} />
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mask-linear-fade">
            {nftTrackRecommendations.map((nft, idx) => (
              <div key={nft.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <NFTCard nft={nft} isAuction={nft.id === 'n1'} />
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 md:px-12">
          <div className="glass p-12 rounded-[3rem] border border-blue-500/20 relative overflow-hidden group shadow-[0_0_80px_rgba(37,99,235,0.05)]">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.6em]">Genesis Mainnet</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">The NFT Revolution</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black max-w-md">Holders gain access to private neural syncs, VIP stem archives, and direct artist royalties.</p>
              </div>
              <button 
                onClick={() => navigate('/marketplace')}
                className="px-14 py-6 electric-blue-bg text-white font-black uppercase text-[11px] tracking-widest rounded-2xl active:scale-95 transition-all shadow-2xl shadow-blue-500/40 border border-white/10"
              >
                Enter Marketplace
              </button>
            </div>
          </div>
        </section>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default Discover;