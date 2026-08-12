import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer as RechartsResponsiveContainer, 
  ComposedChart as RechartsComposedChart, 
  Area as RechartsArea, 
  Line as RechartsLine, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid as RechartsCartesianGrid,
  Legend as RechartsLegend
} from 'recharts';
import { 
  TrendingUp, 
  Play, 
  Coins, 
  Users, 
  Sparkles, 
  Calendar, 
  Music, 
  Gem, 
  ArrowUpRight, 
  BarChart2, 
  Eye, 
  Filter,
  Flame,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProfileData } from './ProfileTypes';

const ResponsiveContainer = RechartsResponsiveContainer as any;
const ComposedChart = RechartsComposedChart as any;
const Area = RechartsArea as any;
const Line = RechartsLine as any;
const Bar = RechartsBar as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const Tooltip = RechartsTooltip as any;
const CartesianGrid = RechartsCartesianGrid as any;
const Legend = RechartsLegend as any;

interface ArtistAnalyticsSectionProps {
  profile?: Partial<ProfileData>;
}

type Timeframe = '7D' | '30D' | '6M' | '1Y';

// Detailed historical series data generators for 7D, 30D, 6M, 1Y
const TIMEFRAME_DATA: Record<Timeframe, { date: string; streams: number; nftSales: number; followers: number }[]> = {
  '7D': [
    { date: 'Mon', streams: 3200, nftSales: 4.2, followers: 12400 },
    { date: 'Tue', streams: 4100, nftSales: 6.8, followers: 12550 },
    { date: 'Wed', streams: 3800, nftSales: 5.1, followers: 12700 },
    { date: 'Thu', streams: 5400, nftSales: 9.4, followers: 12920 },
    { date: 'Fri', streams: 6900, nftSales: 12.5, followers: 13200 },
    { date: 'Sat', streams: 8200, nftSales: 18.0, followers: 13650 },
    { date: 'Sun', streams: 7800, nftSales: 15.2, followers: 14250 },
  ],
  '30D': [
    { date: 'Week 1', streams: 22400, nftSales: 28.5, followers: 11200 },
    { date: 'Week 2', streams: 28900, nftSales: 35.0, followers: 12100 },
    { date: 'Week 3', streams: 34100, nftSales: 42.2, followers: 13050 },
    { date: 'Week 4', streams: 41200, nftSales: 58.6, followers: 14250 },
  ],
  '6M': [
    { date: 'Oct', streams: 68000, nftSales: 82.0, followers: 8400 },
    { date: 'Nov', streams: 89000, nftSales: 105.0, followers: 9800 },
    { date: 'Dec', streams: 112000, nftSales: 138.5, followers: 11100 },
    { date: 'Jan', streams: 145000, nftSales: 162.0, followers: 12200 },
    { date: 'Feb', streams: 198000, nftSales: 210.4, followers: 13400 },
    { date: 'Mar', streams: 245900, nftSales: 268.0, followers: 14250 },
  ],
  '1Y': [
    { date: 'Q1', streams: 140000, nftSales: 150.0, followers: 5200 },
    { date: 'Q2', streams: 280000, nftSales: 310.0, followers: 8100 },
    { date: 'Q3', streams: 420000, nftSales: 490.0, followers: 11300 },
    { date: 'Q4', streams: 658000, nftSales: 784.0, followers: 14250 },
  ]
};

const TOP_TRACKS = [
  { id: '1', title: 'Solar Pulse (TON Remix)', streams: '84,300', sales: '18.5 TON', growth: '+28.4%' },
  { id: '2', title: 'Cyber Dream Horizon', streams: '62,100', sales: '12.0 TON', growth: '+19.2%' },
  { id: '3', title: 'Late Night Synthesis', streams: '45,800', sales: '8.4 TON', growth: '+14.6%' },
  { id: '4', title: 'DeFi Summer Rhythm', streams: '31,200', sales: '5.2 TON', growth: '+11.0%' },
];

