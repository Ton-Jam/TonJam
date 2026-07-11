import React, { useEffect, useState } from 'react';
import { TrendingUp, Globe, ExternalLink, Activity } from 'lucide-react';

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
      <div className={`bg-slate-900 border border-white/[0.03] rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="w-6 h-6 bg-blue-500/20 rounded-full" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-4">
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
    <div className={`bg-slate-900 border border-white/[0.03] rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Web3 Music Trends</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Intel</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend) => (
          <div 
            key={trend.id} 
            className="group bg-[#0A1128] border border-white/[0.05] hover:border-blue-500/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-1 bg-white/[0.03] border border-white/[0.05] rounded-[4px] text-[9px] font-black uppercase tracking-widest text-slate-300">
                {trend.category}
              </span>
              <span className={`px-2 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest border
                ${trend.impact === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                  trend.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
              >
                {trend.impact} Impact
              </span>
            </div>
            
            <h3 className="text-white font-bold text-sm leading-tight mb-2 group-hover:text-blue-400 transition-colors">
              {trend.title}
            </h3>
            
            <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
              {trend.summary}
            </p>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-white/[0.05] pt-3 mt-auto">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {trend.source}
              </span>
              <span>{trend.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      
      {sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.05]">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Sources Grounding</h4>
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
                    className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-blue-400 transition-colors bg-white/[0.02] px-2 py-1 rounded"
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
