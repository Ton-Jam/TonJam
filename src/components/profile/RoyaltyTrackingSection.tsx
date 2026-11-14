import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Repeat, 
  Zap, 
  Music, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink
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
  Tooltip
} from 'recharts';
import { useAudio } from '@/contexts/AudioContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';

export type TimePeriod = '7D' | '30D' | '90D' | '1Y' | 'ALL';
export type CurrencyMode = 'TON' | 'JAM' | 'USD';

interface RoyaltyRecord {
  id: string;
  txHash: string;
  type: 'primary' | 'secondary';
  nftTitle: string;
  artist: string;
  coverUrl?: string;
  salePriceTon: number;
  royaltyPercentage: number;
  royaltyEarnedTon: number;
  buyerAddress: string;
  sellerAddress?: string;
  timestamp: string;
  rawDate: Date;
}

interface TopTrackRoyalty {
  id: string;
  title: string;
  coverUrl?: string;
  genre: string;
  primarySalesTon: number;
  secondarySalesTon: number;
  totalRoyaltyTon: number;
  secondaryRoyaltyRate: number;
  totalMintsSold: number;
  secondaryResalesCount: number;
}

export const RoyaltyTrackingSection: React.FC = () => {
  const { userProfile } = useAudio();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30D');
  const [currency, setCurrency] = useState<CurrencyMode>('TON');
  const [royaltyLogs, setRoyaltyLogs] = useState<RoyaltyRecord[]>([]);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    const uid = auth.currentUser?.uid || userProfile?.uid;
    if (!uid) {
      setRoyaltyLogs([]);
      return;
    }

    const q = query(collection(db, 'nftSales'), where('creatorId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: RoyaltyRecord[] = snap.docs.map((d) => {
          const data = d.data();
          const dt = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now());
          const price = parseFloat(String(data.price || 0)) || 0;
          const isSecondary = Boolean(data.isSecondary || (data.sellerId && data.sellerId !== uid));
          const royaltyPct = isSecondary ? Number(data.royaltyPercentage || 5) : 100;
          const earned = Number(data.royaltyAmount ?? (isSecondary ? (price * royaltyPct) / 100 : price));

          return {
            id: d.id,
            txHash: data.txHash || '',
            type: (isSecondary ? 'secondary' : 'primary') as RoyaltyRecord['type'],
            nftTitle: data.nftTitle || data.title || 'Music NFT',
            artist: userProfile?.name || data.artist || 'Creator',
            coverUrl: data.coverUrl || data.imageUrl || '',
            salePriceTon: price,
            royaltyPercentage: royaltyPct,
            royaltyEarnedTon: Number(earned.toFixed(3)),
            buyerAddress: data.buyerAddress || data.buyerId || 'TON Wallet',
            sellerAddress: data.sellerAddress,
            timestamp: dt.toLocaleDateString(),
            rawDate: dt,
          };
        }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        setRoyaltyLogs(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'nftSales');
      }
    );

    return () => unsub();
  }, [userProfile?.uid, userProfile?.name]);

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

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const daysMap: Record<TimePeriod, number> = {
      '7D': 7,
      '30D': 30,
      '90D': 90,
      '1Y': 365,
      'ALL': 36500,
    };
    const cutoff = now - daysMap[timePeriod] * 24 * 60 * 60 * 1000;
    return royaltyLogs.filter((l) => l.rawDate.getTime() >= cutoff);
  }, [royaltyLogs, timePeriod]);

  const chartData = useMemo(() => {
    const buckets: Record<string, { label: string; primary: number; secondary: number; total: number }> = {};
    filteredLogs.forEach((log) => {
      const label = log.rawDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (!buckets[label]) {
        buckets[label] = { label, primary: 0, secondary: 0, total: 0 };
      }
      if (log.type === 'primary') {
        buckets[label].primary = Number((buckets[label].primary + log.royaltyEarnedTon).toFixed(2));
      } else {
        buckets[label].secondary = Number((buckets[label].secondary + log.royaltyEarnedTon).toFixed(2));
      }
      buckets[label].total = Number((buckets[label].primary + buckets[label].secondary).toFixed(2));
    });
    return Object.values(buckets).slice(-12);
  }, [filteredLogs]);

  const topTracks = useMemo<TopTrackRoyalty[]>(() => {
    const byTitle: Record<string, TopTrackRoyalty> = {};
    filteredLogs.forEach((log) => {
      if (!byTitle[log.nftTitle]) {
        byTitle[log.nftTitle] = {
          id: log.id,
          title: log.nftTitle,
          coverUrl: log.coverUrl,
          genre: 'Music NFT',
          primarySalesTon: 0,
          secondarySalesTon: 0,
          totalRoyaltyTon: 0,
          secondaryRoyaltyRate: log.type === 'secondary' ? log.royaltyPercentage : 5,
          totalMintsSold: 0,
          secondaryResalesCount: 0,
        };
      }
      const entry = byTitle[log.nftTitle];
      if (log.type === 'primary') {
        entry.primarySalesTon += log.royaltyEarnedTon;
        entry.totalMintsSold += 1;
      } else {
        entry.secondarySalesTon += log.royaltyEarnedTon;
        entry.secondaryResalesCount += 1;
        entry.secondaryRoyaltyRate = log.royaltyPercentage;
      }
      entry.totalRoyaltyTon = Number((entry.primarySalesTon + entry.secondarySalesTon).toFixed(2));
    });
    return Object.values(byTitle).sort((a, b) => b.totalRoyaltyTon - a.totalRoyaltyTon);
  }, [filteredLogs]);

  const stats = useMemo(() => {
    const totalPrimaryTon = filteredLogs
      .filter(l => l.type === 'primary')
      .reduce((sum, l) => sum + l.royaltyEarnedTon, 0);

    const totalSecondaryTon = filteredLogs
      .filter(l => l.type === 'secondary')
      .reduce((sum, l) => sum + l.royaltyEarnedTon, 0);

    const grandTotalTon = totalPrimaryTon + totalSecondaryTon;
    const secondaryPercentage = grandTotalTon > 0 ? Math.round((totalSecondaryTon / grandTotalTon) * 100) : 0;
    const primaryPercentage = grandTotalTon > 0 ? 100 - secondaryPercentage : 0;

    const secondaryLogs = filteredLogs.filter(l => l.type === 'secondary');
    const avgRate = secondaryLogs.length > 0
      ? (secondaryLogs.reduce((s, l) => s + l.royaltyPercentage, 0) / secondaryLogs.length).toFixed(1)
      : '0.0';

    return {
      totalPrimaryTon,
      totalSecondaryTon,
      grandTotalTon,
      secondaryPercentage,
      primaryPercentage,
      avgRate,
      totalTransactions: filteredLogs.length
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-6 text-white font-sans" id="royalty-tracking-section">
      {/* Header Banner */}
      <div className="bg-[#101A3B]/70 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-[#0052FF]/20 text-[#0052FF]">
              <Coins className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Smart Contract Audio Royalties
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Royalty Income Tracking
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1 max-w-xl">
            Live ledger tracking income from primary music NFT drops and automated secondary market resale splits on the TON blockchain.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      {/* Top Royalty Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span>{stats.totalTransactions} verified sales</span>
          </div>
        </div>

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

        <div className="bg-[#101A3B]/60 backdrop-blur-md p-5 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Avg Royalty Split Rate
              </p>
              <h3 className="text-2xl font-black text-amber-400 tracking-tight">
                {stats.avgRate}%
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

      {/* Chart */}
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
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No royalty payouts recorded in this period yet.
            </div>
          ) : (
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
                    formatter={(value: any) => [`${value} TON`, '']}
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
          )}
        </div>

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

      {/* Bottom Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Earning Tracks */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Top Royalty Generating Tracks
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {topTracks.length} Active
            </span>
          </div>

          {topTracks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No NFT sales recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topTracks.map((track) => (
                <div 
                  key={track.id}
                  className="p-3.5 rounded-2xl bg-[#050A24] hover:bg-white/5 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {track.coverUrl ? (
                      <img 
                        src={track.coverUrl} 
                        alt={track.title} 
                        className="w-12 h-12 rounded-xl object-cover shadow-md" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate">
                        {track.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
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
          )}
        </div>

        {/* Live Royalty Payout Feed */}
        <div className="bg-[#101A3B]/60 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Live Royalty Payout Feed
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Firestore Synced
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No royalty payouts recorded yet.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-2xl bg-[#050A24] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {log.coverUrl ? (
                        <img 
                          src={log.coverUrl} 
                          alt={log.nftTitle} 
                          className="w-10 h-10 rounded-xl object-cover shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
                      )}
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
                      {log.txHash && (
                        <a
                          href={`https://tonscan.org/tx/${log.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center justify-end gap-1 mt-0.5"
                        >
                          {log.txHash.slice(0, 10)} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyaltyTrackingSection;
