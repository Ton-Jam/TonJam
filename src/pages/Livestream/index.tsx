import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Users, 
  Coins, 
  Sparkles, 
  Crown, 
  Flame, 
  Music, 
  Tv, 
  Plus, 
  Search, 
  Filter,
  Play,
  Award,
  Zap,
  Calendar,
  Disc3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LiveStreamSession, StreamCategory } from '@/types/livestream';
import { getActiveLiveStreams } from '@/services/livestreamService';
import { motion } from 'motion/react';

export const LivestreamHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [streams, setStreams] = useState<LiveStreamSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActiveLiveStreams().then((data) => {
      setStreams(data);
      setIsLoading(false);
    });
  }, []);

  const categories = [
    'All',
    'DJ Set',
    'Live Performance',
    'Studio Jam',
    'Beat Making',
    'Acoustic Lounge',
    'NFT Drop'
  ];

  const filteredStreams = streams.filter((stream) => {
    const matchesCategory = selectedCategory === 'All' || stream.category === selectedCategory;
    const matchesSearch = 
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredStream = streams[0];

  return (
    <div className="min-h-screen bg-[#040812] text-white p-4 sm:p-6 lg:p-8 pb-28">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title & Go Live CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                Live Broadcasts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TonJam Live Stages
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Experience real-time music streams, tip artists in TON, and unlock NFT holder privileges
            </p>
          </div>

          <button
            onClick={() => navigate('/live-studio')}
            className="px-5 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Radio className="w-4 h-4" />
            <span>Go Live / Broadcast</span>
          </button>
        </div>

        {/* Featured Live Showcase Banner */}
        {featuredStream && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d162d] to-[#12102e] shadow-2xl group">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 space-y-4 z-10">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Featured Live
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-300 font-bold bg-black/40 px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 text-[#00B4D8]" />
                    <span>{featuredStream.viewerCount.toLocaleString()} Viewers</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {featuredStream.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                  {featuredStream.description}
                </p>

                {/* Artist & Track Info */}
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={featuredStream.artistAvatar}
                    alt={featuredStream.artistName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#00B4D8]/50"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{featuredStream.artistName}</span>
                      <span className="text-[10px] text-[#00B4D8] font-semibold">Verified</span>
                    </p>
                    {featuredStream.currentSongPlaying && (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Music className="w-3 h-3 text-purple-400" />
                        <span>{featuredStream.currentSongPlaying.title}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Watch Now Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/live/${featuredStream.id}`)}
                    className="px-6 py-3 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#00B4D8]/20"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Join Stage & Chat</span>
                  </button>

                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-3 py-2 rounded-xl">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{featuredStream.totalTipsTon} TON Tipped</span>
                  </span>
                </div>
              </div>

              {/* Right Media Preview Column */}
              <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full min-h-[320px] overflow-hidden">
                <img
                  src={featuredStream.thumbnailUrl}
                  alt={featuredStream.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d162d] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0d162d] lg:via-transparent lg:to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#00B4D8] text-black font-black'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search stream or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
              />
            </div>
          </div>
        </div>

        {/* Active Streams Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              <span>Live Now ({filteredStreams.length})</span>
            </h3>
          </div>

          {filteredStreams.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] text-zinc-400">
              <p className="text-sm">No live streams found matching your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStreams.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/live/${item.id}`)}
                  className="rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group shadow-xl flex flex-col"
                >
                  {/* Thumbnail Stage */}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600/90 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>

                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-200 text-[10px] font-bold">
                        <Users className="w-3 h-3 text-[#00B4D8]" />
                        <span>{item.viewerCount.toLocaleString()}</span>
                      </span>
                    </div>

                    {/* Category Label */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00B4D8] transition-colors line-clamp-1">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.artistAvatar}
                          alt={item.artistName}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-200 truncate">
                            {item.artistName}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">{item.artistHandle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Stats: Current track & Tips */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 flex items-center gap-1 truncate max-w-[60%]">
                        <Music className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{item.currentSongPlaying?.title || 'Live Performance'}</span>
                      </span>

                      <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
                        <Coins className="w-3 h-3" />
                        <span>{item.totalTipsTon} TON</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
