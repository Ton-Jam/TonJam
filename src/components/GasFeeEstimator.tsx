import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  RotateCw, 
  Clock, 
  ShieldCheck, 
  ArrowDownRight, 
  Check, 
  Layers, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Server
} from 'lucide-react';
import { 
  getGasFeeEstimatorData, 
  GasFeeEstimatorData, 
  PriorityTier, 
  MintGasEstimate 
} from '@/services/tonGasService';
import { cn } from '@/lib/utils';

export interface GasFeeEstimatorProps {
  variant?: 'card' | 'compact' | 'minimal';
  initialQuantity?: number;
  selectedTier?: PriorityTier;
  onSelectTier?: (tier: PriorityTier, estimate: MintGasEstimate) => void;
  className?: string;
  autoRefreshInterval?: number; // milliseconds, default 20000 (20s)
  allowQuantityChange?: boolean;
}

export const GasFeeEstimator: React.FC<GasFeeEstimatorProps> = ({
  variant = 'card',
  initialQuantity = 1,
  selectedTier: externalSelectedTier,
  onSelectTier,
  className = '',
  autoRefreshInterval = 20000,
  allowQuantityChange = true,
}) => {
  const [data, setData] = useState<GasFeeEstimatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [activeTier, setActiveTier] = useState<PriorityTier>('fast');
  const [currencyMode, setCurrencyMode] = useState<'TON' | 'USD'>('TON');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Sync external tier selection if provided
  useEffect(() => {
    if (externalSelectedTier) {
      setActiveTier(externalSelectedTier);
    }
  }, [externalSelectedTier]);

  // Fetch real-time congestion and estimate data
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    try {
      const result = await getGasFeeEstimatorData(quantity);
      setData(result);
      if (!externalSelectedTier && isManualRefresh === false && !data) {
        setActiveTier(result.recommendedTier);
      }
    } catch (err) {
      console.error('[GasFeeEstimator] Error fetching real-time gas data:', err);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [quantity, externalSelectedTier, data]);

  // Initial fetch and auto-refresh timer
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, autoRefreshInterval]);

  // Notify parent component on tier selection
  const handleSelectTier = (tier: PriorityTier) => {
    setActiveTier(tier);
    if (data?.tiers[tier] && onSelectTier) {
      onSelectTier(tier, data.tiers[tier]);
    }
  };

  const currentEstimate: MintGasEstimate | null = useMemo(() => {
    if (!data) return null;
    return data.tiers[activeTier] || data.tiers.fast;
  }, [data, activeTier]);

  // Format currency helpers
  const formatCost = (tonAmount: number, usdAmount: number) => {
    if (currencyMode === 'USD') {
      return `$${usdAmount.toFixed(2)}`;
    }
    return `${tonAmount.toFixed(4)} TON`;
  };

  // Congestion styling tokens (without border lines)
  const congestionTokens = useMemo(() => {
    const level = data?.congestion.level || 'low';
    switch (level) {
      case 'high':
        return {
          badgeBg: 'bg-amber-500/15',
          textColor: 'text-amber-400',
          dotColor: 'bg-amber-400',
          gaugeWidth: '85%',
          label: 'High Congestion',
        };
      case 'moderate':
        return {
          badgeBg: 'bg-blue-500/15',
          textColor: 'text-blue-400',
          dotColor: 'bg-blue-400',
          gaugeWidth: '55%',
          label: 'Moderate Traffic',
        };
      case 'low':
      default:
        return {
          badgeBg: 'bg-emerald-500/15',
          textColor: 'text-emerald-400',
          dotColor: 'bg-emerald-400',
          gaugeWidth: '25%',
          label: 'Optimal Conditions',
        };
    }
  }, [data?.congestion.level]);

  // Minimal variant (e.g. for tight summary rows)
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.03]", className)}>
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400">Mint Gas Fee:</span>
          <span className="font-mono font-bold text-white">
            {isLoading || !currentEstimate
              ? 'Estimating...'
              : formatCost(currentEstimate.totalAttachedTON, currentEstimate.totalAttachedUSD)}
          </span>
          {data && (
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", congestionTokens.badgeBg, congestionTokens.textColor)}>
              {congestionTokens.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCurrencyMode(prev => prev === 'TON' ? 'USD' : 'TON')}
          className="text-[10px] font-semibold text-[#0088CC] hover:text-white transition-colors bg-transparent border-none cursor-pointer outline-none"
        >
          {currencyMode === 'TON' ? 'View USD' : 'View TON'}
        </button>
      </div>
    );
  }

  // Compact variant (e.g. for modal sidebars and upload drawers)
  if (variant === 'compact') {
    return (
      <div className={cn("p-3.5 rounded-2xl bg-neutral-900/60 backdrop-blur-md space-y-3", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full animate-ping", congestionTokens.dotColor)} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Gas Fee Estimator
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors border-none cursor-pointer"
              title="Refresh live network fee"
              aria-label="Refresh network fee"
            >
              <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-[#0088CC]")} />
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode(prev => prev === 'TON' ? 'USD' : 'TON')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors border-none cursor-pointer"
            >
              {currencyMode}
            </button>
          </div>
        </div>

        {/* Tier selector pills */}
        <div className="grid grid-cols-3 gap-1.5">
          {(['eco', 'fast', 'priority'] as PriorityTier[]).map((tier) => {
            const isSelected = activeTier === tier;
            const estimate = data?.tiers[tier];
            return (
              <button
                key={tier}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={cn(
                  "p-2 rounded-xl text-left transition-all duration-200 cursor-pointer border-none outline-none select-none",
                  isSelected
                    ? "bg-[#0088CC] text-white shadow-lg shadow-[#0088CC]/20"
                    : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  {estimate?.tierName || tier}
                </div>
                <div className="font-mono text-xs font-bold mt-0.5 truncate">
                  {estimate ? formatCost(estimate.totalAttachedTON, estimate.totalAttachedUSD) : '...'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Summary */}
        {currentEstimate && (
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <span className="text-zinc-400 text-[11px]">Net Execution Cost:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              ~{formatCost(currentEstimate.netCostTON, currentEstimate.netCostUSD)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full Card Variant
  return (
    <div className={cn("p-4 sm:p-5 rounded-2xl bg-neutral-900/70 backdrop-blur-xl space-y-4 select-none", className)}>
      {/* 1. Header with live status, latency, and refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0088CC]/15 flex items-center justify-center text-[#0088CC]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Gas Fee Estimator
              </h3>
              <span className={cn("flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full", congestionTokens.badgeBg, congestionTokens.textColor)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", congestionTokens.dotColor, "animate-pulse")} />
                {congestionTokens.label}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Live TON blockchain telemetry & NFT minting cost projection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          <button
            type="button"
            onClick={() => setCurrencyMode(prev => prev === 'TON' ? 'USD' : 'TON')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all border-none cursor-pointer"
            title="Toggle TON / USD display"
          >
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currencyMode}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-semibold text-zinc-300 hover:text-white transition-all border-none cursor-pointer"
            aria-label="Refresh live gas fees"
          >
            <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-[#0088CC]")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Congestion & Network Telemetry Gauge Bar */}
      <div className="p-3 rounded-xl bg-white/[0.02] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-[#0088CC]" />
            <span>Network Load</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-300">
            <span>Latency: <strong className={congestionTokens.textColor}>{data?.congestion.latencyMs || 0}ms</strong></span>
            <span>Block Time: <strong>{data?.congestion.blockTimeSec || 2.8}s</strong></span>
          </div>
        </div>

        {/* Visual Congestion Gauge (No border lines) */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: congestionTokens.gaugeWidth }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn("h-full rounded-full", data?.congestion.level === 'high' ? 'bg-amber-400' : data?.congestion.level === 'moderate' ? 'bg-blue-400' : 'bg-emerald-400')}
          />
        </div>

        <p className="text-[11px] text-zinc-400 leading-snug">
          {data?.congestion.statusMessage || 'Calculating current TON shard state...'}
        </p>
      </div>

      {/* 3. Optional Mint Quantity Selector */}
      {allowQuantityChange && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Mint Quantity:</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 3, 5, 10].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer",
                  quantity === qty
                    ? "bg-[#0088CC] text-white shadow-sm"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {qty}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Speed & Priority Tiers */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-0.5">
          Select Speed / Priority Tier
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['eco', 'fast', 'priority'] as PriorityTier[]).map((tierKey) => {
            const isSelected = activeTier === tierKey;
            const isRecommended = data?.recommendedTier === tierKey;
            const estimate = data?.tiers[tierKey];

            return (
              <motion.button
                key={tierKey}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTier(tierKey)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all duration-200 cursor-pointer border-none outline-none relative select-none flex flex-col justify-between min-h-[96px]",
                  isSelected
                    ? "bg-[#0088CC] text-white shadow-xl shadow-[#0088CC]/25"
                    : "bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {estimate?.tierName || tierKey}
                    </span>
                    {isRecommended && (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full",
                        isSelected ? "bg-white text-[#0088CC]" : "bg-emerald-400/20 text-emerald-300"
                      )}>
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[10px] mt-0.5 leading-tight", isSelected ? "text-white/80" : "text-zinc-400")}>
                    {estimate?.tagline}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-mono font-bold text-sm sm:text-base">
                    {estimate ? formatCost(estimate.totalAttachedTON, estimate.totalAttachedUSD) : '...'}
                  </div>
                  <div className={cn("flex items-center gap-1 text-[10px] font-medium mt-0.5", isSelected ? "text-white/80" : "text-zinc-400")}>
                    <Clock className="w-3 h-3" />
                    <span>~{estimate?.estimatedConfirmationSec || 3}s confirmation</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Fee Breakdown Card */}
      {currentEstimate && (
        <div className="p-3.5 rounded-xl bg-white/[0.02] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NFT Minting Fee Breakdown
            </span>
            <button
              type="button"
              onClick={() => setShowBreakdown(prev => !prev)}
              className="text-[11px] font-semibold text-[#0088CC] hover:text-white flex items-center gap-0.5 transition-colors border-none bg-transparent cursor-pointer"
            >
              <span>{showBreakdown ? 'Hide details' : 'View details'}</span>
              {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Transaction Value Attached:</span>
              <span className="font-mono font-bold text-white">
                {formatCost(currentEstimate.totalAttachedTON, currentEstimate.totalAttachedUSD)}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1 text-emerald-400/90">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Est. Smart Contract Refund:
              </span>
              <span className="font-mono font-bold">
                -{formatCost(currentEstimate.estimatedRefundTON, currentEstimate.estimatedRefundUSD)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1.5 text-xs">
              <span className="font-bold text-white">Net Non-Refundable Cost:</span>
              <span className="font-mono font-black text-sm text-cyan-300">
                ~{formatCost(currentEstimate.netCostTON, currentEstimate.netCostUSD)}
              </span>
            </div>
          </div>

          {/* Expandable itemized sub-costs */}
          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-2 space-y-1.5 text-[11px] text-zinc-400"
              >
                <div className="flex justify-between items-center">
                  <span>• Smart Contract Compute (TVM execution):</span>
                  <span className="font-mono text-zinc-300">{currentEstimate.computeFeeTON.toFixed(4)} TON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• NFT Item Storage Deposit (1-year prepay):</span>
                  <span className="font-mono text-zinc-300">{currentEstimate.storageFeeTON.toFixed(4)} TON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Forward & Message Routing:</span>
                  <span className="font-mono text-zinc-300">{currentEstimate.forwardFeeTON.toFixed(4)} TON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Dynamic Out-of-Gas Buffer:</span>
                  <span className="font-mono text-zinc-300">{currentEstimate.bufferFeeTON.toFixed(4)} TON</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  <span className="font-bold text-zinc-300">How TON gas refunds work: </span>
                  TON smart contracts require attaching a slight excess buffer. Any unused execution and buffer gas is automatically refunded back into your wallet address upon block finalization.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 6. Expandable Live Node Telemetry */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowTelemetry(prev => !prev)}
          className="w-full flex items-center justify-between text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors py-1 px-1 bg-transparent border-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span>Masterchain Block #{data?.congestion.masterchainSeqno || 0}</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <span>{data?.congestion.nodeEndpoint || 'Decentralized Gateway'}</span>
            {showTelemetry ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>

        <AnimatePresence>
          {showTelemetry && data && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-white/[0.02] mt-1 space-y-1 text-[11px] font-mono text-zinc-400"
            >
              <div className="flex justify-between">
                <span>Masterchain Seqno:</span>
                <span className="text-white">{data.congestion.masterchainSeqno}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Round-Trip Latency:</span>
                <span className={congestionTokens.textColor}>{data.congestion.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Observed Block Interval:</span>
                <span className="text-white">{data.congestion.blockTimeSec}s</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shard TPS:</span>
                <span className="text-white">~{data.congestion.estimatedTps} tx/s</span>
              </div>
              <div className="flex justify-between">
                <span>Live TON Price:</span>
                <span className="text-white">${data.tonPriceUSD.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Last Telemetry Pulse:</span>
                <span className="text-white">{data.congestion.lastUpdated.toLocaleTimeString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GasFeeEstimator;
