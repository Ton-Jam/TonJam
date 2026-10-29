import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Flame, 
  Calendar, 
  Globe, 
  Music, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface DropItem {
  artistName: string;
  title: string;
  date: string;
  platform: string;
  description: string;
}

interface SourceItem {
  title: string;
  uri: string;
}

interface TrendingData {
  headline: string;
  overview: string;
  drops: DropItem[];
  sources: SourceItem[];
  trendingTags: string[];
}

export const TrendingNowWidget: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrendingData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/gemini/trending-drops');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load trending drops:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingData(false);
  }, [fetchTrendingData]);

  if (loading && !data) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
        <div className="bg-[#111C30]/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-white/10 rounded-lg" />
                <div className="h-3 w-32 bg-white/5 rounded-md" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
          <div className="h-16 w-full bg-white/5 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-24 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#111C30]/90 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/40 text-left overflow-hidden relative"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#229ED9]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#9B7CFF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#229ED9]/20 to-[#9B7CFF]/25 text-[#229ED9] shadow-inner shrink-0">
              <Flame className="w-6 h-6 text-[#229ED9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#F5F7FB] tracking-tight">
                  Trending Now
                </h2>
                <div className="flex items-center gap-1 bg-[#229ED9]/15 text-[#229ED9] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#229ED9] animate-ping" />
                  Google Search Grounded
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Real-time Web3 music trends & upcoming artist drops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => fetchTrendingData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 transition-all text-[#F5F7FB] text-xs font-semibold cursor-pointer shadow-sm"
              title="Refresh trends"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#229ED9] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/launchpad')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#229ED9]/90 active:scale-95 transition-all text-white text-xs font-bold shadow-md shadow-[#229ED9]/30 cursor-pointer"
            >
              <span>Launchpad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Overview Summary */}
        {data?.overview && (
          <div className="mb-5 p-4 rounded-xl bg-white/[0.03] text-[#F5F7FB] text-xs sm:text-sm leading-relaxed relative z-10">
            <div className="font-bold text-[#FFC857] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {data.headline || "Web3 Music & Drop Radar"}
            </div>
            {data.overview}
          </div>
        )}

        {/* Trending Drops Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5 relative z-10">
          {data?.drops?.map((drop, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/launchpad')}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#9B7CFF]/15 text-[#9B7CFF]">
                    {drop.platform || "TON Launchpad"}
                  </span>
                  <span className="text-[11px] font-semibold text-[#FFC857] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {drop.date || "Coming Soon"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#F5F7FB] group-hover:text-[#229ED9] transition-colors line-clamp-1">
                  {drop.title}
                </h3>
                <p className="text-xs text-[#94A3B8] font-medium mb-2">
                  by {drop.artistName}
                </p>
                <p className="text-xs text-[#94A3B8]/90 line-clamp-2">
                  {drop.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] font-bold text-[#229ED9]">
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  Explore Drop
                </span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trending Tags & Grounding Sources Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] relative z-10 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#94A3B8] font-medium">Trending Tags:</span>
            {data?.trendingTags?.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#2DD4BF] font-semibold">
                {tag}
              </span>
            ))}
          </div>

          {data?.sources && data.sources.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#94A3B8] font-medium">Sources:</span>
              {data.sources.slice(0, 2).map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#229ED9] hover:underline truncate max-w-[180px]"
                  title={src.title}
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrendingNowWidget;
