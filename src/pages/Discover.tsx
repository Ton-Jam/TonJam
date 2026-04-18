import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Joyride } from 'react-joyride';
import { motion, AnimatePresence } from 'motion/react';
import { MagnifyingGlassIcon, XMarkIcon, MicrophoneIcon, PlayIcon, EllipsisVerticalIcon, CheckIcon } from '@heroicons/react/24/solid';
import { GENRES, MOODS } from '@/constants';
import NFTCard from '@/components/NFTCard';
import TrackCard from '@/components/TrackCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { SearchIcon, MicIcon, MicOffIcon } from 'lucide-react';

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

  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'nfts' | 'artists' | 'playlists' | 'users'>('all');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tonjam_search_history');
    return saved ? JSON.parse(saved) : [];
  });

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
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-24">
        <Joyride
        steps={[
          {
            target: '.discover-search-input',
            content: 'Use the search bar to find your favorite tracks, artists, or NFTs.',
          },
          {
            target: '.filter-buttons',
            content: 'Filter results by category.',
          }
        ]}
        run={isTourOpen}
        continuous
      />

      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Search Header */}
        <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 bg-background/95 backdrop-blur-3xl pt-6 pb-4 px-4 lg:px-8 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center">
            <div className="relative w-full flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/15 border border-white/10 rounded-full transition-all duration-300 shadow-xl overflow-hidden group">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <SearchIcon className="h-5 w-5 text-white/50 group-focus-within:text-cyan-400 transition-colors" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search artists, tracks, NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white h-12 pr-4 font-medium focus:outline-none transition-all discover-search-input placeholder:text-white/40 tracking-wide text-sm"
              />
              <div className="pr-2 flex items-center gap-1">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-2.5 rounded-full transition-all ${isVoiceSearchActive ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                  aria-label="Voice Search"
                >
                  {isVoiceSearchActive ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </form>

          <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar justify-start md:justify-center filter-buttons pb-1">
            {(['all', 'tracks', 'artists', 'nfts', 'users', 'playlists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeFilter === filter 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                    : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Adjust spacing since header is fixed */}
        <div className="pt-32" />

        {!searchQuery ? (
          <>
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recent searches</h2>
                  <button 
                    onClick={clearSearchHistory}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {searchHistory.map((term, idx) => (
                    <button
                      key={`history-${idx}`}
                      onClick={() => setSearchQuery(term)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium transition-colors group"
                    >
                      <span>{term}</span>
                      <XMarkIcon 
                        className="h-3 w-3 text-muted-foreground group-hover:text-foreground" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchHistory(prev => prev.filter(t => t !== term));
                        }}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Browse All Section */}
            <section className="mt-8">
              <h2 className="text-xl font-bold tracking-tight mb-6">Browse all</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {BROWSE_CATEGORIES.map((category) => (
                  <div 
                    key={category.id}
                    onClick={() => setSearchQuery(category.title)}
                    className={`${category.color} rounded-xl p-4 aspect-square relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}
                  >
                    <h3 className="text-white font-bold text-lg leading-tight break-words pr-4">{category.title}</h3>
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="absolute -bottom-2 -right-4 w-24 h-24 object-cover rotate-[25deg] shadow-2xl rounded-sm"
                    />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-8">
            {hasResults ? (
              <>
                {/* Top Result */}
                {(activeFilter === 'all' || activeFilter === 'artists') && filteredResults.artists.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Top result</h2>
                    <div 
                      onClick={() => navigate(`/artist/${filteredResults.artists[0].uid}`)}
                      className="max-w-md bg-white/5 border border-white/5 hover:bg-white/10 p-6 rounded-2xl cursor-pointer transition-all group"
                    >
                      <img 
                        src={filteredResults.artists[0].avatarUrl || getPlaceholderImage(filteredResults.artists[0].name)} 
                        alt="" 
                        className="w-24 h-24 rounded-full object-cover shadow-2xl mb-6"
                      />
                      <h3 className="text-3xl font-black tracking-tighter mb-2">{filteredResults.artists[0].name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Artist</span>
                        {filteredResults.artists[0].isVerifiedArtist && (
                          <div className="bg-blue-500 rounded-full p-0.5">
                            <CheckIcon className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Tracks */}
                {(activeFilter === 'all' || activeFilter === 'tracks') && filteredResults.tracks.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Songs</h2>
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

                {/* Artists Grid */}
                {(activeFilter === 'all' || activeFilter === 'artists') && filteredResults.artists.length > 1 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Artists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {filteredResults.artists.slice(activeFilter === 'all' ? 1 : 0).map((artist) => (
                        <div 
                          key={artist.uid}
                          onClick={() => navigate(`/artist/${artist.uid}`)}
                          className="bg-white/5 border border-white/5 hover:bg-white/10 p-4 rounded-2xl cursor-pointer transition-all text-center group"
                        >
                          <img 
                            src={artist.avatarUrl || getPlaceholderImage(artist.name)} 
                            alt="" 
                            className="w-full aspect-square rounded-full object-cover shadow-lg mb-4 group-hover:scale-105 transition-transform"
                          />
                          <h4 className="text-sm font-bold truncate">{artist.name}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Artist</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Users Grid */}
                {(activeFilter === 'all' || activeFilter === 'users') && filteredResults.users.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Users</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {filteredResults.users.map((u) => (
                        <div 
                          key={u.uid}
                          onClick={() => navigate(`/user/${u.uid}`)}
                          className="bg-white/5 border border-white/5 hover:bg-white/10 p-4 rounded-2xl cursor-pointer transition-all text-center group"
                        >
                          <img 
                            src={u.avatar || getPlaceholderImage(u.name)} 
                            alt="" 
                            className="w-full aspect-square rounded-full object-cover shadow-lg mb-4 group-hover:scale-105 transition-transform"
                          />
                          <h4 className="text-sm font-bold truncate">{u.name}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80">@{u.username}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* NFTs */}
                {(activeFilter === 'all' || activeFilter === 'nfts') && filteredResults.nfts.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-4">Marketplace NFTs</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredResults.nfts.map((nft) => (
                        <div key={nft.id} className="snap-start">
                          <NFTCard nft={nft} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <SearchIcon className="h-16 w-16 text-white/10" />
                <h3 className="text-xl font-bold tracking-tight text-white/80">No results found for "{searchQuery}"</h3>
                <p className="text-white/40 max-w-xs text-sm">Please check your spelling or try searching for something else.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
