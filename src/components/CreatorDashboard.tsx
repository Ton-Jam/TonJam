import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  ShoppingBag, 
  MessageCircle, 
  Heart, 
  Share2,
  ArrowUpRight,
  Zap,
  Star,
  Award,
  Disc,
  Play,
  Pause,
  Repeat,
  Percent,
  BarChart3,
  Flame,
  ArrowDownRight,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  Layers,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Trophy,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { TON_LOGO, MOCK_TRACKS } from '@/constants';
import { toast } from 'sonner';

import FanLeaderboardWidget from './FanLeaderboardWidget';
import MintingStatus from './MintingStatus';
import LiveTourManager from './LiveTourManager';

import { DateRangePicker, DateRangeState } from './DateRangePicker';



export const CreatorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { nfts } = useNFT();
  const { allTracks, currentTrack, isPlaying, playTrack } = useAudio();

  const [dateRange, setDateRange] = useState<DateRangeState>({ preset: '7d' });
  const [liveStreamCounter, setLiveStreamCounter] = useState(148290);
  const [liveRoyaltyPool, setLiveRoyaltyPool] = useState(342.85);
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'royalties' | 'fans'>('overview');

  // Real-time live play tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStreamCounter((prev) => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.6) {
        const royaltyGain = parseFloat((Math.random() * 0.15 + 0.05).toFixed(2));
        setLiveRoyaltyPool((prev) => parseFloat((prev + royaltyGain).toFixed(2)));
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Calculate days for custom date range
  const customDays = useMemo(() => {
    if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate).getTime();
      const end = new Date(dateRange.endDate).getTime();
      const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      return diff;
    }
    return 7;
  }, [dateRange]);

  // Multiplier calculation for time-filtered metrics
  const rangeMultiplier = useMemo(() => {
    switch (dateRange.preset) {
      case '24h': return 0.2;
      case '7d': return 1;
      case '30d': return 3.8;
      case '90d': return 10.5;
      case 'ytd': return 18.2;
      case 'all': return 28.4;
      case 'custom': return parseFloat((customDays / 7).toFixed(2));
      default: return 1;
    }
  }, [dateRange.preset, customDays]);

  // Main metrics computation
  const metrics = useMemo(() => {
    const totalPlays = Math.floor(liveStreamCounter * (rangeMultiplier / 1));
    const royaltyEarnings = parseFloat((liveRoyaltyPool * rangeMultiplier).toFixed(2));
    const primarySales = parseFloat((840.50 * rangeMultiplier).toFixed(2));
    const totalEarnings = parseFloat((primarySales + royaltyEarnings).toFixed(2));
    const recentTradeVolume = parseFloat((1840.20 * rangeMultiplier).toFixed(2));
    const nftSalesCount = Math.floor(156 * rangeMultiplier);
    const collectorsCount = Math.floor(482 * Math.min(rangeMultiplier, 5));
    const avgRoyaltyRate = 7.5; // 7.5% average secondary royalty

    return {
      totalPlays,
      royaltyEarnings,
      primarySales,
      totalEarnings,
      recentTradeVolume,
      nftSalesCount,
      collectorsCount,
      avgRoyaltyRate
    };
  }, [rangeMultiplier, liveStreamCounter, liveRoyaltyPool]);

  // Chart data for Plays vs Trade Volume
  const chartData = useMemo(() => {
    if (dateRange.preset === '24h') {
      return [
        { label: '00:00', plays: 1200, volume: 45, royalties: 3.2 },
        { label: '04:00', plays: 1800, volume: 80, royalties: 6.0 },
        { label: '08:00', plays: 3200, volume: 150, royalties: 11.2 },
        { label: '12:00', plays: 5400, volume: 290, royalties: 21.7 },
        { label: '16:00', plays: 4800, volume: 240, royalties: 18.0 },
        { label: '20:00', plays: 6100, volume: 340, royalties: 25.5 },
      ];
    }
    if (dateRange.preset === '7d') {
      return [
        { label: 'Mon', plays: 14200, volume: 180, royalties: 13.5 },
        { label: 'Tue', plays: 18900, volume: 240, royalties: 18.0 },
        { label: 'Wed', plays: 16500, volume: 210, royalties: 15.7 },
        { label: 'Thu', plays: 22400, volume: 310, royalties: 23.2 },
        { label: 'Fri', plays: 31000, volume: 480, royalties: 36.0 },
        { label: 'Sat', plays: 28500, volume: 420, royalties: 31.5 },
        { label: 'Sun', plays: 24800, volume: 360, royalties: 27.0 },
      ];
    }
    if (dateRange.preset === 'custom') {
      const basePlays = Math.floor(12000 * rangeMultiplier / 4);
      const baseVol = Math.floor(150 * rangeMultiplier / 4);
      return [
        { label: 'P1', plays: basePlays, volume: baseVol, royalties: parseFloat((baseVol * 0.075).toFixed(1)) },
        { label: 'P2', plays: Math.floor(basePlays * 1.3), volume: Math.floor(baseVol * 1.4), royalties: parseFloat((baseVol * 1.4 * 0.075).toFixed(1)) },
        { label: 'P3', plays: Math.floor(basePlays * 1.1), volume: Math.floor(baseVol * 1.2), royalties: parseFloat((baseVol * 1.2 * 0.075).toFixed(1)) },
        { label: 'P4', plays: Math.floor(basePlays * 1.5), volume: Math.floor(baseVol * 1.6), royalties: parseFloat((baseVol * 1.6 * 0.075).toFixed(1)) },
      ];
    }
    return [
      { label: 'Wk 1', plays: 84000, volume: 1200, royalties: 90 },
      { label: 'Wk 2', plays: 102000, volume: 1540, royalties: 115.5 },
      { label: 'Wk 3', plays: 135000, volume: 1890, royalties: 141.7 },
      { label: 'Wk 4', plays: 168000, volume: 2400, royalties: 180 },
    ];
  }, [dateRange.preset, rangeMultiplier]);

  // Specific Music NFT list with real-time stats
  const musicNFTsList = useMemo(() => {
    const tracks = allTracks && allTracks.length > 0 ? allTracks.slice(0, 5) : MOCK_TRACKS.slice(0, 5);
    return tracks.map((track, idx) => {
      const plays = 24500 + (idx * 8400);
      const floorPrice = (2.5 + (idx * 1.2)).toFixed(1);
      const tradeVolume = (145.0 + (idx * 62.5)).toFixed(1);
      const royaltyEarned = (parseFloat(tradeVolume) * 0.075).toFixed(2);
      const mintedCount = 100 - (idx * 15);
      const totalSupply = 100;

      return {
        id: track.id,
        title: track.title,
        artist: track.artist || userProfile?.name || 'Artist',
        coverUrl: track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        plays,
        floorPrice: `${floorPrice} TON`,
        tradeVolume: `${tradeVolume} TON`,
        royaltyEarned: `${royaltyEarned} TON`,
        mintedCount,
        totalSupply,
        trackObj: track
      };
    });
  }, [allTracks, userProfile]);

  // Top performing tracks list calculated for the selected date range
  const topPerformingTracks = useMemo(() => {
    const tracks = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    
    const processed = tracks.map((track, idx) => {
      const trackPlays = (track as any).plays;
      const basePlays = (typeof trackPlays === 'number' && trackPlays > 0) ? trackPlays : (52400 - (idx * 8200) + (idx % 2 === 0 ? 3200 : -1500));
      const rangePlays = Math.max(12, Math.round(basePlays * rangeMultiplier));
      return {
        id: track.id || `top-track-${idx}`,
        title: track.title,
        artist: track.artist || userProfile?.name || 'Artist',
        coverUrl: track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        plays: rangePlays,
        trackObj: track,
      };
    });

    processed.sort((a, b) => b.plays - a.plays);
    const top5 = processed.slice(0, 5);
    const totalPlays = top5.reduce((sum, item) => sum + item.plays, 0);

    return top5.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: totalPlays > 0 ? Math.round((item.plays / totalPlays) * 100) : 20,
    }));
  }, [allTracks, userProfile, rangeMultiplier]);

  const handleExportData = () => {
    const rangeName = dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate}_to_${dateRange.endDate}`
      : dateRange.preset;

    toast.success('Exporting Creator Royalty & Analytics Report', {
      description: `Downloaded TonJam_Creator_Analytics_${rangeName}.csv`
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left"
    >
      {/* Top Banner & Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0A113A]/60 p-5 rounded-3xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" /> Real-Time Analytics
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              On-Chain Synced
            </span>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Disc className="w-6 h-6 text-[#0052FF]" />
            Creator Intelligence & NFT Analytics
          </h1>
          <p className="text-xs font-medium text-zinc-400">
            Real-time track plays, secondary marketplace royalties, and trade volume metrics
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Date Range Picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <button
            onClick={handleExportData}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none outline-none"
          >
            <Download className="w-3.5 h-3.5 text-[#0052FF]" /> Export Report
          </button>
        </div>
      </div>

      {/* 1. CORE THREE METRICS CARDS (Total Plays, Royalty Earnings, Recent Trade Volume) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Music NFT Plays */}
        <div className="bg-[#0A113A]/60 backdrop-blur-md p-5 rounded-3xl space-y-3 relative overflow-hidden group hover:bg-[#121B4C]/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Total Music NFT Plays
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black font-mono text-white tracking-tight">
                {metrics.totalPlays.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-blue-400 uppercase">Streams</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
            <span>Avg. Daily Listeners</span>
            <span className="font-mono font-bold text-white">14,280 / day</span>
          </div>
        </div>

        {/* Card 2: Revenue Earned from Royalties */}
        <div className="bg-[#0A113A]/60 backdrop-blur-md p-5 rounded-3xl space-y-3 relative overflow-hidden group hover:bg-[#121B4C]/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-400" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> {metrics.avgRoyaltyRate}% Cut
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Royalty Revenue Earned
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black font-mono text-amber-400 tracking-tight flex items-center gap-1">
                <img src={TON_LOGO} alt="TON" className="w-5 h-5 object-contain" />
                {metrics.royaltyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">
                (~${(metrics.royaltyEarnings * 6.8).toFixed(0)})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
            <span>Primary Mint Sales</span>
            <span className="font-mono font-bold text-white">{metrics.primarySales} TON</span>
          </div>
        </div>

        {/* Card 3: Recent Trade Volume */}
        <div className="bg-[#0A113A]/60 backdrop-blur-md p-5 rounded-3xl space-y-3 relative overflow-hidden group hover:bg-[#121B4C]/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <BarChart3 className="w-3 h-3" /> Active Market
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Recent NFT Trade Volume ({dateRange.preset})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black font-mono text-white tracking-tight flex items-center gap-1">
                <img src={TON_LOGO} alt="TON" className="w-5 h-5 object-contain" />
                {metrics.recentTradeVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                {metrics.nftSalesCount} Trades
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
            <span>Unique Collectors</span>
            <span className="font-mono font-bold text-white">{metrics.collectorsCount} Fans</span>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plays vs Trade Volume Trend Chart */}
        <div className="lg:col-span-2 bg-[#0A113A]/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Streaming Velocity & Marketplace Volume Trend
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Correlation between music plays and NFT secondary resale volume
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="playsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1527', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="plays" 
                  name="Audio Streams"
                  stroke="#0052FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#playsGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Trade Vol (TON)"
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#volumeGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Tracks List Widget */}
        <div className="bg-[#0A113A]/60 backdrop-blur-md p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Top Performing Tracks
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Top 5 tracks by play count
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full uppercase">
              {dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate
                ? `${dateRange.startDate} - ${dateRange.endDate}`
                : dateRange.preset}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {topPerformingTracks.map((item) => {
              const isCurrentPlaying = currentTrack?.id === item.id && isPlaying;

              return (
                <div 
                  key={item.id}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between gap-2.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-4 text-center text-xs font-black font-mono shrink-0 ${
                      item.rank === 1 ? 'text-amber-400' : item.rank === 2 ? 'text-slate-300' : item.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                    }`}>
                      #{item.rank}
                    </span>

                    <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-black/40 shrink-0 group">
                      <img 
                        src={item.coverUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <button
                        onClick={() => playTrack(item.trackObj)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none outline-none"
                      >
                        {isCurrentPlaying ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{item.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-blue-400">{item.plays.toLocaleString()}</p>
                      <p className="text-[9px] font-mono text-zinc-400">{item.percentage}% share</p>
                    </div>

                    <button
                      onClick={() => playTrack(item.trackObj)}
                      className="p-1.5 bg-white/5 hover:bg-blue-600 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer border-none outline-none"
                      title={isCurrentPlaying ? "Pause" : "Play"}
                    >
                      {isCurrentPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ROYALTY DISTRIBUTION SPLIT BREAKDOWN */}
      <div className="bg-[#0A113A]/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            On-Chain Royalty Splits
          </h3>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Automated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-white/5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-blue-400" /> Lead Artist Wallet
              </span>
              <span className="font-mono text-emerald-400 font-black">80%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[80%]" />
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Producer / Sound Design
              </span>
              <span className="font-mono text-purple-400 font-black">15%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full w-[15%]" />
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Fan Treasury Vault
              </span>
              <span className="font-mono text-amber-400 font-black">5%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[5%]" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 rounded-2xl text-[11px] text-zinc-300 font-medium flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            All secondary marketplace royalties are dispatched instantly to splits addresses via TON Smart Contract opcode 0x3e7f45bd.
          </span>
        </div>
      </div>

      {/* 3. MUSIC NFT ASSET PERFORMANCE BREAKDOWN TABLE */}
      <div className="bg-[#0A113A]/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Music NFT Portfolio Performance
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Individual metrics for each minted track artifact
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {musicNFTsList.length} Tracks Minted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 px-2">Music NFT Track</th>
                <th className="pb-3 px-2">Total Plays</th>
                <th className="pb-3 px-2">Floor Price</th>
                <th className="pb-3 px-2">Secondary Vol</th>
                <th className="pb-3 px-2">Royalty Earned</th>
                <th className="pb-3 px-2 text-right">Minted</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {musicNFTsList.map((item) => {
                const isCurrentPlaying = currentTrack?.id === item.id && isPlaying;

                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 shrink-0 group">
                          <img 
                            src={item.coverUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <button
                            onClick={() => playTrack(item.trackObj)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none outline-none"
                          >
                            {isCurrentPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{item.artist}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-xs font-mono font-bold text-blue-400">
                      {item.plays.toLocaleString()}
                    </td>

                    <td className="py-3 px-2 text-xs font-mono font-bold text-white">
                      {item.floorPrice}
                    </td>

                    <td className="py-3 px-2 text-xs font-mono font-bold text-emerald-400">
                      {item.tradeVolume}
                    </td>

                    <td className="py-3 px-2 text-xs font-mono font-black text-amber-400">
                      {item.royaltyEarned}
                    </td>

                    <td className="py-3 px-2 text-right text-xs font-mono text-zinc-300">
                      {item.mintedCount} / {item.totalSupply}
                    </td>

                    <td className="py-3 px-2 text-right">
                      <button 
                        onClick={() => playTrack(item.trackObj)}
                        className="p-1.5 bg-white/5 hover:bg-primary hover:text-background text-zinc-300 rounded-lg transition-all cursor-pointer border-none outline-none"
                        title="Listen Track"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MINTING STATUS PIPELINE & TOUR MANAGER COMPONENTS */}
      <MintingStatus />
      <LiveTourManager />
      <FanLeaderboardWidget />
    </motion.div>
  );
};

export default CreatorDashboard;
