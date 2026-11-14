import { sendTransactionSafe } from "../services/tonService";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Sliders,
  ChevronRight,
  ShoppingBag,
  Info,
  DollarSign,
  Download,
  FileSpreadsheet,
  ArrowDownToLine,
  Wallet
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';
import { Button } from '@/components/ui/button';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export interface SecondarySaleRecord {
  id: string;
  nftId: string;
  nftTitle: string;
  nftImageUrl: string;
  resellPrice: number; // in TON
  royaltyRate: number; // e.g. 0.075 for 7.5%
  royaltyAmount: number; // in TON
  seller: string;
  buyer: string;
  timestamp: string;
  status: 'pending' | 'settled';
}

interface RoyaltyStatusCardProps {
  className?: string;
  artistName?: string;
}

export const RoyaltyStatusCard: React.FC<RoyaltyStatusCardProps> = ({ 
  className,
  artistName
}) => {
  const { userProfile } = useAuth();
  const { addNotification, allNFTs = [] } = useAudio();
  const { price: tonPriceUsd = 6.25 } = useTonPrice?.() || { price: 6.25 };
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress() || userProfile?.walletAddress;

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [salesHistory, setSalesHistory] = useState<SecondarySaleRecord[]>([]);

  React.useEffect(() => {
    let active = true;
    const loadRoyaltyTransactions = async () => {
      if (!userProfile?.uid) return;
      try {
        const q = query(
          collection(db, 'transactions'),
          where('participants', 'array-contains', userProfile.uid),
          orderBy('timestamp', 'desc'),
          limit(30)
        );
        const snap = await getDocs(q);
        if (!active) return;
        const rows: SecondarySaleRecord[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.type === 'nft_sale' || data.type === 'nft_resale_royalty') {
            const resellPrice = Number(data.amount || 0);
            const royaltyAmount = Number(data.artistShare || 0);
            const royaltyRate = resellPrice > 0 ? royaltyAmount / resellPrice : 0.075;
            rows.push({
              id: docSnap.id,
              nftId: data.nftId || '',
              nftTitle: data.trackTitle || data.nftTitle || 'Music NFT Sale',
              nftImageUrl: data.imageUrl || getPlaceholderImage('nft'),
              resellPrice,
              royaltyRate,
              royaltyAmount,
              seller: data.senderAddress || '',
              buyer: data.recipientAddress || '',
              timestamp: data.timestamp || new Date().toISOString(),
              status: data.status === 'completed' || data.status === 'settled' ? 'settled' : 'pending',
            });
          }
        });
        setSalesHistory(rows);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      }
    };
    loadRoyaltyTransactions();
    return () => {
      active = false;
    };
  }, [userProfile?.uid]);

  const pendingPayoutTON = useMemo(() => {
    return salesHistory
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.royaltyAmount, 0);
  }, [salesHistory]);

  const settledPayoutTON = useMemo(() => {
    return salesHistory
      .filter(s => s.status === 'settled')
      .reduce((sum, s) => sum + s.royaltyAmount, 0);
  }, [salesHistory]);

  const totalSecondaryVolumeTON = useMemo(() => {
    return salesHistory.reduce((sum, s) => sum + s.resellPrice, 0);
  }, [salesHistory]);

  const defaultRoyaltyRatePercent = 7.5;

  const withdrawableAmountTON = useMemo(() => {
    return pendingPayoutTON > 0 ? pendingPayoutTON : 0;
  }, [pendingPayoutTON]);

  const historicalEarningsData = useMemo(() => {
    const data = [];
    const now = new Date();
    let runningTotal = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dailyEarnings = salesHistory
        .filter((s) => (s.timestamp || '').startsWith(dayKey))
        .reduce((acc, s) => acc + s.royaltyAmount, 0);

      runningTotal = parseFloat((runningTotal + dailyEarnings).toFixed(2));

      data.push({
        date: dateStr,
        dailyGrams: parseFloat(dailyEarnings.toFixed(2)),
        cumulativeGrams: runningTotal,
        usdValue: parseFloat((dailyEarnings * tonPriceUsd).toFixed(2))
      });
    }
    return data;
  }, [salesHistory, tonPriceUsd]);

  const handleWithdrawAll = async () => {
    const amountToWithdraw = withdrawableAmountTON;

    if (amountToWithdraw <= 0) {
      addNotification('No accrued secondary royalties available to withdraw right now.', 'info');
      return;
    }

    if (!tonConnectUI.connected || !userAddress) {
      addNotification('Please connect your TON wallet to withdraw accrued royalties.', 'info');
      try {
        tonConnectUI.openModal();
      } catch (e) {
        console.error('Error opening TonConnect modal:', e);
      }
      return;
    }

    setIsWithdrawing(true);

    try {
      let nanoValue: string;
      try {
        nanoValue = toNano(amountToWithdraw.toFixed(4)).toString();
      } catch {
        nanoValue = Math.floor(amountToWithdraw * 1e9).toString();
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: userAddress,
            amount: nanoValue,
          }
        ]
      };

      await sendTransactionSafe(tonConnectUI, transaction);

      setSalesHistory(prev =>
        prev.map(s => ({ ...s, status: 'settled' }))
      );

      const shortAddr = userAddress.length > 12 
        ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` 
        : userAddress;

      addNotification(
        `Withdrawal of ${amountToWithdraw.toFixed(2)} TON secondary market royalties sent to wallet ${shortAddr}.`,
        'success'
      );
    } catch (err: any) {
      console.error('TON Blockchain Withdrawal Error:', err);
      if (err?.message?.includes('User rejected') || err?.message?.includes('canceled')) {
        addNotification('Withdrawal transaction was canceled in your wallet.', 'info');
      } else {
        addNotification(err?.message || 'Withdrawal transaction failed.', 'error');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Export Payout History to CSV
  const handleExportCSV = () => {
    if (salesHistory.length === 0) {
      addNotification('No royalty payout history available to export.', 'info');
      return;
    }

    const headers = [
      'Transaction ID',
      'NFT Title',
      'Resell Price (TON)',
      'Royalty Rate (%)',
      'Royalty Amount (TON)',
      'Royalty Amount (USD)',
      'Seller Address',
      'Buyer Address',
      'Date & Time',
      'Status'
    ];

    const rows = salesHistory.map(sale => [
      `"${sale.id}"`,
      `"${sale.nftTitle.replace(/"/g, '""')}"`,
      sale.resellPrice.toFixed(2),
      `${(sale.royaltyRate * 100).toFixed(1)}%`,
      sale.royaltyAmount.toFixed(3),
      `$${(sale.royaltyAmount * tonPriceUsd).toFixed(2)}`,
      `"${sale.seller}"`,
      `"${sale.buyer}"`,
      `"${new Date(sale.timestamp).toLocaleString()}"`,
      `"${sale.status.toUpperCase()}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TonJam_Royalty_Payout_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('Royalty payout history exported successfully as CSV!', 'success');
  };

  return (
    <div className={cn("bg-[#0A113A] border border-cyan-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-6", className)}>
      {/* Background Subtle Glows */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Smart Contract Yield</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Royalty Payout Status
          </h2>
          <p className="text-xs text-white/60 font-medium">
            Automated secondary market NFT sales royalties & upcoming payout distribution.
          </p>
        </div>

        {/* Header Controls: Timeframe, CSV Export & Withdraw All */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
            {(['7d', '30d', 'all'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  timeframe === tf 
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-9 px-3 bg-white/[0.04] border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-300 text-white/80 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            title="Export payout history to CSV for tax & accounting"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </Button>

          {/* Withdraw All Button */}
          <Button
            onClick={handleWithdrawAll}
            disabled={isWithdrawing || withdrawableAmountTON <= 0}
            className="h-9 px-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            title="Withdraw all accrued secondary market royalties directly to your primary connected TON wallet"
          >
            {isWithdrawing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-3.5 h-3.5 text-black" />
                <span>Withdraw All ({withdrawableAmountTON.toFixed(2)} TON)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Metric Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upcoming Pending Payout */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black/40 to-cyan-950/30 border border-emerald-500/30 overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Upcoming Payout
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold animate-pulse">
              Ready to Claim
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <Coins className="w-6 h-6 text-emerald-400 self-center" />
              <span className="text-3xl font-black font-mono text-emerald-300">
                {pendingPayoutTON.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-400">TON</span>
            </div>
            <p className="text-[11px] font-mono text-white/50 mt-1">
              ≈ ${(pendingPayoutTON * tonPriceUsd).toFixed(2)} USD
            </p>
          </div>

          <Button
            onClick={handleWithdrawAll}
            disabled={isWithdrawing || pendingPayoutTON <= 0}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isWithdrawing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Broadcasting Tx to TON...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4 text-black font-bold" />
                <span>Withdraw All ({pendingPayoutTON.toFixed(2)} TON)</span>
              </>
            )}
          </Button>
        </div>

        {/* Settled Royalties Total */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Settled Royalties
            </span>
            <span className="text-[10px] font-mono font-bold text-white/40">Lifetime</span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <Coins className="w-5 h-5 text-cyan-400 self-center" />
              <span className="text-3xl font-black font-mono text-cyan-300">
                {settledPayoutTON.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-cyan-400">TON</span>
            </div>
            <p className="text-[11px] font-mono text-white/50 mt-1">
              ≈ ${(settledPayoutTON * tonPriceUsd).toFixed(2)} USD
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-white/60">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Verified on TON Blockchain</span>
          </div>
        </div>

        {/* Secondary Market Rate & Volume */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Secondary Rate
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                {defaultRoyaltyRatePercent}% Cut
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">
                {totalSecondaryVolumeTON.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-purple-400">TON Volume</span>
            </div>
            <p className="text-[11px] text-white/50 mt-1">
              {salesHistory.length} Total Secondary Resales Logged
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Historical Royalty Earnings Line Chart */}
      <div className="bg-white/[0.02] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                30-Day Royalty Earnings History
              </h3>
            </div>
            <p className="text-[11px] text-white/50 font-medium">
              Daily and cumulative historical earnings performance in Grams
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-white/70">Daily (GRAM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-white/70">Cumulative (GRAM)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalEarningsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="dailyGramsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cumGramsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={5}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val} GRAM`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const daily = payload.find(p => p.dataKey === 'dailyGrams')?.value;
                    const cumulative = payload.find(p => p.dataKey === 'cumulativeGrams')?.value;
                    return (
                      <div className="bg-[#0A113A] p-3 rounded-xl shadow-xl space-y-1.5 text-xs font-mono">
                        <p className="font-bold text-white uppercase text-[10px] tracking-widest">{label}</p>
                        <div className="flex items-center justify-between gap-4 text-cyan-300">
                          <span>Daily Earnings:</span>
                          <span className="font-bold">{daily} GRAM</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-300">
                          <span>Cumulative Total:</span>
                          <span className="font-bold">{cumulative} GRAM</span>
                        </div>
                        <div className="text-[10px] text-white/40 pt-1 text-right">
                          ≈ ${((Number(daily) || 0) * tonPriceUsd).toFixed(2)} USD
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="dailyGrams" 
                stroke="#22d3ee" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#dailyGramsGrad)" 
                name="Daily Earnings"
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativeGrams" 
                stroke="#34d399" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#cumGramsGrad)" 
                name="Cumulative Total"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Sales Transactions Table / Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Recent Secondary Market Sales</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold font-mono text-white/40 uppercase hidden sm:inline">
              {salesHistory.length} Resales Recorded
            </span>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-white/70 hover:text-cyan-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
              title="Download CSV statement for record keeping"
            >
              <FileSpreadsheet className="w-3 h-3 text-cyan-400" />
              <span>CSV Statement</span>
            </button>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          {salesHistory.map(sale => (
            <div 
              key={sale.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors"
            >
              {/* NFT Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={sale.nftImageUrl} 
                  alt={sale.nftTitle}
                  className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white truncate">{sale.nftTitle}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono mt-0.5">
                    <span>Seller: {sale.seller}</span>
                    <span>•</span>
                    <span>Buyer: {sale.buyer}</span>
                  </div>
                </div>
              </div>

              {/* Resell price & Royalty */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Resell Price</span>
                  <span className="text-xs font-mono font-bold text-white">{sale.resellPrice} TON</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">Royalty ({sale.royaltyRate * 100}%)</span>
                  <span className="text-xs font-mono font-black text-emerald-300">+{sale.royaltyAmount.toFixed(3)} TON</span>
                </div>

                {/* Status Badge */}
                <div>
                  {sale.status === 'pending' ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> Upcoming
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Settled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {salesHistory.length === 0 && (
            <div className="p-8 text-center text-xs text-white/50">
              No secondary market resales recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoyaltyStatusCard;
