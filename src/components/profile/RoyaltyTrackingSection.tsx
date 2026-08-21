import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Repeat, 
  Zap, 
  ArrowUpRight, 
  Sparkles, 
  PieChart as PieChartIcon, 
  Calendar, 
  Music, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';

export type TimePeriod = '7D' | '30D' | '90D' | '1Y' | 'ALL';
export type CurrencyMode = 'TON' | 'JAM' | 'USD';

interface RoyaltyRecord {
  id: string;
  txHash: string;
  type: 'primary' | 'secondary';
  nftTitle: string;
  artist: string;
  coverUrl: string;
  salePriceTon: number;
  royaltyPercentage: number;
  royaltyEarnedTon: number;
  buyerAddress: string;
  sellerAddress?: string;
  timestamp: string;
}

interface TopTrackRoyalty {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
  primarySalesTon: number;
  secondarySalesTon: number;
  totalRoyaltyTon: number;
  secondaryRoyaltyRate: number;
  totalMintsSold: number;
  secondaryResalesCount: number;
}

const INITIAL_ROYALTY_LOGS: RoyaltyRecord[] = [
  {
    id: 'royalty-1',
    txHash: '0x8f3c...11a9',
    type: 'secondary',
    nftTitle: 'Solar Pulse Master #01',
    artist: 'DJ Krupy',
    coverUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    salePriceTon: 15.0,
    royaltyPercentage: 7.5,
    royaltyEarnedTon: 1.125,
    buyerAddress: 'EQA4...9921',
    sellerAddress: 'EQC9...4412',
    timestamp: '2 hours ago'
  },
  {
    id: 'royalty-2',
    txHash: '0x3a92...88f1',
    type: 'primary',
    nftTitle: 'Cyber Dream #04',
    artist: 'DJ Krupy',
    coverUrl: 'https://i.postimg.cc/LhhtQkF0/drake.jpg',
    salePriceTon: 8.5,
    royaltyPercentage: 100,
    royaltyEarnedTon: 8.5,
    buyerAddress: 'EQD2...1108',
    timestamp: '5 hours ago'
  },
  {
    id: 'royalty-3',
    txHash: '0x7c14...00e3',
    type: 'secondary',
    nftTitle: 'Genesis Wave Genesis Edition',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    salePriceTon: 22.0,
    royaltyPercentage: 10.0,
    royaltyEarnedTon: 2.2,
    buyerAddress: 'EQB7...5510',
    sellerAddress: 'EQA1...8832',
    timestamp: '1 day ago'
  },
  {
    id: 'royalty-4',
    txHash: '0x9d88...44b2',
    type: 'secondary',
    nftTitle: 'Solar Pulse Master #01',
    artist: 'DJ Krupy',
    coverUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    salePriceTon: 18.5,
    royaltyPercentage: 7.5,
    royaltyEarnedTon: 1.387,
    buyerAddress: 'EQF5...2291',
    sellerAddress: 'EQD8...7710',
    timestamp: '2 days ago'
  },
  {
    id: 'royalty-5',
    txHash: '0x1b22...99d0',
    type: 'primary',
    nftTitle: 'Midnight Neon Echoes',
    artist: 'DJ Krupy',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop',
    salePriceTon: 5.0,
    royaltyPercentage: 100,
    royaltyEarnedTon: 5.0,
    buyerAddress: 'EQE3...6611',
    timestamp: '3 days ago'
  }
];

const INITIAL_TOP_TRACKS: TopTrackRoyalty[] = [
  {
    id: 'track-1',
    title: 'Solar Pulse Master #01',
    coverUrl: 'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
    genre: 'Electronic',
    primarySalesTon: 62.5,
    secondarySalesTon: 28.4,
    totalRoyaltyTon: 90.9,
    secondaryRoyaltyRate: 7.5,
    totalMintsSold: 25,
    secondaryResalesCount: 14
  },
  {
    id: 'track-2',
    title: 'Cyber Dream #04',
    coverUrl: 'https://i.postimg.cc/LhhtQkF0/drake.jpg',
    genre: 'Synthwave',
    primarySalesTon: 42.5,
    secondarySalesTon: 12.8,
    totalRoyaltyTon: 55.3,
    secondaryRoyaltyRate: 10.0,
    totalMintsSold: 18,
    secondaryResalesCount: 8
  },
  {
    id: 'track-3',
    title: 'Genesis Wave Genesis Edition',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    genre: 'Ambient',
    primarySalesTon: 30.0,
    secondarySalesTon: 18.2,
    totalRoyaltyTon: 48.2,
    secondaryRoyaltyRate: 10.0,
    totalMintsSold: 12,
    secondaryResalesCount: 9
  }
];

