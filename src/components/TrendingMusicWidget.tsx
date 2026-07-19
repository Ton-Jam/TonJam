import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Sparkles, 
  Play, 
  Pause, 
  RefreshCw, 
  HelpCircle, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  ChevronRight,
  Tv
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { toast } from 'sonner';

interface AnalyzedTrack {
  id: string;
  title: string;
  artist: string;
  trendScore: number;
  genre: string;
  change: string;
  streams: string;
  reason: string;
}

interface TrendingMusicWidgetProps {
  className?: string;
}

export const TrendingMusicWidget: React.FC<TrendingMusicWidgetProps> = ({ className = '' }) => {
  const { allTracks = [], playTrack, currentTrack, isPlaying } = useAudio();
  const [tracks, setTracks] = useState<AnalyzedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  const fetchTrendingMusic = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/trending-music-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch trending music');
      }
      const data = await response.json();
      setTracks(data.tracks || []);
      
      if (isRefresh) {
        toast.success('Gemini analysis updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to perform real-time trend analysis. Displaying cached trends.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingMusic();
  }, []);

  // Helper to find a matching audio track in the local catalog to enable real playback!
  const getMatchedAudioTrack = (analyzedTitle: string, analyzedArtist: string): Track | null => {
    if (!allTracks || allTracks.length === 0) return null;
    
    // Attempt strict matching first
    const titleLower = analyzedTitle.toLowerCase();
    const artistLower = analyzedArtist.toLowerCase();
    
    let match = allTracks.find(t => 
      t.title.toLowerCase().includes(titleLower) || 
      titleLower.includes(t.title.toLowerCase())
    );

    if (!match) {
      match = allTracks.find(t => 
        t.artist.toLowerCase().includes(artistLower) || 
        artistLower.includes(t.artist.toLowerCase())
      );
    }

    // If still no match, fallback to index-based track or random
    return match || null;
  };

  const handlePlayToggle = (analyzedTrack: AnalyzedTrack, index: number) => {
    const matched = getMatchedAudioTrack(analyzedTrack.title, analyzedTrack.artist);
    if (matched) {
      playTrack(matched);
      toast.success(`Playing matching track: ${matched.title}`);
    } else {
      // If there are any playable tracks at all, play one as a preview
      if (allTracks && allTracks.length > 0) {
        const fallbackTrack = allTracks[index % allTracks.length];
        playTrack(fallbackTrack);
        toast.info(`No exact on-chain match. Playing catalog preview: ${fallbackTrack.title}`);
      } else {
        toast.error('No playable tracks loaded in current catalog');
      }
    }
  };

  const toggleExpand = (trackId: string) => {
    setExpandedTrackId(prev => (prev === trackId ? null : trackId));
  };

  // Helper to select cover/avatar illustration based on genre
  const getCoverPlaceholder = (genre: string, index: number) => {
    const covers = [
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=150"
    ];
    return covers[index % covers.length];
  };

  if (loading) {
    return (
      <div className={`bg-slate-950/40 backdrop-blur-md rounded-3xl p-6 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0098EA]/20 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-8 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/[0.01] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 w-2/3">
                <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                  <div className="h-2.5 w-1/3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-12 h-6 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950/40 backdrop-blur-md rounded-3xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 uppercase font-sans">
              Trending Music Analyzer
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase">AI Web3 & TON ecosystem trend analytics</p>
          </div>
        </div>

        <button
          onClick={() => fetchTrendingMusic(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {tracks.map((track, idx) => {
          const matched = getMatchedAudioTrack(track.title, track.artist);
          const isCurrentPlayable = matched && currentTrack?.id === matched.id;
          const isTrackCurrentlyPlaying = isCurrentPlayable && isPlaying;
          const isExpanded = expandedTrackId === track.id;

          return (
            <div
              key={track.id}
              className={`bg-white/[0.015] hover:bg-white/[0.035] rounded-2xl transition-all duration-300 overflow-hidden ${
                isExpanded ? 'ring-1 ring-indigo-500/20' : ''
              }`}
            >
              {/* Main row */}
              <div className="p-4 flex items-center justify-between gap-4">
                {/* Left block: rank, cover, title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Rank identifier */}
                  <span className="font-mono font-black text-xs text-slate-500 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Album Cover with Play Hover overlay */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden group shrink-0 shadow-md">
                    <img
                      src={getCoverPlaceholder(track.genre, idx)}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayToggle(track, idx);
                        }}
                        className="p-1.5 bg-[#0098EA] text-white rounded-lg transition-transform hover:scale-105 cursor-pointer"
                      >
                        {isTrackCurrentlyPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate leading-snug">
                        {track.title}
                      </h4>
                      {track.trendScore > 92 && (
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate font-medium">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Right block: score indicator, metrics & expand toggle */}
                <div className="flex items-center gap-4 shrink-0 font-mono text-right">
                  {/* Trend Score Progress Ring/Bar */}
                  <div className="hidden sm:block">
                    <div className="text-[10px] text-indigo-400 font-bold mb-1">
                      {track.trendScore}% Vibe
                    </div>
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-[#0098EA]" 
                        style={{ width: `${track.trendScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats & Rank Badges */}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                      {track.change}
                    </span>
                    <span className="text-[8px] text-slate-500 font-medium">
                      {track.streams}
                    </span>
                  </div>

                  {/* Expand button */}
                  <button
                    onClick={() => toggleExpand(track.id)}
                    className="p-1.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="AI Insights"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expansion Details: Gemini Insights */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-11 pb-4 pt-1 bg-white/[0.01] text-xs space-y-2.5">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-black uppercase tracking-widest text-[8px] font-mono">
                        <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                        AI Analysis
                      </div>
                      
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {track.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 bg-transparent">
                        <span className="px-2 py-0.5 bg-white/[0.03] text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest font-mono">
                          Genre: {track.genre}
                        </span>
                        {matched ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-widest font-mono flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            Stream Match Found
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/[0.03] text-slate-500 rounded-md text-[8px] font-black uppercase tracking-widest font-mono">
                            Digital Twin Catalog Preview
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingMusicWidget;
