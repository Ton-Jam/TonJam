import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

// Mock data for Market Trends
const volumeData = [
  { date: 'Mon', volume: 12500, floorPrice: 12.5 },
  { date: 'Tue', volume: 15800, floorPrice: 13.0 },
  { date: 'Wed', volume: 14200, floorPrice: 12.8 },
  { date: 'Thu', volume: 18900, floorPrice: 14.5 },
  { date: 'Fri', volume: 22100, floorPrice: 15.2 },
  { date: 'Sat', volume: 28500, floorPrice: 17.5 },
  { date: 'Sun', volume: 31200, floorPrice: 18.2 },
];

const trendingCollections = [
  { name: 'Cyberpunk Beats', change: '+24.5%', volume: '145K TON', color: '#3b82f6' },
  { name: 'Ethereal Synths', change: '+18.2%', volume: '98K TON', color: '#8b5cf6' },
  { name: 'Neon Nights', change: '+12.4%', volume: '76K TON', color: '#ec4899' },
  { name: 'Bass Drop Club', change: '+8.7%', volume: '45K TON', color: '#10b981' },
];

export const MarketTrendsChart = ({ className }: { className?: string }) => {
  const [activeTab, setActiveTab] = useState<'volume' | 'floor'>('volume');

  return (
    <div className={cn("bg-white/5 backdrop-blur-xl rounded-[4px] p-6 flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Market Trends</h3>
          </div>
          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest pl-6">TON Ecosystem Overview</p>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-[4px]">
          <button
            onClick={() => setActiveTab('volume')}
            className={cn(
              "px-3 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'volume' 
                ? "bg-blue-600/20 text-blue-400" 
                : "text-muted-foreground/60 hover:text-white"
            )}
          >
            <BarChart3 className="w-3 h-3" />
            Volume
          </button>
          <button
            onClick={() => setActiveTab('floor')}
            className={cn(
              "px-3 py-1.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'floor' 
                ? "bg-emerald-600/20 text-emerald-400" 
                : "text-muted-foreground/60 hover:text-white"
            )}
          >
            <Activity className="w-3 h-3" />
            Floor Price
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'volume' ? (
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#666', letterSpacing: '0.1em' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#666', fontFamily: 'monospace' }} 
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-3 rounded-[4px] shadow-2xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{payload[0].payload.date}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-white font-mono">{payload[0].value?.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-blue-400">TON</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === volumeData.length - 1 ? '#3b82f6' : '#1e3a8a'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFloor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#666', letterSpacing: '0.1em' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#666', fontFamily: 'monospace' }} 
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-3 rounded-[4px] shadow-2xl">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{payload[0].payload.date}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-emerald-400 font-mono">{payload[0].value}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">TON Floor</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="floorPrice" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorFloor)" 
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trending Collections</h4>
          <div className="flex flex-col gap-3">
            {trendingCollections.map((collection, idx) => (
              <div key={idx} className="bg-white/[0.02] hover:bg-white/[0.05] p-3 rounded-[4px] border border-white/5 transition-colors flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ backgroundColor: collection.color }}>
                    {collection.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[100px]">{collection.name}</p>
                    <p className="text-[9px] font-medium text-muted-foreground">{collection.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400">{collection.change}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white transition-colors rounded-[4px]">
            View All Markets
          </button>
        </div>
      </div>
    </div>
  );
};
