import React, { useState } from 'react';
import { Wallet, Coins, RefreshCw, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';

interface EarningsCardProps {
  initialUnclaimed?: number;
  initialClaimed?: number;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  initialUnclaimed = 124.5,
  initialClaimed = 458.2
}) => {
  const toast = useToast();
  const [unclaimed, setUnclaimed] = useState<number>(initialUnclaimed);
  const [claimed, setClaimed] = useState<number>(initialClaimed);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const handleClaim = () => {
    if (unclaimed <= 0) return;
    setIsClaiming(true);

    // Simulate smart contract royalty withdrawal
    setTimeout(() => {
      setIsClaiming(false);
      const claimedValue = unclaimed;
      setClaimed(prev => prev + claimedValue);
      setUnclaimed(0);
      toast.success(
        'Royalties Claimed Successfully',
        `Transferred ${claimedValue} TON stream royalties into your active Web3 wallet node.`
      );
    }, 2000);
  };

  return (
    <div className="bg-[#101A3B] border border-white/5 rounded-2xl p-5 text-white flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ecosystem Smart Earnings
          </span>
          <h4 className="text-sm font-bold text-slate-200">TON Royalty Node</h4>
        </div>
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <Coins className="w-5 h-5" />
        </div>
      </div>

      {/* Grid values */}
      <div className="grid grid-cols-2 gap-4 my-6">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium leading-none">Unclaimed Balance</p>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              {unclaimed.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">TON</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium leading-none">Total Claimed</p>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-300">
              {claimed.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">TON</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-2">
        <button
          disabled={isClaiming || unclaimed <= 0}
          onClick={handleClaim}
          className="flex-1 bg-[#0052FF] hover:bg-[#0040D9] active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isClaiming ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : unclaimed <= 0 ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All Claimed</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Withdraw to Wallet</span>
            </>
          )}
        </button>

        <button 
          onClick={() => toast.info('Earnings Ledger', 'Opening smart contract transaction audit log...')}
          className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title="Audit Ledger"
        >
          <ArrowUpRight className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};

export default EarningsCard;
