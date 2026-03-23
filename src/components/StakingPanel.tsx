import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  ShieldCheck,
  Info,
  Zap,
  Sparkles
} from 'lucide-react';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';

interface StakingPanelProps {
  balance: number;
  onStake: (amount: number) => void;
  onBuyTJ: () => void;
}

const StakingPanel: React.FC<StakingPanelProps> = ({ balance, onStake, onBuyTJ }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [stakedBalance, setStakedBalance] = useState(5000);
  const [rewards, setRewards] = useState(124.5);

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    
    setIsStaking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStakedBalance(prev => prev + amount);
    onStake(amount);
    setStakeAmount('');
    setIsStaking(false);
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Staking Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Lock JAM to multiply rewards</p>
          </div>
        </div>
        <button 
          onClick={onBuyTJ}
          className="px-2 py-2 rounded-lg bg-blue-600/10 border border-neutral-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2"
        >
          <img src={TON_LOGO} className="w-3 h-3" alt="" />
          Buy JAM with TON
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Staking Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-foreground/[0.02] border border-border/50 rounded-2xl p-2 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lock className="w-full h-full text-foreground" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Staked Balance</p>
            <div className="flex items-center gap-2">
              <img src={TJ_COIN_ICON} className="w-8 h-8 object-contain" alt="" />
              <p className="text-[26px] font-black text-foreground tracking-tighter">{stakedBalance.toLocaleString()} JAM</p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% APY Active</span>
            </div>
          </div>

          <div className="bg-foreground/[0.02] border border-border/50 rounded-2xl p-2 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-full h-full text-amber-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Pending Rewards</p>
            <div className="flex items-center gap-2">
              <img src={TJ_COIN_ICON} className="w-8 h-8 object-contain" alt="" />
              <p className="text-[26px] font-black text-amber-500 tracking-tighter">{rewards.toFixed(1)} JAM</p>
            </div>
            <button className="mt-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2">
              Claim Rewards <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Stake Action */}
        <div className="bg-blue-600/5 border border-neutral-500/20 rounded-2xl p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stake JAM</span>
            <span className="text-[10px] font-bold text-muted-foreground/50">Available: {balance.toLocaleString()}</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-background/40 border border-border rounded-xl p-2 text-xl font-black text-foreground outline-none focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/30"
            />
            <button 
              onClick={() => setStakeAmount(balance.toString())}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400"
            >
              Max
            </button>
          </div>
          <button 
            onClick={handleStake}
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-foreground text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStaking ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Stake Protocols
              </>
            )}
          </button>
          <div className="flex items-center gap-2 justify-center opacity-40">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-foreground">Secured by TON Smart Contract</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakingPanel;
