import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Play, 
  ChevronRight,
  Disc,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar
} from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { TON_LOGO } from '@/constants';

type Timeframe = '24h' | '7d' | '30d';

interface ChartDataPoint {
  label: string;
  volume: number;
  sales: number;
}

export const TrendingNFTVolumeChart: React.FC = () => {
  const navigate = useNavigate();
  const { allNFTs, playTrack, allTracks } = useAudio();
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [selectedNFTId, setSelectedNFTId] = useState<string | null>(null);

  // Timeframe chart datasets
  const chartData = useMemo<Record<Timeframe, ChartDataPoint[]>>(() => ({
    '24h': [
      { label: '00:00', volume: 140, sales: 8 },
      { label: '04:00', volume: 220, sales: 12 },
      { label: '08:00', volume: 180, sales: 9 },
      { label: '12:00', volume: 390, sales: 24 },
      { label: '16:00', volume: 510, sales: 31 },
      { label: '20:00', volume: 430, sales: 22 },
      { label: 'Now', volume: 680, sales: 38 },
    ],
    '7d': [
      { label: 'Mon', volume: 1250, sales: 85 },
      { label: 'Tue', volume: 1820, sales: 110 },
      { label: 'Wed', volume: 1450, sales: 92 },
      { label: 'Thu', volume: 2400, sales: 154 },
      { label: 'Fri', volume: 3100, sales: 198 },
      { label: 'Sat', volume: 4200, sales: 260 },
      { label: 'Sun', volume: 3890, sales: 245 },
    ],
    '30d': [
      { label: 'Week 1', volume: 8400, sales: 520 },
      { label: 'Week 2', volume: 11200, sales: 710 },
      { label: 'Week 3', volume: 15800, sales: 980 },
      { label: 'Week 4', volume: 19400, sales: 1240 },
    ]
  }), []);

  // Summary statistics calculated for selected timeframe
  const currentMetrics = useMemo(() => {
    const data = chartData[timeframe];
    const totalVol = data.reduce((acc, curr) => acc + curr.volume, 0);
    const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);
    const growth = timeframe === '24h' ? '+18.4%' : timeframe === '7d' ? '+34.2%' : '+62.8%';
    return {
      totalVol,
      totalSales,
      growth,
      avgPrice: (totalVol / (totalSales || 1)).toFixed(2)
    };
  }, [chartData, timeframe]);

  // Derived trending NFTs with volume ranking
  const topNFTs = useMemo(() => {
    if (allNFTs && allNFTs.length > 0) {
      return allNFTs.slice(0, 5).map((nft, index) => {
        const volumeMultiplier = 5 - index * 0.7;
        const volume = Math.round((parseFloat(nft.price || '5') * 12 + 15) * volumeMultiplier);
        return {
          ...nft,
          volume,
          change: index % 2 === 0 ? `+${(12 + index * 4.2).toFixed(1)}%` : `+${(5 + index * 3.1).toFixed(1)}%`,
        };
      }).sort((a, b) => b.volume - a.volume);
    }

    // Default mock trending items if allNFTs is empty
    return [
      { id: 'tn1', title: 'Cyber Pulse Live', creator: 'DarkStar', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300', price: '12', volume: 480, change: '+24.5%' },
      { id: 'tn2', title: 'Neon Horizon', creator: 'SynthWave', imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=300&h=300', price: '8.5', volume: 340, change: '+18.2%' },
      { id: 'tn3', title: 'Vortex Audio Prism', creator: 'Cybernetic', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300', price: '15', volume: 290, change: '+12.8%' },
      { id: 'tn4', title: 'Starlight Symphony', creator: 'Nebula', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300&h=300', price: '6', volume: 210, change: '+8.4%' },
      { id: 'tn5', title: 'Void Echoes', creator: 'Astro Beats', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300&h=300', price: '9', volume: 175, change: '+5.1%' },
    ];
  }, [allNFTs]);

  const activeNFT = useMemo(() => {
    return topNFTs.find(n => n.id === selectedNFTId) || topNFTs[0];
  }, [topNFTs, selectedNFTId]);

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl text-xs space-y-1">
          <p className="text-slate-400 font-bold uppercase tracking-wider">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-mono text-white font-bold">{payload[0].value.toLocaleString()} TON</span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-medium">{payload[1].value} Sales</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 my-8 space-y-6">
      {/* Header with Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/10 text-blue-400 p-1.5 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Market Analytics</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Trending Music NFT Volume
          </h2>
          <p className="text-xs text-slate-400">Real-time volume metrics & trading activity across music collectibles</p>
        </div>

        {/* Timeframe Controls - No border lines */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl self-start sm:self-auto">
          {(['24h', '7d', '30d'] as Timeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`relative px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="volumeTimeframeBg"
                    className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-600/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container - No border lines */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] p-5 sm:p-7 shadow-2xl space-y-6">
        
        {/* Top Summary Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-2xl p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Volume ({timeframe.toUpperCase()})</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">{currentMetrics.totalVol.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-blue-400">TON</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              {currentMetrics.growth}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Sales</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">{currentMetrics.totalSales.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400">Mints/Trades</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-400 mt-1">
              <Flame className="w-3 h-3" />
              Active
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Mint / Price</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">{currentMetrics.avgPrice}</span>
              <span className="text-[10px] font-bold text-blue-400">TON</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 block">Weighted Avg</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Leader</span>
            <div className="truncate font-black text-white text-sm mt-1">{activeNFT?.title || 'Cyber Pulse'}</div>
            <span className="text-[10px] font-bold text-blue-400 mt-1 block truncate">by {activeNFT?.creator || 'DarkStar'}</span>
          </div>
        </div>

        {/* Visual Chart Area using Recharts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-white">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Volume Trend Curve
            </span>
            <span className="text-[10px] uppercase font-mono text-blue-400">Live TON Analytics</span>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData[timeframe]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#volumeGradient)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Music NFTs Volume Leaderboard */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-blue-400 animate-spin-slow" />
              Top Music Collectibles by Volume
            </h3>
            <button 
              onClick={() => navigate('/trending-nfts')}
              className="text-[11px] font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Full Rankings
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {topNFTs.map((nft, rank) => {
              const maxVol = topNFTs[0]?.volume || 500;
              const percent = Math.round((nft.volume / maxVol) * 100);
              const track = allTracks.find(t => t.id === (nft as any).trackId);

              return (
                <div 
                  key={nft.id}
                  onClick={() => {
                    setSelectedNFTId(nft.id);
                    navigate(`/nft/${nft.id}`);
                  }}
                  className="group bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer"
                >
                  {/* Rank & Image */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 text-center text-xs font-black font-mono ${
                      rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{rank + 1}
                    </span>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                      <img 
                        src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                        alt={nft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      {track && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track);
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Play className="w-5 h-5 text-white fill-white" />
                        </button>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                        {nft.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        by {nft.creator || 'Artist'}
                      </p>
                      
                      {/* Mini Volume Bar */}
                      <div className="w-28 sm:w-40 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Volume & Price Metrics */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs font-black font-mono text-white">{nft.volume} TON</span>
                      <span className="text-[9px] font-bold text-emerald-400">{nft.change}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                      <span>Floor: {nft.price}</span>
                      <img src={TON_LOGO} alt="TON" className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrendingNFTVolumeChart;
