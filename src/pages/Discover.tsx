import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Joyride } from 'react-joyride';
import { motion } from 'motion/react';
import { Search, X, Mic, Play, MoreVertical, Check } from 'lucide-react';
import { GENRES, MOCK_NFTS } from '@/constants';
import NFTCard from '@/components/NFTCard';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    allTracks, 
    artists, 
    playTrack
  } = useAudio();

  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'nfts' | 'artists' | 'playlists' | 'users'>('all');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tonjam_search_history');
    return saved ? JSON.parse(saved) : [];
  });

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
    if (!searchQuery.trim()) return { tracks: [], nfts: [], artists: [] };

    const query = searchQuery.toLowerCase();
    const tracks = allTracks.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query)
    );
    const nfts = MOCK_NFTS.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.description.toLowerCase().includes(query)
    );
    const filteredArtists = artists.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.genre.toLowerCase().includes(query)
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
            target: '.browse-all-grid',
            content: 'Explore different genres and moods.',
          }
        ]}
        run={isTourOpen}
        continuous
      />

      <div className="px-4 lg:px-8 py-6 space-y-8 pt-16">
        {/* Search Header (Spotify Style) */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md pt-4 pb-4 px-4 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black h-12 pl-12 pr-12 rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all discover-search-input placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-black hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isVoiceSearchActive ? 'bg-red-500 text-white animate-pulse' : 'text-black hover:bg-neutral-200'}`}
            >
              <Mic className="h-5 w-5" />
            </button>
          </form>

          {searchQuery && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
              {(['all', 'tracks', 'nfts', 'artists', 'playlists', 'users'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeFilter === filter 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-foreground hover:bg-white/20'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
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
                      <X 
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

            {/* Browse All (Spotify Style) */}
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-6">Browse all</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 browse-all-grid">
                {GENRES.map((genre) => (
                  <motion.div
                    key={genre.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/explore/tracks?genre=${genre.name}`)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer p-4 bg-gradient-to-br ${genre.color} group`}
                  >
                    <h3 className="text-xl font-bold tracking-tight break-words pr-8">{genre.name}</h3>
                    <div className="absolute -bottom-2 -right-2 w-24 h-24 rotate-[25deg] translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300">
                      <img 
                        src={getPlaceholderImage(genre.name)} 
                        alt="" 
                        className="w-full h-full object-cover shadow-2xl rounded-sm"
                      />
                    </div>
                  </motion.div>
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
                    <h2 className="text-xl font-bold tracking-tight mb-4">Top result</h2>
                    <div 
                      onClick={() => navigate(`/artist/${filteredResults.artists[0].uid}`)}
                      className="max-w-md bg-white/5 hover:bg-white/10 p-5 rounded-lg cursor-pointer transition-colors group"
                    >
                      <img 
                        src={filteredResults.artists[0].avatarUrl || getPlaceholderImage(filteredResults.artists[0].name)} 
                        alt="" 
                        className="w-24 h-24 rounded-full object-cover shadow-2xl mb-4"
                      />
                      <h3 className="text-2xl font-bold tracking-tight mb-1">{filteredResults.artists[0].name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Artist</span>
                        {filteredResults.artists[0].isVerifiedArtist && (
                          <div className="bg-blue-500 rounded-full p-0.5">
                            <Check className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Tracks */}
                {(activeFilter === 'all' || activeFilter === 'tracks') && filteredResults.tracks.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold tracking-tight mb-4">Songs</h2>
                    <div className="space-y-1">
                      {filteredResults.tracks.slice(0, activeFilter === 'all' ? 4 : undefined).map((track) => (
                        <div 
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-md cursor-pointer group transition-colors"
                        >
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <img src={track.coverUrl || getPlaceholderImage(track.title)} alt="" className="w-full h-full object-cover rounded" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="h-4 w-4 fill-white text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate text-white">{track.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <button className="p-2 text-white hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists Grid */}
                {(activeFilter === 'all' || activeFilter === 'artists') && filteredResults.artists.length > 1 && (
                  <section>
                    <h2 className="text-xl font-bold tracking-tight mb-4">Artists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredResults.artists.slice(activeFilter === 'all' ? 1 : 0).map((artist) => (
                        <div 
                          key={artist.uid}
                          onClick={() => navigate(`/artist/${artist.uid}`)}
                          className="bg-white/5 hover:bg-white/10 p-4 rounded-lg cursor-pointer transition-colors text-center group"
                        >
                          <img 
                            src={artist.avatarUrl || getPlaceholderImage(artist.name)} 
                            alt="" 
                            className="w-full aspect-square rounded-full object-cover shadow-lg mb-4 group-hover:scale-105 transition-transform"
                          />
                          <h4 className="text-sm font-bold truncate">{artist.name}</h4>
                          <p className="text-xs text-muted-foreground">Artist</p>
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
                <Search className="h-16 w-16 text-muted-foreground/20" />
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