export const ArtistAnalyticsSection: React.FC<ArtistAnalyticsSectionProps> = ({ profile }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [showStreams, setShowStreams] = useState(true);
  const [showNftSales, setShowNftSales] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);

  const chartData = useMemo(() => TIMEFRAME_DATA[timeframe], [timeframe]);

  // Totals calculations
  const totalStreamsCount = profile?.totalStreams || 245900;
  const followerCount = profile?.followers || 14250;

  return (
    <div className="space-y-6 text-white font-sans" id="artist-analytics-section">
      
      {/* Top Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0052FF]/20 text-[#0052FF]">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              Artist Growth & Telemetry Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Realtime performance metrics for streams, TON NFT sales, and follower expansion.
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 bg-[#050A24] p-1 rounded-xl border border-white/5 shrink-0">
          {(['7D', '30D', '6M', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-[#0052FF] text-white shadow-[0_0_12px_rgba(0,82,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Streams KPI */}
        <div className="bg-[#101A3B]/80 border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#0052FF]/10 rounded-full blur-xl group-hover:bg-[#0052FF]/20 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Play className="w-3 h-3 text-[#0052FF] fill-current" />
              Total Streams
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black font-mono tracking-tight text-white">
              {totalStreamsCount.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              +{timeframe === '7D' ? '7,800' : timeframe === '30D' ? '41,200' : '98,000'} plays in selected period
            </p>
          </div>
        </div>

        {/* NFT Sales KPI */}
        <div className="bg-[#101A3B]/80 border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Gem className="w-3 h-3 text-emerald-400" />
              NFT Sales Volume
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +32.1%
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black font-mono tracking-tight text-emerald-400">
              268.0 TON
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              ≈ $1,876 USD across 42 minted editions
            </p>
          </div>
        </div>

        {/* Follower Growth KPI */}
        <div className="bg-[#101A3B]/80 border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-400" />
              Total Followers
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +14.2%
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black font-mono tracking-tight text-purple-300">
              {followerCount.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              +1,850 new fan nodes connected
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Multi-Metric Chart Panel */}
      <div className="bg-[#101A3B]/60 backdrop-blur-md border border-white/5 p-5 rounded-3xl shadow-xl space-y-4">
        {/* Chart Header & Metric Toggle Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Timeline Performance Curve
            </span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0052FF]" />
              Streams, Sales & Audience Dynamics ({timeframe})
            </h4>
          </div>

          {/* Series Toggle Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowStreams(!showStreams)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                showStreams
                  ? 'bg-[#0052FF]/20 border-[#0052FF] text-[#0052FF]'
                  : 'bg-[#050A24] border-white/5 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
              Total Streams
            </button>

            <button
              onClick={() => setShowNftSales(!showNftSales)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                showNftSales
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-[#050A24] border-white/5 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              NFT Sales (TON)
            </button>

            <button
              onClick={() => setShowFollowers(!showFollowers)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                showFollowers
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-[#050A24] border-white/5 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Follower Count
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-64 w-full select-none pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="streamsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052FF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="nftSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} 
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 10 }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 10 }} 
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#050A24', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  padding: '10px 14px'
                }}
                labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
              />

              {showStreams && (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="streams" 
                  name="Streams" 
                  stroke="#0052FF" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#streamsAreaGrad)" 
                />
              )}

              {showNftSales && (
                <Bar 
                  yAxisId="right"
                  dataKey="nftSales" 
                  name="NFT Sales (TON)" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16} 
                />
              )}

              {showFollowers && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="followers" 
                  name="Followers" 
                  stroke="#A855F7" 
                  strokeWidth={2} 
                  dot={{ fill: '#A855F7', r: 3 }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Tracks Breakdown Table */}
      <div className="bg-[#101A3B]/60 backdrop-blur-md border border-white/5 p-5 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#0052FF]/20 text-[#0052FF]">
              <Flame className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Top Streamed Tracks
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Last 30 Days
          </span>
        </div>

        <div className="space-y-2">
          {TOP_TRACKS.map((track, idx) => (
            <div 
              key={track.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-[#050A24] text-slate-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">
                    {track.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {track.streams} plays
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  {track.sales}
                </span>
                <span className="text-[9px] font-bold text-blue-400 block">
                  {track.growth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ArtistAnalyticsSection;
