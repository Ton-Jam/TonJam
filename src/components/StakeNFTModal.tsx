import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Lock, 
  Unlock, 
  Coins, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Gift, 
  Award,
  Loader2,
  CheckCircle2,
  Flame,
  ChevronRight
} from 'lucide-react';
import { NFTItem } from '@/types';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { stakeMusicNFT, unstakeMusicNFT, claimNFTStakingRewards } from '@/services/tonService';
import confetti from 'canvas-confetti';

interface StakeNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const LOCK_TIERS = [
  { days: 30, apy: 12, multiplier: 1.2, label: '30 Days', desc: 'Flex Lock' },
  { days: 90, apy: 25, multiplier: 1.8, label: '90 Days', desc: 'Curator Boost' },
  { days: 180, apy: 45, multiplier: 2.2, label: '180 Days', desc: 'VIP Vault' },
  { days: 365, apy: 80, multiplier: 3.0, label: '365 Days', desc: 'Legendary Master' },
];

export const StakeNFTModal: React.FC<StakeNFTModalProps> = ({ nft, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStep, setTxStep] = useState<'idle' | 'preparing' | 'signing' | 'confirming' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { stakeNFT, unstakeNFT, claimNFTGovernanceRewards } = useNFT();
  const { addNotification, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();

  const activeTier = useMemo(() => {
    return LOCK_TIERS.find((t) => t.days === selectedDays) || LOCK_TIERS[1];
  }, [selectedDays]);

  // Estimated daily governance token rewards based on price and APY
  const dailyGovRewards = useMemo(() => {
    const basePrice = parseFloat(nft.price) || 10;
    return Math.round((basePrice * 1.5 * (activeTier.apy / 100) / 365) * 100) / 100;
  }, [nft.price, activeTier]);

  const totalEstRewards = useMemo(() => {
    return Math.round(dailyGovRewards * selectedDays * 10) / 10;
  }, [dailyGovRewards, selectedDays]);

  // Calculate stats for already staked NFT
  const isStaked = nft.isStaked;
  const stakedAtDate = nft.stakedAt ? new Date(nft.stakedAt) : new Date();
  const daysElapsed = Math.max(1, Math.floor((Date.now() - stakedAtDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalLockDays = nft.stakedLockPeriodDays || 90;
  const daysRemaining = Math.max(0, totalLockDays - daysElapsed);
  const currentApy = nft.stakedApy || 25;
  
  // Accumulated rewards simulation
  const accumulatedRewards = useMemo(() => {
    const basePrice = parseFloat(nft.price) || 10;
    const dailyRate = (basePrice * 1.5 * (currentApy / 100)) / 365;
    return Math.max(12.4, Math.round((daysElapsed * dailyRate + 15) * 10) / 10);
  }, [nft.price, currentApy, daysElapsed]);

  const handleStake = async () => {
    setIsProcessing(true);
    setTxStep('preparing');
    setErrorMsg(null);

    try {
      addNotification(`Initiating NFT Staking for ${nft.title}...`, 'info');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTxStep('signing');
      if (tonConnectUI.connected) {
        await stakeMusicNFT(tonConnectUI, nft.contractAddress || '', selectedDays);
      } else {
        // Fallback simulation mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setTxStep('confirming');
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Persist state in context
      await stakeNFT(nft.id, selectedDays, userProfile.walletAddress || nft.owner);

      setTxStep('success');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      });

      addNotification(`Successfully staked ${nft.title}! Earning ${activeTier.apy}% APY + ${activeTier.multiplier}x Voting Power.`, 'success');

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Transaction rejected or timed out');
      setTxStep('idle');
      addNotification('NFT Staking transaction failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (daysRemaining > 0) {
      if (!window.confirm(`Lock period has ${daysRemaining} days remaining. Early unstaking forfeits uncollected bonus multipliers. Proceed?`)) {
        return;
      }
    }

    setIsProcessing(true);
    setTxStep('preparing');

    try {
      addNotification(`Requesting NFT Unstake for ${nft.title}...`, 'info');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTxStep('signing');
      if (tonConnectUI.connected) {
        await unstakeMusicNFT(tonConnectUI, nft.contractAddress || '');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setTxStep('confirming');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await unstakeNFT(nft.id);

      setTxStep('success');
      addNotification(`Unstaked ${nft.title}. NFT returned to your active wallet vault.`, 'success');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      addNotification('Unstaking transaction failed.', 'error');
      setTxStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsProcessing(true);
    try {
      addNotification(`Claiming ${accumulatedRewards} $JAM Governance Tokens...`, 'info');
      
      if (tonConnectUI.connected) {
        await claimNFTStakingRewards(tonConnectUI, nft.contractAddress || '');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const claimed = await claimNFTGovernanceRewards(nft.id);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#ffffff'],
      });

      addNotification(`Claimed ${claimed || accumulatedRewards} $JAM Governance Tokens!`, 'success');
      onClose();
    } catch (err) {
      addNotification('Claim rewards failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Header Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 blur-xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide uppercase text-white flex items-center gap-2">
                {isStaked ? 'Manage Staked NFT' : 'Stake Music NFT'}
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                  TON Smart Contract
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Earn $JAM governance tokens & VIP curator voting power
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NFT Preview Card */}
        <div className="relative z-10 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-4 p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
            <img 
              src={nft.imageUrl || nft.coverUrl} 
              alt={nft.title} 
              className="w-16 h-16 rounded-lg object-cover border border-zinc-700 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {nft.edition || 'Music NFT'} Edition
              </span>
              <h4 className="text-base font-bold text-white truncate">{nft.title}</h4>
              <p className="text-xs text-zinc-400 truncate">{nft.creator || nft.artist}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Floor Valuation</span>
              <span className="text-sm font-black text-white">{nft.price} GRAM</span>
            </div>
          </div>

          {/* IF ALREADY STAKED STATE */}
          {isStaked ? (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Currently Vault Staked</span>
                    <span className="text-xs text-zinc-300">Lock Period: {totalLockDays} Days @ {currentApy}% APY</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-400 block">Days Remaining</span>
                  <span className="text-sm font-black text-emerald-400">{daysRemaining} Days</span>
                </div>
              </div>

              {/* Accrued Rewards Highlight */}
              <div className="p-5 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-indigo-950/30 rounded-xl border border-blue-500/20 text-center space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
                  Accrued Governance Token Yield
                </span>
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400 animate-bounce" />
                  <span className="text-3xl font-black text-amber-400 tracking-tight">
                    +{accumulatedRewards} $JAM
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Ready to claim to your connected TON wallet or re-invest into governance voting.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClaimRewards}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4" /> Claim $JAM Rewards
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Unstake action button */}
              <div className="pt-2 border-t border-zinc-800">
                <button
                  onClick={handleUnstake}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-zinc-900 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  {daysRemaining > 0 ? `Unstake Early (${daysRemaining} Days Left)` : 'Unstake NFT & Withdraw'}
                </button>
              </div>
            </div>
          ) : (
            /* STAKING SETUP FORM */
            <div className="space-y-5">
              {/* Lock Period Tiers Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2.5">
                  Select Staking Lock Duration
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {LOCK_TIERS.map((tier) => {
                    const isSelected = selectedDays === tier.days;
                    return (
                      <button
                        key={tier.days}
                        type="button"
                        onClick={() => setSelectedDays(tier.days)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">{tier.label}</span>
                          <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {tier.apy}% APY
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{tier.desc}</span>
                          <span className="font-semibold text-blue-400">{tier.multiplier}x Power</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Yield & Voting Power Estimator */}
              <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Projected Yield & Benefits Breakdown
                </span>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Est. Daily $JAM Rewards</span>
                    <span className="text-base font-black text-amber-400 flex items-center gap-1">
                      <Coins className="w-4 h-4" /> +{dailyGovRewards} / Day
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Total Lock Yield</span>
                    <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> ~{totalEstRewards} $JAM
                    </span>
                  </div>
                </div>

                {/* Platform Perks List */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>{activeTier.multiplier}x Voting Power</strong> in TonJam DAO governance proposals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>50% Marketplace Fee Discount</strong> while staked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Exclusive access to unreleased artist stems & listening rooms</span>
                  </div>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Transaction Steps visual indicator */}
              {isProcessing && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-300">
                    {txStep === 'preparing' && 'Constructing TON Tact Smart Contract payload...'}
                    {txStep === 'signing' && 'Awaiting wallet signature via TonConnect...'}
                    {txStep === 'confirming' && 'Broadcasting transaction to TON network...'}
                    {txStep === 'success' && 'Staking confirmed on TON blockchain!'}
                  </span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStake}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Confirm Staking ({selectedDays} Days @ {activeTier.apy}% APY)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StakeNFTModal;
