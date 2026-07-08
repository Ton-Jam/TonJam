import React, { useState, useRef, useEffect } from 'react';
import { Search, Users, Sparkles, Hash, ArrowUpRight, Check, Plus, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Community, Artist } from '../types';
import { MOCK_COMMUNITIES, MOCK_ARTISTS } from '../mock';
import { useAudio } from '@/context/AudioContext';

interface JamSpaceHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onJoinCommunity?: (communityId: string) => void;
  joinedCommunityIds?: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export const JamSpaceHeader: React.FC<JamSpaceHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onJoinCommunity,
  joinedCommunityIds = [],
  activeCategory,
  setActiveCategory
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useAudio();

  // Static list of trending topics
  const trendingTopics = [
    { tag: '#TONGenesis', posts: '1.2k shared', category: 'All' },
    { tag: '#Amapiano', posts: '850 active', category: 'Amapiano' },
    { tag: '#TONNFT', posts: '430 minted', category: 'NFTs' },
    { tag: '#Synthwave', posts: '310 streaming', category: 'Electronic' },
    { tag: '#Afrobeats', posts: '1.4k vibes', category: 'Afrobeats' }
  ];

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter recommendations based on search
  const filteredCommunities = searchQuery.trim()
    ? MOCK_COMMUNITIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_COMMUNITIES.slice(0, 2); // Show top 2 when empty

  const filteredArtists = searchQuery.trim()
    ? MOCK_ARTISTS.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_ARTISTS.slice(0, 2); // Show top 2 when empty

  const filteredTopics = searchQuery.trim()
    ? trendingTopics.filter(t => t.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : trendingTopics;

  const hasResults = filteredCommunities.length > 0 || filteredArtists.length > 0 || filteredTopics.length > 0;

  const handleSelectTopic = (tag: string, category?: string) => {
    setSearchQuery(tag);
    if (category) {
      setActiveCategory(category);
    }
    setIsFocused(false);
    addNotification(`Scanning signal stream for ${tag}`, 'info');
  };

  const handleSelectArtist = (artist: Artist) => {
    setSearchQuery(artist.name);
    setIsFocused(false);
    addNotification(`Tuning receiver to ${artist.name}'s transmissions`, 'success');
  };

  const handleSelectCommunity = (community: Community) => {
    setSearchQuery(community.name);
    setIsFocused(false);
    addNotification(`Loading details for ${community.name}`, 'info');
  };

  return (
    <div className="w-full bg-slate-900/60 p-5 rounded-[12px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md z-30 relative">
      {/* JamSpace Status Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0052FF]/10 rounded-[10px] flex items-center justify-center text-[#0052FF] shrink-0">
          <Volume2 className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">JamSpace Signal Gate</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Decentralized Stream Selector</p>
        </div>
      </div>

      {/* Highly Interactive Search Bar Component with Auto-Suggestions Dropdown */}
      <div ref={containerRef} className="relative flex-1 max-w-lg w-full">
        <div className={`relative flex items-center bg-slate-950/80 rounded-[10px] transition-all duration-300 ${isFocused ? 'ring-2 ring-[#0052FF]' : ''}`}>
          <Search className="absolute left-4 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search communities, artists, or specific trending topics..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-11 pr-12 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                addNotification('Search filter cleared', 'info');
              }}
              className="absolute right-4 text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Suggestion dropdown overlay */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-slate-950 rounded-[10px] p-4 shadow-2xl z-50 overflow-hidden max-h-[380px] overflow-y-auto"
            >
              {searchQuery.trim() ? (
                <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-3">
                  Search Results for "{searchQuery}"
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-3">
                  🔥 Recommended for You
                </div>
              )}

              <div className="space-y-4">
                {/* 1. COMMUNITIES */}
                {filteredCommunities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#0052FF] mb-2 px-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Communities</span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredCommunities.map((community) => {
                        const isJoined = community.joined || joinedCommunityIds.includes(community.id);
                        return (
                          <div
                            key={community.id}
                            className="flex items-center justify-between p-2 rounded-[8px] hover:bg-slate-900/60 transition-colors cursor-pointer"
                            onClick={() => handleSelectCommunity(community)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={community.imageUrl}
                                alt={community.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-[6px] object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{community.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{community.memberCount.toLocaleString()} members</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onJoinCommunity) {
                                  onJoinCommunity(community.id);
                                }
                              }}
                              className={`ml-2 px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                isJoined
                                  ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  : 'bg-[#0052FF] text-white hover:bg-[#0052FF]/95'
                              }`}
                            >
                              {isJoined ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Joined</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Plus className="w-3 h-3" />
                                  <span>Join</span>
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ARTISTS */}
                {filteredArtists.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#0052FF] mb-2 px-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Artists</span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredArtists.map((artist) => (
                        <div
                          key={artist.id}
                          onClick={() => handleSelectArtist(artist)}
                          className="flex items-center justify-between p-2 rounded-[8px] hover:bg-slate-900/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs font-bold text-white truncate">{artist.name}</h4>
                                {artist.isVerified && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF] flex items-center justify-center text-[6px] font-bold text-white shrink-0">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{artist.genre} • {artist.followersCount.toLocaleString()} followers</p>
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 hover:text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TRENDING TOPICS */}
                {filteredTopics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#0052FF] mb-2 px-1">
                      <Hash className="w-3.5 h-3.5" />
                      <span>Trending Topics</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                      {filteredTopics.map((topic) => (
                        <div
                          key={topic.tag}
                          onClick={() => handleSelectTopic(topic.tag, topic.category)}
                          className="flex items-center justify-between p-2 rounded-[8px] hover:bg-slate-900/60 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white">{topic.tag}</div>
                            <div className="text-[9px] text-slate-500 font-mono tracking-wide uppercase">{topic.posts}</div>
                          </div>
                          <ArrowUpRight className="w-3 h-3 text-slate-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hasResults && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No communities, artists, or topics found for "{searchQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
