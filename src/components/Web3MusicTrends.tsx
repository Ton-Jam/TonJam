import React, { useEffect, useState } from 'react';
import { Globe, ExternalLink, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Trend {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  category: string;
  impact: string;
}

interface Web3MusicTrendsProps {
  className?: string;
}

export const Web3MusicTrends: React.FC<Web3MusicTrendsProps> = ({ className = '' }) => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/web3-music-trends');
        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }
        const data = await response.json();
        setTrends(data.trends || []);
        setSources(data.groundingSources || []);
      } catch (err) {
        setError('Unable to load latest trends right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className={`bg-[#0A1128]/50 backdrop-blur-md rounded-3xl p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="w-6 h-6 bg-blue-500/20 rounded-full" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/[0.02] rounded-2xl p-4">
              <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-1/4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || trends.length === 0) {
    return null;
  }

  return (
    <div className={`bg-[#0A1128]/50 backdrop-blur-md rounded-3xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              TON & Web3 Music Trends
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Real-time headlines grounded by Google Search</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live Intel</span>
        </div>
      </div>

      {/* Vertically Scrollable List with Zero Borders */}
      <div className="max-h-[380px] overflow-y-auto pr-1.5 space-y-3 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        {trends.map((trend) => (
          <motion.div 
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
            key={trend.id} 
            className="group bg-white/[0.015] rounded-2xl p-4.5 transition-all duration-300"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-500/10 rounded-md text-[8px] font-black uppercase tracking-widest text-blue-400">
                {trend.category}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest
                ${trend.impact === 'High' ? 'bg-rose-500/10 text-rose-400' : 
                  trend.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 
                  'bg-emerald-500/10 text-emerald-400'}`}
              >
                {trend.impact} Impact
              </span>
            </div>
            
            <h3 className="text-white font-bold text-sm leading-snug mb-1.5 group-hover:text-blue-400 transition-colors">
              {trend.title}
            </h3>
            
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              {trend.summary}
            </p>
            
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest pt-2.5 bg-transparent">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                {trend.source}
              </span>
              <span>{trend.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {sources.length > 0 && (
        <div className="mt-5 pt-4 bg-transparent">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Sources Grounding</h4>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, index) => {
               try {
                 const url = new URL(source);
                 return (
                  <a 
                    key={index} 
                    href={source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-blue-400 transition-colors bg-white/[0.02] hover:bg-white/[0.04] px-2.5 py-1 rounded-lg"
                  >
                    {url.hostname.replace('www.', '')}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                 );
               } catch(e) {
                 return null;
               }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3MusicTrends;
