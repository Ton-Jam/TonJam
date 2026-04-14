import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Joyride } from 'react-joyride';
import { motion } from 'motion/react';
import { MagnifyingGlassIcon, XMarkIcon, MicrophoneIcon, PlayIcon, EllipsisVerticalIcon, CheckIcon } from '@heroicons/react/24/solid';
import { GENRES, MOCK_NFTS, MOODS } from '@/constants';
import NFTCard from '@/components/NFTCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';

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
    artists, 
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
    
    const nfts = MOCK_NFTS.filter(n => 
      query === '' || n.title.toLowerCase().includes(query) || 
      n.description.toLowerCase().includes(query)
    );
    
    const filteredArtists = artists.filter(a => 
      query === '' || a.name.toLowerCase().includes(query) || 
      (a.genre && a.genre.toLowerCase().includes(query))
    );

    return { tracks, nfts, artists: filteredArtists };
  }, [searchQuery, allTracks, artists]);

  const hasResults = filteredResults.tracks.length > 0 || 
                     filteredResults.nfts.length > 0 || 
                     filteredResults.artists.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToSearchHistory(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
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

      <div className="px-4 lg:px-8 py-6 space-y-8 pt-16">
        {/* Search Header */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-3xl pt-4 pb-4 px-4 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-black" />
            </div>
            <input
              type="text"
              placeholder="What do you want to play?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black h-12 pl-12 pr-24 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-white transition-all discover-search-input placeholder:text-black/60 shadow-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-black/60 hover:text-black rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-colors ${isVoiceSearchActive ? 'bg-red-500 text-white animate-pulse' : 'text-black/60 hover:text-black'}`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar justify-center filter-buttons">
            {(['all', 'nfts', 'tracks', 'artists', 'users', 'playlists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeFilter === filter 
                    ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

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
                          <div 
                            key={`${track.id}-${idx}`}
                            onClick={() => playTrack(track)}
                            className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-all"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img src={track.coverUrl || getPlaceholderImage(track.title)} alt="" className="w-full h-full object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                <PlayIcon className="h-5 w-5 fill-white text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                              <p className="text-[11px] text-white/50 truncate">{track.artist}</p>
                            </div>
                            <button className="p-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                          </div>
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

                {/* NFTs */}
                {(activeFilter === 'all' || activeFilter === 'nfts') && filteredResults.nfts.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold tracking-tight mb-4">Marketplace</h2>
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
                <MagnifyingGlassIcon className="h-16 w-16 text-muted-foreground/20" />
                <h3 className="text-xl font-bold tracking-tight">No results found for "{searchQuery}"</h3>
                <p className="text-muted-foreground max-w-xs">Please check your spelling or try searching for something else.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
