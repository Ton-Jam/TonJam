import React, { useEffect, useState, useCallback } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  Flame, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Zap,
  Newspaper,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low' | string;
}

interface Web3MusicNewsProps {
  className?: string;
}

export const Web3MusicNews: React.FC<Web3MusicNewsProps> = ({ className = '' }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchNews = useCallback(async (fresh: boolean = false) => {
    if (fresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const url = fresh ? '/api/web3-music-trends?fresh=true' : '/api/web3-music-trends';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch Web3 music news');
      }
      const data = await response.json();
      setNews(data.trends || []);
      setSources(data.groundingSources || []);
    } catch (err: any) {
      setError('Unable to load live news right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  const categories = ['All', ...Array.from(new Set(news.map(item => item.category).filter(Boolean)))];

  const filteredNews = activeCategory === 'All' 
    ? news 
    : news.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  const getImpactBadge = (impact: string) => {
    const norm = (impact || '').toLowerCase();
    if (norm === 'high') {
      return 'bg-rose-500/10 text-rose-400';
    }
    if (norm === 'medium') {
      return 'bg-amber-500/10 text-amber-400';
    }
    return 'bg-emerald-500/10 text-emerald-400';
  };

  const getCategoryBadge = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('ton')) return 'bg-cyan-500/10 text-cyan-400';
    if (cat.includes('nft')) return 'bg-purple-500/10 text-purple-400';
    if (cat.includes('stream')) return 'bg-blue-500/10 text-blue-400';
    if (cat.includes('royalt') || cat.includes('licens')) return 'bg-amber-500/10 text-amber-400';
    return 'bg-indigo-500/10 text-indigo-400';
  };

  if (loading && news.length === 0) {
    return (
      <div id="web3-music-news-section" className={`bg-[#0A1128]/60 backdrop-blur-md rounded-3xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-48 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-64 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/[0.02] rounded-2xl p-4.5 space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-white/10 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-5/6 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="web3-music-news-section" className={`bg-[#0A1128]/60 backdrop-blur-md rounded-3xl p-5 sm:p-6 text-left transition-all ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2.5 rounded-2xl text-blue-400 shrink-0">
            <Newspaper className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                Web3 Music News
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              </h2>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Search Grounded</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live industry headlines, blockchain audio streaming & artist announcements verified with Google Search
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {news.length > 0 && (
            <button
              onClick={() => {
                const allExpanded = news.every((item, i) => expandedIds[item.id || String(i)]);
                const nextState: Record<string, boolean> = {};
                news.forEach((item, i) => {
                  nextState[item.id || String(i)] = !allExpanded;
                });
                setExpandedIds(nextState);
              }}
              className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer outline-none border-none"
            >
              {news.every((item, i) => expandedIds[item.id || String(i)]) ? 'Collapse All' : 'Expand All'}
            </button>
          )}

          <motion.button
            id="refresh-web3-news-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer outline-none border-none disabled:opacity-50"
            title="Refresh news using Google Search Grounding"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Scanning...' : 'Live Refresh'}</span>
          </motion.button>
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-1">
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer outline-none border-none shrink-0 ${
                  isSelected 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* News Items List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredNews.map((item, idx) => {
            const itemId = item.id || String(idx);
            const isExpanded = !!expandedIds[itemId];

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                key={itemId}
                className="group bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Category & Impact Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getCategoryBadge(item.category)}`}>
                      {item.category || 'Web3 Music'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getImpactBadge(item.impact)}`}>
                      {item.impact ? `${item.impact} Impact` : 'Trending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {/* Title & Click to Toggle */}
                <div 
                  onClick={(e) => toggleExpand(itemId, e)}
                  className="cursor-pointer select-none flex items-start justify-between gap-2 group-hover:text-blue-300 transition-colors"
                >
                  <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-1 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <button
                    onClick={(e) => toggleExpand(itemId, e)}
                    className="shrink-0 p-1 text-slate-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-white/[0.06] cursor-pointer outline-none border-none"
                    aria-label={isExpanded ? "Collapse headline summary" : "Expand headline summary"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-300" />
                    )}
                  </button>
                </div>

                {/* Summary with Expand/Collapse Animation */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isExpanded ? 'auto' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    marginTop: isExpanded ? '6px' : '0px',
                    marginBottom: isExpanded ? '12px' : '0px'
                  }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed bg-white/[0.02] p-3 rounded-xl font-normal">
                    {item.summary}
                  </p>
                </motion.div>

                {/* Bottom Row: Source, Verification, and Read More Toggle */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-300 font-bold">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Grounded</span>
                    </div>
                  </div>

                  {/* Read More / Show Less Button */}
                  <button
                    onClick={(e) => toggleExpand(itemId, e)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[11px] font-bold py-1 px-2 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer outline-none border-none"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Grounding Source Attribution Links */}
      {sources.length > 0 && (
        <div className="mt-5 pt-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Verified Web Sources & Citations
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => {
              try {
                const url = new URL(source);
                return (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-blue-300 transition-colors bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    <span>{url.hostname.replace('www.', '')}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                );
              } catch (e) {
                return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3MusicNews;
