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
  Music,
  Bell,
  X,
  ChevronRight,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { TON_LOGO } from '@/constants';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getPlaceholderImage } from '@/lib/utils';
import { toast } from 'sonner';

import FanLeaderboardWidget from './FanLeaderboardWidget';
import MintingStatus from './MintingStatus';
import LiveTourManager from './LiveTourManager';
import ArtistVerificationSection from './ArtistVerificationSection';

import { DateRangePicker, DateRangeState } from './DateRangePicker';

export interface TrackMilestone {
  id: string;
  trackTitle: string;
  type: 'plays' | 'revenue' | 'rank' | 'sales';
  title: string;
  description: string;
  metric: string;
  timeAgo: string;
  isNew?: boolean;
}

interface CreatorSaleRecord {
  id: string;
  price?: number | string;
  amount?: number | string;
  royaltyAmount?: number | string;
  buyerId?: string;
  nftId?: string;
  timestamp?: any;
  createdAt?: any;
  isPrimary?: boolean;
}

export const CreatorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { nfts } = useNFT();
  const { allTracks, currentTrack, isPlaying, playTrack } = useAudio();

  const [dateRange, setDateRange] = useState<DateRangeState>({ preset: '7d' });
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'royalties' | 'fans'>('overview');
  const [sales, setSales] = useState<CreatorSaleRecord[]>([]);
  const [readMilestoneIds, setReadMilestoneIds] = useState<Record<string, boolean>>({});
  const [isMilestoneMenuOpen, setIsMilestoneMenuOpen] = useState(false);

  // Subscribe to creator's live NFT sales in Firestore
  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) {
      setSales([]);
      return;
    }

    const q = query(collection(db, 'nftSales'), where('creatorId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CreatorSaleRecord, 'id'>),
        }));
        setSales(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'nftSales');
      }
    );
    return () => unsub();
  }, [userProfile?.uid]);

  const creatorTracks = useMemo(() => {
    if (!userProfile?.uid && !userProfile?.name) return allTracks || [];
    const matched = (allTracks || []).filter(
      (t) =>
        (userProfile?.uid && t.artistId === userProfile.uid) ||
        (userProfile?.name && t.artist?.toLowerCase() === userProfile.name.toLowerCase())
    );
    return matched;
  }, [allTracks, userProfile?.uid, userProfile?.name]);

  const creatorNfts = useMemo(() => {
    if (!userProfile?.uid && !userProfile?.name) return [];
    return (nfts || []).filter(
      (n) =>
        (userProfile?.uid && n.creatorId === userProfile.uid) ||
        (userProfile?.name && n.creator?.toLowerCase() === userProfile.name.toLowerCase())
    );
  }, [nfts, userProfile?.uid, userProfile?.name]);

  // Filter sales by active date range
  const filteredSales = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    if (dateRange.preset === '24h') cutoff = now - 24 * 60 * 60 * 1000;
    else if (dateRange.preset === '7d') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange.preset === '30d') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange.preset === '90d') cutoff = now - 90 * 24 * 60 * 60 * 1000;
    else if (dateRange.preset === 'ytd') cutoff = new Date(new Date().getFullYear(), 0, 1).getTime();
    else if (dateRange.preset === 'custom' && dateRange.startDate) {
      cutoff = new Date(dateRange.startDate).getTime();
    }

    const endCutoff =
      dateRange.preset === 'custom' && dateRange.endDate
        ? new Date(dateRange.endDate).getTime() + 86400000
        : now + 86400000;

    return sales.filter((s) => {
      const rawTs = s.timestamp || s.createdAt;
      const ms = rawTs?.toMillis ? rawTs.toMillis() : rawTs ? new Date(rawTs).getTime() : 0;
      if (!ms) return dateRange.preset === 'all';
      return ms >= cutoff && ms <= endCutoff;
    });
  }, [sales, dateRange]);

  const milestones: TrackMilestone[] = useMemo(() => {
    const derived: TrackMilestone[] = [];
    creatorTracks.forEach((track) => {
      const plays = track.playCount ?? (track as any).plays ?? 0;
      if (plays >= 100) {
        derived.push({
          id: `m-plays-${track.id}`,
          trackTitle: track.title,
          type: 'plays',
          title: `${plays.toLocaleString()} Streams Reached`,
          description: `"${track.title}" reached ${plays.toLocaleString()} real streams on TonJam.`,
          metric: `${plays.toLocaleString()} Plays`,
          timeAgo: 'Live',
          isNew: !readMilestoneIds[`m-plays-${track.id}`],
        });
      }
    });
    if (sales.length > 0) {
      const totalSaleVol = sales.reduce((acc, s) => acc + (Number(s.price ?? s.amount) || 0), 0);
      derived.push({
        id: 'm-sales-total',
        trackTitle: 'NFT Catalog',
        type: 'sales',
        title: `${sales.length} Verified NFT Sale${sales.length > 1 ? 's' : ''}`,
        description: `Total recorded marketplace volume of ${totalSaleVol.toFixed(2)} TON across your releases.`,
        metric: `${totalSaleVol.toFixed(2)} TON Volume`,
        timeAgo: 'Live',
        isNew: !readMilestoneIds['m-sales-total'],
      });
    }
    return derived;
  }, [creatorTracks, sales, readMilestoneIds]);

  const unreadMilestonesCount = useMemo(() => {
    return milestones.filter((m) => m.isNew).length;
  }, [milestones]);

  const triggerMilestoneToast = (milestone: TrackMilestone) => {
    toast.custom(
      (id) => (
        <div className="flex items-start gap-3 w-full max-w-md bg-[#0D1527] border border-amber-500/40 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Milestone Unlocked
              </span>
              <span className="text-[9px] font-mono text-zinc-400">{milestone.timeAgo}</span>
            </div>
            <h4 className="text-xs font-black text-white mt-1 truncate">{milestone.title}</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">{milestone.description}</p>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono font-bold text-cyan-400">{milestone.metric}</span>
              <button
                onClick={() => toast.dismiss(id)}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border-none bg-transparent"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const handleMarkAllRead = () => {
    const next: Record<string, boolean> = {};
    milestones.forEach((m) => {
      next[m.id] = true;
    });
    setReadMilestoneIds((prev) => ({ ...prev, ...next }));
  };

  // Real metrics computation from Firestore data
  const metrics = useMemo(() => {
    const totalPlays = creatorTracks.reduce(
      (sum, t) => sum + (Number(t.playCount ?? (t as any).plays ?? 0) || 0),
      0
    );

    const avgRoyaltyRate =
      creatorNfts.length > 0
        ? parseFloat(
            (
              creatorNfts.reduce((sum, n) => sum + (Number(n.royalty) || 0), 0) /
              creatorNfts.length
            ).toFixed(1)
          )
        : 0;

    let primarySales = 0;
    let royaltyEarnings = 0;
    let recentTradeVolume = 0;
    const uniqueBuyers = new Set<string>();

    filteredSales.forEach((s) => {
      const val = Number(s.price ?? s.amount ?? 0) || 0;
      recentTradeVolume += val;
      if (s.isPrimary) {
        primarySales += val;
      } else {
        const royalty =
          s.royaltyAmount !== undefined
            ? Number(s.royaltyAmount) || 0
            : val * (avgRoyaltyRate / 100);
        royaltyEarnings += royalty;
      }
      if (s.buyerId) uniqueBuyers.add(s.buyerId);
    });

    creatorNfts.forEach((n) => {
      if (n.ownerId && n.ownerId !== userProfile?.uid) uniqueBuyers.add(n.ownerId);
    });

    return {
      totalPlays,
      royaltyEarnings: parseFloat(royaltyEarnings.toFixed(2)),
      primarySales: parseFloat(primarySales.toFixed(2)),
      totalEarnings: parseFloat((primarySales + royaltyEarnings).toFixed(2)),
      recentTradeVolume: parseFloat(recentTradeVolume.toFixed(2)),
      nftSalesCount: filteredSales.length,
      collectorsCount: uniqueBuyers.size,
      avgRoyaltyRate,
    };
  }, [creatorTracks, creatorNfts, filteredSales, userProfile?.uid]);

  // Real time-bucketed chart data
  const chartData = useMemo(() => {
    const bucketLabels =
      dateRange.preset === '24h'
        ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        : dateRange.preset === '7d'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

    const buckets = bucketLabels.map((label) => ({
      label,
      plays: 0,
      volume: 0,
      royalties: 0,
    }));

    filteredSales.forEach((s) => {
      const rawTs = s.timestamp || s.createdAt;
      const date = rawTs?.toDate ? rawTs.toDate() : rawTs ? new Date(rawTs) : null;
      if (!date || isNaN(date.getTime())) return;

      let idx = 0;
      if (dateRange.preset === '24h') {
        idx = Math.min(buckets.length - 1, Math.floor(date.getHours() / 4));
      } else if (dateRange.preset === '7d') {
        idx = (date.getDay() + 6) % 7;
      } else {
        idx = Math.min(buckets.length - 1, Math.floor((date.getDate() - 1) / 8));
      }

      const val = Number(s.price ?? s.amount ?? 0) || 0;
      buckets[idx].volume = parseFloat((buckets[idx].volume + val).toFixed(2));
      const royalty =
        s.royaltyAmount !== undefined
          ? Number(s.royaltyAmount) || 0
          : val * (metrics.avgRoyaltyRate / 100);
      buckets[idx].royalties = parseFloat((buckets[idx].royalties + royalty).toFixed(2));
    });

    if (buckets.length > 0 && metrics.totalPlays > 0) {
      buckets[buckets.length - 1].plays = metrics.totalPlays;
    }

    return buckets;
  }, [dateRange.preset, filteredSales, metrics.avgRoyaltyRate, metrics.totalPlays]);

  // Specific Music NFT list with real Firestore metrics
  const musicNFTsList = useMemo(() => {
    return creatorNfts.map((nftItem) => {
      const trackMatch = creatorTracks.find((t) => t.id === nftItem.trackId || t.id === nftItem.id);
      const itemSales = sales.filter((s) => s.nftId === nftItem.id);
      const tradeVolume = itemSales.reduce((acc, s) => acc + (Number(s.price ?? s.amount) || 0), 0);
      const royaltyRate = Number(nftItem.royalty) || 0;
      const royaltyEarned = itemSales.reduce(
        (acc, s) =>
          acc +
          (s.royaltyAmount !== undefined
            ? Number(s.royaltyAmount) || 0
            : s.isPrimary
            ? 0
            : (Number(s.price ?? s.amount) || 0) * (royaltyRate / 100)),
        0
      );

      return {
        id: nftItem.id,
        title: nftItem.title,
        artist: nftItem.creator || userProfile?.name || 'Artist',
        coverUrl: nftItem.imageUrl || trackMatch?.coverUrl || getPlaceholderImage(`nft-${nftItem.id}`),
        plays: Number(trackMatch?.playCount ?? (trackMatch as any)?.plays ?? 0) || 0,
        floorPrice: nftItem.price ? `${nftItem.price} TON` : '—',
        tradeVolume: `${tradeVolume.toFixed(2)} TON`,
        royaltyEarned: `${royaltyEarned.toFixed(2)} TON`,
        mintedCount: nftItem.minted ?? 0,
        totalSupply: nftItem.supply ?? 1,
        trackObj: trackMatch || ({
          id: nftItem.trackId || nftItem.id,
          title: nftItem.title,
          artist: nftItem.creator,
          artistId: nftItem.creatorId || '',
          coverUrl: nftItem.imageUrl,
          audioUrl: (nftItem as any).audioUrl || '',
          duration: 0,
          genre: (nftItem as any).genre || '',
        } as any),
      };
    });
  }, [creatorNfts, creatorTracks, sales, userProfile?.name]);

  // Top performing tracks list calculated from real play counts
  const topPerformingTracks = useMemo(() => {
    const processed = creatorTracks.map((track, idx) => {
      const plays = Number(track.playCount ?? (track as any).plays ?? 0) || 0;
      return {
        id: track.id || `top-track-${idx}`,
        title: track.title,
        artist: track.artist || userProfile?.name || 'Artist',
        coverUrl: track.coverUrl || getPlaceholderImage(`track-${track.id}`),
        plays,
        trackObj: track,
      };
    });

    processed.sort((a, b) => b.plays - a.plays);
    const top5 = processed.slice(0, 5);
    const totalPlays = top5.reduce((sum, item) => sum + item.plays, 0);

    return top5.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: totalPlays > 0 ? Math.round((item.plays / totalPlays) * 100) : 0,
    }));
  }, [creatorTracks, userProfile?.name]);

  const handleExportData = () => {
    const rangeName =
      dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate
        ? `${dateRange.startDate}_to_${dateRange.endDate}`
        : dateRange.preset;

    const rows = [
      ['Title', 'Artist', 'Plays', 'Floor Price', 'Trade Volume', 'Royalty Earned'],
      ...musicNFTsList.map((n) => [
        n.title,
        n.artist,
        String(n.plays),
        n.floorPrice,
        n.tradeVolume,
        n.royaltyEarned,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TonJam_Creator_Analytics_${rangeName}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Exported Creator Royalty & Analytics Report', {
      description: `Downloaded TonJam_Creator_Analytics_${rangeName}.csv`,
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
        <div className="flex flex-wrap items-center gap-2 relative">
          {/* Milestone Alerts Popover Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMilestoneMenuOpen(!isMilestoneMenuOpen)}
              className={cn(
                "px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none outline-none relative",
                unreadMilestonesCount > 0
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300"
              )}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Milestones</span>
              {unreadMilestonesCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Milestones Dropdown Menu */}
            <AnimatePresence>
              {isMilestoneMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0D1527] rounded-3xl p-4 shadow-2xl z-50 text-white border border-white/10"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">Track Milestones & Alerts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadMilestonesCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9px] font-bold text-amber-400 hover:underline px-2 py-1 rounded bg-amber-500/10 border-none outline-none cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => setIsMilestoneMenuOpen(false)}
                        className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors border-none outline-none cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {milestones.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-6">No milestones unlocked yet.</p>
                    ) : (
                      milestones.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "p-2.5 rounded-2xl transition-all border border-white/5 space-y-1 relative group",
                            m.isNew ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {m.title}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">{m.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-zinc-200 font-medium leading-snug">{m.description}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <span className="text-[10px] font-mono font-bold text-cyan-400">{m.metric}</span>
                            <button
                              onClick={() => triggerMilestoneToast(m)}
                              className="text-[9px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg transition-all cursor-pointer border-none outline-none"
                            >
                              Show Alert
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

      {/* Creator Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border-none outline-none",
            activeTab === 'overview' 
              ? "bg-white/10 text-white shadow-lg" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Analytics & Intelligence
        </button>
        <button
          onClick={() => setActiveTab('nfts')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border-none outline-none",
            activeTab === 'nfts' 
              ? "bg-cyan-500/20 text-cyan-400 shadow-lg" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Artist Verification
        </button>
      </div>

      {activeTab === 'nfts' ? (
        <ArtistVerificationSection />
      ) : (
        <>
          {/* 1. CORE THREE METRICS CARDS (Total Plays, Royalty Earnings, Recent Trade Volume) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Music NFT Plays */}
        <div className="bg-[#0A113A]/60 backdrop-blur-md p-5 rounded-3xl space-y-3 relative overflow-hidden group hover:bg-[#121B4C]/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              <Music className="w-3 h-3" /> {creatorTracks.length} Tracks
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Total Track Plays
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black font-mono text-white tracking-tight">
                {metrics.totalPlays.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-blue-400 uppercase">Streams</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
            <span>Catalog Releases</span>
            <span className="font-mono font-bold text-white">{creatorTracks.length} Published</span>
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
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Trade Vol (TON)"
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#volumeGradient)" 
                  isAnimationActive={false}
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
                          e.currentTarget.src = getPlaceholderImage(`track-${item.id}`);
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
                              e.currentTarget.src = getPlaceholderImage(`nft-${item.id}`);
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
        </>
      )}
    </motion.div>
  );
};

export default CreatorDashboard;
