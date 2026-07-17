import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_TRACKS } from '@/constants';
import { motion } from 'motion/react';
import { TrendingUp, Music, ShoppingBag } from 'lucide-react';

export const TrendingChart: React.FC = () => {
  const { allTracks } = useAudio();
  const [metric, setMetric] = useState<'plays' | 'purchases'>('plays');

  const chartData = useMemo(() => {
    const sourceTracks = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    
    // Generate deterministic mock stats based on track id for visual consistency
    return sourceTracks.slice(0, 8).map((track, i) => {
      // Deterministic pseudo-randomness based on index and track title length
      const seed = track.title.length * (i + 1);
      return {
        name: track.title.length > 15 ? track.title.substring(0, 12) + '...' : track.title,
        fullTitle: track.title,
        artist: track.artist,
        plays: 1000 + (seed * 142) % 5000,
        purchases: 50 + (seed * 11) % 400,
        color: i % 2 === 0 ? '#3b82f6' : '#8b5cf6', // Blue and Purple accents
      };
    }).sort((a, b) => b[metric] - a[metric]);
  }, [allTracks, metric]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101A3B]/90 border border-white/10 backdrop-blur-md p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white text-sm mb-1">{data.fullTitle}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-2">{data.artist}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${metric === 'plays' ? 'text-blue-400' : 'text-purple-400'}`}>
              {payload[0].value.toLocaleString()} {metric === 'plays' ? 'Plays' : 'Purchases'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Trending Sounds</h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">
              Top tracks by {metric}
            </p>
          </div>
        </div>
        
        <div className="flex items-center bg-white/5 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setMetric('plays')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              metric === 'plays' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Plays
          </button>
          <button
            onClick={() => setMetric('purchases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              metric === 'purchases' 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Purchases
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar 
              dataKey={metric} 
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={metric === 'plays' ? '#3b82f6' : '#8b5cf6'} 
                  fillOpacity={0.8 + (index * 0.05)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendingChart;
