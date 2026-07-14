import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Coins, Music, Gem, ExternalLink, Wallet, Sparkles, 
  ChevronRight, RefreshCw, AlertCircle, ArrowUpRight, Check, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as RechartsPrimitive from 'recharts';
import confetti from 'canvas-confetti';
import { useToast } from '@/components/layout/ToastProvider';
import { RoyaltiesSkeleton } from './Skeletons';

const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } = RechartsPrimitive as any;

const ResponsiveContainerRC = ResponsiveContainer as any;
const BarChartRC = BarChart as any;
const BarRC = Bar as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;
const LegendRC = Legend as any;

export const RoyaltiesDashboard: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedTotal, setClaimedTotal] = useState(24.50);
  const [pendingBalance, setPendingBalance] = useState(4.82);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [simLogs, setSimLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'metric' }>>([]);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Earnings Data
  const weeklyEarnings = [
    { name: 'Mon', Streams: 0.21, NFTSales: 0.50, Total: 0.71 },
    { name: 'Tue', Streams: 0.35, NFTSales: 0.00, Total: 0.35 },
    { name: 'Wed', Streams: 0.18, NFTSales: 1.20, Total: 1.38 },
    { name: 'Thu', Streams: 0.42, NFTSales: 0.40, Total: 0.82 },
    { name: 'Fri', Streams: 0.51, NFTSales: 0.00, Total: 0.51 },
    { name: 'Sat', Streams: 0.88, NFTSales: 2.50, Total: 3.38 },
    { name: 'Sun', Streams: 0.65, NFTSales: 1.80, Total: 2.45 },
  ];

  const monthlyEarnings = [
    { name: 'Jan', Streams: 4.2, NFTSales: 12.5, Total: 16.7 },
    { name: 'Feb', Streams: 5.8, NFTSales: 8.0, Total: 13.8 },
    { name: 'Mar', Streams: 7.1, NFTSales: 15.4, Total: 22.5 },
    { name: 'Apr', Streams: 6.9, NFTSales: 24.0, Total: 30.9 },
    { name: 'May', Streams: 8.5, NFTSales: 18.2, Total: 26.7 },
    { name: 'Jun', Streams: 12.4, NFTSales: 32.5, Total: 44.9 },
  ];

  const chartData = selectedPeriod === 'week' ? weeklyEarnings : monthlyEarnings;

  // Recent Transactions
  const [transactions, setTransactions] = useState([
    { id: 'tx-1', type: 'Stream Share', track: 'Cyberpunk Odyssey', amount: 0.045, token: 'TON', date: 'Just now', status: 'Settled', block: '#394021' },
    { id: 'tx-2', type: 'NFT Secondary Sale', track: 'Durov Collective Vinyl', amount: 1.80, token: 'TON', date: '2 hours ago', status: 'Settled', block: '#393994' },
    { id: 'tx-3', type: 'Stream Share', track: 'Gram Gram Vibing', amount: 0.012, token: 'TON', date: '5 hours ago', status: 'Settled', block: '#393850' },
    { id: 'tx-4', type: 'Stream Share', track: 'Satoshi Sync', amount: 0.088, token: 'TON', date: '1 day ago', status: 'Settled', block: '#393101' },
    { id: 'tx-5', type: 'NFT Secondary Sale', track: 'Golden TON Record #8', amount: 2.50, token: 'TON', date: '2 days ago', status: 'Settled', block: '#392219' },
  ]);

  const handleClaim = () => {
    if (pendingBalance <= 0) {
      toast.info('Zero Balance', 'No pending royalties available to claim right now.');
      return;
    }
    
    setIsClaiming(true);
    toast.info('Initiating TON Claim', 'Interacting with TonJamRoyaltyDistributor.tact...');

    setTimeout(() => {
      // Confetti on success
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0052FF', '#00D1FF', '#2BE08C']
      });

      setClaimedTotal(prev => prev + pendingBalance);
      setPendingBalance(0);
      setIsClaiming(false);
      
      toast.success(
        'Royalties Claimed Successfully',
        `Successfully transferred ${pendingBalance.toFixed(2)} TON directly to your smart contract wallet.`
      );
    }, 2000);
  };

  const simulateStreamRoyalty = () => {
    setActiveSimulation('stream');
    setSimLogs([]);
    const logs: Array<{ text: string; type: 'info' | 'success' | 'metric' }> = [
      { text: '▶ STARTING TVM STREAMS SETTLEMENT AGENT...', type: 'info' },
      { text: '⚡ Calling contract: TonJamRoyaltyDistributor.tact', type: 'info' },
      { text: '📥 Intercepting play count stream: +1,240 collective plays', type: 'info' },
      { text: '⛽ Gas consumed: 11,200 nanoton (Optimized on-chain route)', type: 'metric' },
      { text: '✨ Royalty distribution: +0.125 TON accumulated to Pending', type: 'success' },
      { text: '✅ LEDGER STATE MUTATED', type: 'success' }
    ];

    let delay = 0;
    logs.forEach((log) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, log]);
      }, delay);
      delay += 150;
    });

    setTimeout(() => {
      setPendingBalance(prev => parseFloat((prev + 0.125).toFixed(3)));
      // Add transaction
      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'Stream Share',
        track: 'Satoshi Sync (Live Sim)',
        amount: 0.125,
        token: 'TON',
        date: 'Just now',
        status: 'Settled',
        block: '#394025'
      };
      setTransactions(prev => [newTx, ...prev]);
      setActiveSimulation(null);
      toast.success('Simulation Complete', '+0.125 TON added to pending royalties balance.');
    }, 1200);
  };

  const simulateNftResaleRoyalty = () => {
    setActiveSimulation('resale');
    setSimLogs([]);
    const logs: Array<{ text: string; type: 'info' | 'success' | 'metric' }> = [
      { text: '▶ INITIATING SECONDARY NFT MARKETPLACE LIQUIDITY TRACE...', type: 'info' },
      { text: '⚡ Resolving Contract: TonJamMarketplace.tact', type: 'info' },
      { text: '📥 Secondary sale triggered on Getgems (Value: 15.00 TON)', type: 'info' },
      { text: '🎨 Creator royalty commission: 10% (1.50 TON split)', type: 'info' },
      { text: '⛽ Gas consumed: 41,500 nanoton', type: 'metric' },
      { text: '✨ Royalty payout: +1.50 TON accumulated to Pending', type: 'success' },
      { text: '✅ MUTATION COMMITTED TO TON BLOCKCHAIN', type: 'success' }
    ];

    let delay = 0;
    logs.forEach((log) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, log]);
      }, delay);
      delay += 150;
    });

    setTimeout(() => {
      setPendingBalance(prev => parseFloat((prev + 1.50).toFixed(3)));
      // Add transaction
      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'NFT Secondary Sale',
        track: 'Golden TON Record #12 (Live Sim)',
        amount: 1.50,
        token: 'TON',
        date: 'Just now',
        status: 'Settled',
        block: '#394026'
      };
      setTransactions(prev => [newTx, ...prev]);
      setActiveSimulation(null);
      toast.success('Simulation Complete', '+1.50 TON added to pending royalties balance.');
    }, 1200);
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#080d22] p-3 rounded-lg shadow-xl text-left border-none">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-[11px] font-mono py-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.color }} />
              <span className="text-slate-300">{pld.name}:</span>
              <span className="font-bold text-white">{pld.value.toFixed(3)} TON</span>
            </div>
          ))}
          <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between text-[10px] font-bold text-emerald-400">
            <span>Total:</span>
            <span>
              {payload.reduce((acc: number, p: any) => acc + p.value, 0).toFixed(3)} TON
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <RoyaltiesSkeleton />;
  }

  return (
    <div className="space-y-8 text-left select-none">
      
      {/* 1. TOP HEADER & METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Stream Earnings Card */}
        <div className="bg-[#121833]/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Streams
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Stream Royalties</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              14.285 <span className="text-xs text-blue-400 font-bold">TON</span>
            </span>
            <p className="text-[9px] text-slate-500 mt-1 leading-normal">Earnings gathered from active decentralized network listener nodes</p>
          </div>
        </div>

        {/* NFT Secondary Sales Card */}
        <div className="bg-[#121833]/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Gem className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Resales
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">NFT Commissions</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              15.035 <span className="text-xs text-purple-400 font-bold">TON</span>
            </span>
            <p className="text-[9px] text-slate-500 mt-1 leading-normal">On-chain creator fee splits from secondary market asset resales</p>
          </div>
        </div>

        {/* Total Settled & Claimed */}
        <div className="bg-[#121833]/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Claimed
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Total Settled</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {claimedTotal.toFixed(2)} <span className="text-xs text-emerald-500 font-bold">TON</span>
            </span>
            <p className="text-[9px] text-slate-500 mt-1 leading-normal">Funds successfully withdrawn into your primary personal wallet</p>
          </div>
        </div>

        {/* Pending Claim Agent Card */}
        <div className="bg-gradient-to-br from-[#0c1a3f] to-[#040e26] p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          {/* Subtle light effect instead of border */}
          <div className="absolute inset-0 bg-[#0052FF]/5 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Pending Sync
            </span>
            <span className="text-[10px] font-mono text-slate-500">TACT Contract</span>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Pending Balance</span>
            <span className="text-3xl font-black font-mono text-amber-400 mt-1 block">
              {pendingBalance.toFixed(3)} <span className="text-sm font-bold text-amber-500">TON</span>
            </span>
            
            <button
              onClick={handleClaim}
              disabled={isClaiming || pendingBalance <= 0}
              className={`w-full mt-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                pendingBalance > 0 
                  ? 'bg-[#0052FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 active:scale-95' 
                  : 'bg-slate-900/80 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isClaiming ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Coins className="w-3.5 h-3.5" />
                  Claim to Wallet
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 2. RECHARTS BAR CHART VISUALIZER */}
      <div className="bg-[#121833]/20 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
              On-Chain Revenue Stream Visualizer
            </h4>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Historical distribution records compiled from TON block transactions
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-900/60 p-1 rounded-xl flex items-center self-start sm:self-auto">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                selectedPeriod === 'week' ? 'bg-[#0052FF] text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              Weekly Trace
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                selectedPeriod === 'month' ? 'bg-[#0052FF] text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              Monthly Trace
            </button>
          </div>
        </div>

        {/* Recharts BarChart container */}
        <div className="w-full h-[220px] pt-4">
          <ResponsiveContainerRC width="100%" height="100%">
            <BarChartRC
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxisRC 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxisRC 
                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false}
              />
              <TooltipRC content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
              <LegendRC 
                verticalAlign="top" 
                height={36} 
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <BarRC 
                dataKey="Streams" 
                name="Stream Payouts" 
                fill="#0052FF" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <BarRC 
                dataKey="NFTSales" 
                name="NFT Royalties" 
                fill="#a855f7" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </BarChartRC>
          </ResponsiveContainerRC>
        </div>
      </div>

      {/* 3. SIMULATOR AND TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Playful Interactive Simulator */}
        <div className="lg:col-span-2 bg-[#121833]/20 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              On-Chain Event Simulator
            </h5>
            <p className="text-[8.5px] text-slate-500 leading-relaxed">
              Manually trigger on-chain stream actions or NFT trading events to inspect real-time royalty payouts routed via Tact Smart Contracts.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={simulateStreamRoyalty}
              disabled={activeSimulation !== null}
              className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Stream (+0.125 TON)
            </button>

            <button
              onClick={simulateNftResaleRoyalty}
              disabled={activeSimulation !== null}
              className="w-full py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Simulate NFT Resale (+1.50 TON)
            </button>
          </div>

          {/* Simulator Console Trace logs */}
          <div className="bg-black/40 rounded-xl p-3 h-[130px] flex flex-col justify-between overflow-hidden">
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
              TVM_LOGS: ON-CHAIN SETTLEMENT TRACE
            </span>
            <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[8px] space-y-1">
              {simLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center uppercase tracking-widest">
                  <span className="text-[7.5px] font-bold">Awaiting Transaction Event...</span>
                </div>
              ) : (
                simLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`p-1 rounded ${
                      log.type === 'success' 
                        ? 'text-emerald-400 bg-emerald-500/5' 
                        : log.type === 'metric' 
                        ? 'text-amber-400 bg-amber-500/5' 
                        : 'text-slate-300'
                    }`}
                  >
                    {log.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-3 bg-[#121833]/20 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black text-white uppercase tracking-widest">
              Live Settlement Receipts
            </h5>
            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              Sync Active
            </span>
          </div>

          <div className="space-y-2.5 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="bg-slate-900/40 hover:bg-slate-900/60 p-3 rounded-xl flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    tx.type.includes('NFT') ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type.includes('NFT') ? <Gem className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider block truncate">{tx.track}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">{tx.type} • {tx.block}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-black block ${
                    tx.type.includes('NFT') ? 'text-purple-400' : 'text-blue-400'
                  }`}>
                    +{tx.amount.toFixed(3)} {tx.token}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