export const RoyaltyTrackingSection: React.FC = () => {
  const { userProfile, addNotification } = useAudio();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30D');
  const [currency, setCurrency] = useState<CurrencyMode>('TON');
  const [royaltyLogs, setRoyaltyLogs] = useState<RoyaltyRecord[]>(INITIAL_ROYALTY_LOGS);
  const [topTracks, setTopTracks] = useState<TopTrackRoyalty[]>(INITIAL_TOP_TRACKS);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Exchange rate constants
  const TON_TO_JAM = 100;
  const TON_TO_USD = 5.50;

  const formatAmount = (tonVal: number) => {
    if (currency === 'JAM') {
      return `${(tonVal * TON_TO_JAM).toLocaleString(undefined, { maximumFractionDigits: 1 })} JAM`;
    }
    if (currency === 'USD') {
      return `$${(tonVal * TON_TO_USD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${tonVal.toFixed(2)} TON`;
  };

  // Generate chart data dynamic for time period selected
  const chartData = useMemo(() => {
    if (timePeriod === '7D') {
      return [
        { label: 'Mon', primary: 5.0, secondary: 1.1, total: 6.1 },
        { label: 'Tue', primary: 8.5, secondary: 2.3, total: 10.8 },
        { label: 'Wed', primary: 2.0, secondary: 0.8, total: 2.8 },
        { label: 'Thu', primary: 12.0, secondary: 4.2, total: 16.2 },
        { label: 'Fri', primary: 18.5, secondary: 6.5, total: 25.0 },
        { label: 'Sat', primary: 22.0, secondary: 9.1, total: 31.1 },
        { label: 'Sun', primary: 15.0, secondary: 7.8, total: 22.8 },
      ];
    }

    if (timePeriod === '90D') {
      return [
        { label: 'Wk 1-2', primary: 32.0, secondary: 12.4, total: 44.4 },
        { label: 'Wk 3-4', primary: 45.0, secondary: 18.2, total: 63.2 },
        { label: 'Wk 5-6', primary: 28.5, secondary: 14.0, total: 42.5 },
        { label: 'Wk 7-8', primary: 54.0, secondary: 22.8, total: 76.8 },
        { label: 'Wk 9-10', primary: 68.0, secondary: 31.5, total: 99.5 },
        { label: 'Wk 11-12', primary: 82.0, secondary: 42.0, total: 124.0 },
      ];
    }

    if (timePeriod === '1Y' || timePeriod === 'ALL') {
      return [
        { label: 'Jan', primary: 25.0, secondary: 8.2, total: 33.2 },
        { label: 'Feb', primary: 38.0, secondary: 14.5, total: 52.5 },
        { label: 'Mar', primary: 42.0, secondary: 19.0, total: 61.0 },
        { label: 'Apr', primary: 55.0, secondary: 28.4, total: 83.4 },
        { label: 'May', primary: 68.0, secondary: 35.2, total: 103.2 },
        { label: 'Jun', primary: 84.0, secondary: 46.8, total: 130.8 },
        { label: 'Jul', primary: 95.0, secondary: 54.0, total: 149.0 },
        { label: 'Aug', primary: 112.0, secondary: 62.5, total: 174.5 },
      ];
    }

    // Default 30D (4 Weeks)
    return [
      { label: 'Week 1', primary: 18.5, secondary: 6.2, total: 24.7 },
      { label: 'Week 2', primary: 28.0, secondary: 11.4, total: 39.4 },
      { label: 'Week 3', primary: 35.5, secondary: 18.2, total: 53.7 },
      { label: 'Week 4', primary: 53.0, secondary: 23.6, total: 76.6 },
    ];
  }, [timePeriod]);

  // Aggregate stats from current state
  const stats = useMemo(() => {
    const totalPrimaryTon = royaltyLogs
      .filter(l => l.type === 'primary')
      .reduce((sum, l) => sum + l.royaltyEarnedTon, 0) + 115.0; // base historical offset

    const totalSecondaryTon = royaltyLogs
      .filter(l => l.type === 'secondary')
      .reduce((sum, l) => sum + l.royaltyEarnedTon, 0) + 54.7; // base historical offset

    const grandTotalTon = totalPrimaryTon + totalSecondaryTon;
    const secondaryPercentage = Math.round((totalSecondaryTon / grandTotalTon) * 100) || 32;

    return {
      totalPrimaryTon,
      totalSecondaryTon,
      grandTotalTon,
      secondaryPercentage,
      primaryPercentage: 100 - secondaryPercentage,
      totalTransactions: royaltyLogs.length + 31
    };
  }, [royaltyLogs]);

  // Trigger test secondary resale event
  const handleSimulateResale = () => {
    const randomTrack = topTracks[Math.floor(Math.random() * topTracks.length)];
    const simulatedSalePrice = Math.floor(Math.random() * 20) + 10;
    const royaltyRate = randomTrack.secondaryRoyaltyRate;
    const earnedRoyalty = Number(((simulatedSalePrice * royaltyRate) / 100).toFixed(3));

    const newLog: RoyaltyRecord = {
      id: `royalty-sim-${Date.now()}`,
      txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      type: 'secondary',
      nftTitle: randomTrack.title,
      artist: userProfile?.name || 'DJ Krupy',
      coverUrl: randomTrack.coverUrl,
      salePriceTon: simulatedSalePrice,
      royaltyPercentage: royaltyRate,
      royaltyEarnedTon: earnedRoyalty,
      buyerAddress: `EQ${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.floor(Math.random()*89+10)}`,
      sellerAddress: `EQ${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.floor(Math.random()*89+10)}`,
      timestamp: 'Just now'
    };

    setRoyaltyLogs(prev => [newLog, ...prev]);

    // Update top track stats
    setTopTracks(prev => prev.map(t => {
      if (t.id === randomTrack.id) {
        return {
          ...t,
          secondarySalesTon: Number((t.secondarySalesTon + earnedRoyalty).toFixed(2)),
          totalRoyaltyTon: Number((t.totalRoyaltyTon + earnedRoyalty).toFixed(2)),
          secondaryResalesCount: t.secondaryResalesCount + 1
        };
      }
      return t;
    }));

    addNotification(`⚡ Secondary Resale Royalty Received: +${earnedRoyalty} TON on "${randomTrack.title}"!`, "success", 6000);
    toast.success(`Resale Royalty Earned!`, {
      description: `+${earnedRoyalty} TON automatically deposited via TON smart contract.`
    });
  };

  return (
    <div className="space-y-6 text-white font-sans" id="royalty-tracking-section">
      
      {/* 1. Header Banner & Currency / Period Selectors */}
      <div className="bg-[#101A3B]/70 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-[#0052FF]/20 text-[#0052FF]">
              <Coins className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Smart Contract Audio Royalties
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Automated TON Splits
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Royalty Income Tracking
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1 max-w-xl">
            Real-time visual ledger tracking income from primary music NFT drops and automated secondary market resale splits configured on the TON blockchain.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex bg-[#050A24] p-1 rounded-2xl">
            {(['TON', 'JAM', 'USD'] as CurrencyMode[]).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  currency === curr
                    ? 'bg-[#0052FF] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="flex bg-[#050A24] p-1 rounded-2xl">
            {(['7D', '30D', '90D', '1Y', 'ALL'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timePeriod === period
                    ? 'bg-white/10 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Simulate Resale Royalty Button */}
          <button
            onClick={handleSimulateResale}
            title="Simulate a secondary market resale royalty payout"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-[#0052FF] hover:from-purple-500 hover:to-[#0041CC] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            Simulate Resale Split
          </button>
        </div>
      </div>

      {/* 2. Top Royalty Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Royalty Card */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Total Royalty Income
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {formatAmount(stats.grandTotalTon)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-emerald-400">
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              +18.4%
            </span>
            <span className="text-slate-400 font-medium">vs last period</span>
          </div>
        </div>

        {/* Primary Mint Sales */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Primary Sales (Initial Mints)
              </p>
              <h3 className="text-2xl font-black text-blue-400 tracking-tight">
                {formatAmount(stats.totalPrimaryTon)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-white">{stats.primaryPercentage}%</span>
            <span>of overall earnings</span>
          </div>
        </div>

        {/* Secondary Resale Royalties */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Secondary Resale Royalties
              </p>
              <h3 className="text-2xl font-black text-purple-400 tracking-tight">
                {formatAmount(stats.totalSecondaryTon)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-purple-300">{stats.secondaryPercentage}%</span>
            <span>automatic contract splits</span>
          </div>
        </div>

        {/* Smart Contract Settings / Avg Royalty % */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Avg Royalty Split Rate
              </p>
              <h3 className="text-2xl font-black text-amber-400 tracking-tight">
                8.2%
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-slate-200">{stats.totalTransactions}</span>
            <span>on-chain transactions logged</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Royalty Chart Over Time */}
      <div className="bg-[#101A3B]/60 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0052FF]" />
              Royalty Income Performance Over Time
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Comparing primary mint revenue vs secondary market resale royalty streams
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart type toggle */}
            <div className="flex bg-[#050A24] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartType === 'area' ? 'bg-white/10 text-white' : 'text-slate-400'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartType === 'bar' ? 'bg-white/10 text-white' : 'text-slate-400'
                }`}
              >
                Bar
              </button>
            </div>

            {/* Legend badges */}
            <div className="hidden md:flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 rounded-sm bg-[#0052FF]" />
                Primary Sales
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-3 rounded-sm bg-purple-500" />
                Secondary Royalties
              </span>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050A24', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} ${currency === 'JAM' ? 'JAM' : currency === 'USD' ? 'USD' : 'TON'}`, '']}
                />
                <Area type="monotone" dataKey="primary" name="Primary Sales" stroke="#0052FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" isAnimationActive={false} />
                <Area type="monotone" dataKey="secondary" name="Secondary Royalties" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorSecondary)" isAnimationActive={false} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050A24', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Bar dataKey="primary" name="Primary Sales" fill="#0052FF" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="secondary" name="Secondary Royalties" fill="#A855F7" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Primary vs Secondary Revenue Breakdown Ratio Bar */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-blue-400">Primary Sales: {stats.primaryPercentage}%</span>
            <span className="text-purple-400">Secondary Resales: {stats.secondaryPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-[#050A24] rounded-full overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-[#0052FF] to-blue-400 h-full transition-all duration-500" 
              style={{ width: `${stats.primaryPercentage}%` }} 
            />
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${stats.secondaryPercentage}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 4. Two Column Layout: Top Earning NFT Music Tracks & Recent On-Chain Royalty Payout Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Earning NFT Music Tracks */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Top Royalty Generating Tracks
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {topTracks.length} Active Collections
            </span>
          </div>

          <div className="space-y-3">
            {topTracks.map((track) => (
              <div 
                key={track.id}
                className="p-3.5 rounded-2xl bg-[#050A24] hover:bg-white/5 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={track.coverUrl} 
                    alt={track.title} 
                    className="w-12 h-12 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform" 
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate">
                      {track.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                        {track.genre}
                      </span>
                      <span>{track.totalMintsSold} Primary Mints</span>
                      <span>•</span>
                      <span>{track.secondaryResalesCount} Resales</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-emerald-400">
                    {formatAmount(track.totalRoyaltyTon)}
                  </div>
                  <div className="text-[10px] font-bold text-purple-300 mt-0.5">
                    {track.secondaryRoyaltyRate}% Resale Royalty
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: On-Chain Royalty Distribution Log */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Live Royalty Payout Feed
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Smart Contract Verified
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
            <AnimatePresence initial={false}>
              {royaltyLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-2xl bg-[#050A24] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={log.coverUrl} 
                      alt={log.nftTitle} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          log.type === 'secondary'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {log.type === 'secondary' ? 'Secondary Resale' : 'Primary Mint'}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <h5 className="font-bold text-white text-xs truncate mt-1">
                        {log.nftTitle}
                      </h5>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                        Buyer: {log.buyerAddress} {log.sellerAddress ? `| Seller: ${log.sellerAddress}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-emerald-400 text-xs">
                      +{formatAmount(log.royaltyEarnedTon)}
                    </div>
                    <a
                      href={`https://tonscan.org/tx/${log.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center justify-end gap-1 mt-0.5"
                    >
                      {log.txHash} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RoyaltyTrackingSection;
