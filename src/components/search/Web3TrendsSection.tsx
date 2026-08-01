import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Sparkles, 
  TrendingUp, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Clock, 
  Newspaper,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export interface Web3TrendItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  category: string;
  impact?: 'High' | 'Medium' | 'Low' | string;
}

export const Web3TrendsSection: React.FC = () => {
  const [trends, setTrends] = useState<Web3TrendItem[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGrounded, setIsGrounded] = useState<boolean>(false);

  const fetchTrends = async (fresh: boolean = false) => {
    if (fresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch(`/api/web3-music-trends${fresh ? '?fresh=true' : ''}`);
      if (!res.ok) throw new Error('Failed to fetch Web3 music trends');
      const data = await res.json();
      
      if (data && Array.isArray(data.trends)) {
        setTrends(data.trends);
        if (data.groundingSources && data.groundingSources.length > 0) {
          setSources(data.groundingSources);
          setIsGrounded(true);
        } else {
          setSources([]);
          setIsGrounded(false);
        }
        if (fresh) toast.success('Search Grounded headlines updated!');
      }
    } catch (err) {
      console.error('Error fetching Web3 trends:', err);
      if (fresh) toast.error('Could not refresh live trends. Displaying cached signals.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends(false);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00B4D8] text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00B4D8] animate-pulse" />
              <span>Gemini Search Grounding</span>
            </span>
            {isGrounded && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-emerald-400" />
                Live Web Data
              </span>
            )}
          </div>
          <h3 className="text-sm md:text-base font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#00B4D8]" />
            Web3 Music & TON Pulse
          </h3>
        </div>

        <button
          onClick={() => fetchTrends(true)}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c133a] hover:bg-[#121c4e] text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all active:scale-95 disabled:opacity-50"
          title="Re-run Search Grounding for live trends"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00B4D8] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Grounding</span>
        </button>
      </div>

      {/* Content Canvas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={`skel-${n}`} className="p-4 rounded-2xl bg-[#0c133a] space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/6"></div>
              </div>
              <div className="h-5 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/60 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : trends.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-[#0c133a] text-slate-400 text-xs space-y-2">
          <Globe className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
          <p className="font-bold text-slate-300">No Web3 trends fetched</p>
          <button 
            onClick={() => fetchTrends(true)}
            className="px-3 py-1 bg-[#00B4D8] text-slate-950 font-bold text-[10px] rounded-lg"
          >
            Retry Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const impactColor = 
                item.impact?.toLowerCase() === 'high' ? 'bg-rose-500/10 text-rose-400' :
                item.impact?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                'bg-slate-500/10 text-slate-400';

              return (
                <motion.div
                  key={item.id || `trend-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 rounded-2xl bg-[#0c133a] hover:bg-[#0f1847] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#00B4D8]/10 text-[#00B4D8] font-bold uppercase tracking-wider">
                          {item.category || 'Web3'}
                        </span>
                        {item.impact && (
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${impactColor}`}>
                            {item.impact} Impact
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.timestamp || 'Recent'}</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-[#00B4D8] transition-colors leading-snug">
                      {item.title}
                    </h4>

                    {/* Summary */}
                    <p className={`text-[11px] text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {item.summary}
                    </p>
                  </div>

                  {/* Footer Source info & Expand trigger */}
                  <div className="pt-3 mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono font-medium text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {item.source || 'Industry Source'}
                    </span>

                    <button className="flex items-center gap-1 text-[#00B4D8] font-bold hover:underline">
                      <span>{isExpanded ? 'Show less' : 'Read details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Grounding Reference URLs if available */}
          {sources.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#080d2d] space-y-2 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>Verified Grounding Citations ({sources.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((url, i) => {
                  let hostname = url;
                  try {
                    hostname = new URL(url).hostname.replace('www.', '');
                  } catch {
                    hostname = url;
                  }
                  return (
                    <a
                      key={`grounding-src-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-[#0c133a] hover:bg-[#121c4e] text-slate-300 hover:text-[#00B4D8] text-[10px] font-mono transition-colors flex items-center gap-1"
                    >
                      <span>{hostname}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Web3TrendsSection;
