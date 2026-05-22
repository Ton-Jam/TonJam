import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  ShieldCheck,
  Info,
  Zap,
  Sparkles,
  Repeat,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TJ_COIN_ICON, TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import StakingRewardsCalculator from './StakingRewardsCalculator';
import CompoundingSimulator from './CompoundingSimulator';
import { Switch } from '@/components/ui/switch';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';

const ResponsiveContainerRC = ResponsiveContainer as any;
const PieChartRC = PieChart as any;
const PieRC = Pie as any;
const CellRC = Cell as any;
const TooltipRC = Tooltip as any;
const BarChartRC = BarChart as any;
const BarRC = Bar as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const CartesianGridRC = CartesianGrid as any;
const LegendRC = Legend as any;

const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

interface StakingPanelProps {
  balance: number;
  onStake: (amount: number) => void;
  onBuyTJ: () => void;
}

const StakingPanel: React.FC<StakingPanelProps> = ({ balance, onStake, onBuyTJ }) => {
  const { userProfile, stakeJam, claimJamRewards, transactions = [] } = useAudio();
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [autoCompounding, setAutoCompounding] = useState(false);
  const [autoValidatorSwitching, setAutoValidatorSwitching] = useState(false);

  const [validators, setValidators] = useState<any[]>([]);
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('validator-a');

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const lastStakeTime = useMemo(() => {
    const stakeTxs = transactions.filter(tx => tx.type === 'stake');
    if (stakeTxs.length === 0) return 0;
    const sorted = [...stakeTxs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return new Date(sorted[0].timestamp).getTime();
  }, [transactions]);

  useEffect(() => {
    if (!lastStakeTime) {
      setCooldownRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
      const diff = lastStakeTime + cooldownMs - Date.now();
      return diff > 0 ? diff : 0;
    };

    setCooldownRemaining(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setCooldownRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastStakeTime]);

  const formatCooldown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'validators'),
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a: any, b: any) => b.apr - a.apr);
        setValidators(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'validators');
      }
    );
    return () => unsub();
  }, []);

  const fallbackValidators = [
    { 
      id: 'validator-a',
      name: 'TonJam Node A', 
      apr: 15,
      uptime: 99.92,
      blocksValidated: '1,424,192',
      currentCommission: '5%',
      commissionHistory: [
        { date: 'Jan 26', fee: '8%' },
        { date: 'Mar 26', fee: '6%' },
        { date: 'May 26', fee: '5%' }
      ],
      selfStake: '250,000 TON',
      status: 'Active'
    },
    { 
      id: 'validator-b',
      name: 'TonJam Node B', 
      apr: 14,
      uptime: 99.45,
      blocksValidated: '984,204',
      currentCommission: '6%',
      commissionHistory: [
        { date: 'Jan 26', fee: '8%' },
        { date: 'Feb 26', fee: '7%' },
        { date: 'Apr 26', fee: '6%' }
      ],
      selfStake: '180,000 TON',
      status: 'Active'
    },
    { 
      id: 'validator-c',
      name: 'TonJam Node C', 
      apr: 13,
      uptime: 98.78,
      blocksValidated: '542,110',
      currentCommission: '8%',
      commissionHistory: [
        { date: 'Jan 26', fee: '9%' },
        { date: 'Mar 26', fee: '8.5%' },
        { date: 'May 26', fee: '8%' }
      ],
      selfStake: '120,000 TON',
      status: 'Active'
    }
  ];

  const activeValidators = validators.length > 0 ? validators : fallbackValidators;

  useEffect(() => {
    if (autoValidatorSwitching && activeValidators.length > 0) {
      const sortedByPerformance = [...activeValidators].sort((a, b) => {
        const scoreA = (a.apr || 0) * ((a.uptime || 100) / 100);
        const scoreB = (b.apr || 0) * ((b.uptime || 100) / 100);
        return scoreB - scoreA;
      });
      const best = sortedByPerformance[0];
      if (best && best.id !== selectedValidatorId) {
        setSelectedValidatorId(best.id);
      }
    }
  }, [autoValidatorSwitching, activeValidators, selectedValidatorId]);

  const selectedValidator = activeValidators.find(v => v.id === selectedValidatorId || v.name === selectedValidatorId) || activeValidators[0];
  const showWarning = selectedValidator && selectedValidator.uptime < 99;
  
  const stakedBalance = userProfile.stakedJam || 0;
  const rewards = userProfile.pendingJamRewards || 0;

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    
    setIsStaking(true);
    try {
      await stakeJam(stakeAmount);
      setStakeAmount('');
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (rewards <= 0) return;
    await claimJamRewards();
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
          className="px-2 py-2 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2"
        >
          <img src={TON_LOGO} className="w-3 h-3" alt="" />
          Buy JAM with TON
        </button>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="w-full bg-red-500/10 p-3 rounded-2xl flex items-start gap-3 select-none overflow-hidden"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">
                Warning: Downtime Detected
              </h4>
              <p className="text-[10px] text-red-300/80 font-medium font-sans mt-0.5 leading-normal">
                {selectedValidator.name} is currently underperforming with an uptime SLA of{' '}
                <strong className="text-red-400">{selectedValidator.uptime}%</strong>. Staking with validators below 99% uptime may incur slashing penalties or reduced rewards. We advise choosing a higher performance node.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Staking Stats & Calculator */}
        <div className="lg:col-span-2 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-foreground/[0.02] rounded-2xl p-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lock className="w-full h-full text-foreground" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Staked Balance</p>
              <div className="flex items-center gap-2">
                <img src={TJ_COIN_ICON} className="w-8 h-8 object-contain" alt="" />
                <p className="text-[26px] font-black text-foreground tracking-tighter"><AnimatedNumber value={stakedBalance} /> JAM</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.5% APY Active</span>
                </div>
                {cooldownRemaining > 0 && (
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-[8px] font-black text-amber-400 uppercase tracking-widest animate-pulse leading-none">
                    <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                    <span>Locked: {formatCooldown(cooldownRemaining)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-foreground/[0.02] rounded-2xl p-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-full h-full text-amber-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Pending Rewards</p>
              <div className="flex items-center gap-2">
                <img src={TJ_COIN_ICON} className="w-8 h-8 object-contain" alt="" />
                <p className="text-[26px] font-black text-amber-500 tracking-tighter">{rewards.toFixed(1)} JAM</p>
              </div>
              <button 
                onClick={handleClaim}
                disabled={rewards <= 0}
                className="mt-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2 disabled:opacity-30"
              >
                Claim Rewards <ArrowUpRight className="w-3 h-3" />
              </button>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between p-2 bg-background/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-foreground">Auto-Compound</span>
                  </div>
                  <Switch 
                    checked={autoCompounding}
                    onCheckedChange={setAutoCompounding}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-background/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-foreground">Auto-Validator Switch</span>
                  </div>
                  <Switch 
                    checked={autoValidatorSwitching}
                    onCheckedChange={setAutoValidatorSwitching}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-foreground/[0.02] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Asset Allocation</h3>
              <p className="text-[10px] text-muted-foreground">Staked vs. Rewards</p>
            </div>
            <div className="w-24 h-24">
              <ResponsiveContainerRC width="100%" height="100%">
                <PieChartRC>
                  <PieRC data={[
                    { name: 'Staked', value: stakedBalance },
                    { name: 'Rewards', value: rewards }
                  ]} innerRadius={25} outerRadius={40} dataKey="value">
                    <CellRC fill="#3b82f6" />
                    <CellRC fill="#f59e0b" />
                  </PieRC>
                  <TooltipRC />
                </PieChartRC>
              </ResponsiveContainerRC>
            </div>
          </div>
          <div className="bg-foreground/[0.02] rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">APR Breakdown (15%)</h3>
            <div className="h-24">
               <ResponsiveContainerRC width="100%" height="100%">
                 <BarChartRC data={[{ name: 'APR', baseYield: 10, communityBonus: 5 }]} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGridRC strokeDasharray="3 3" />
                    <XAxisRC type="number" hide />
                    <YAxisRC dataKey="name" type="category" hide />
                    <TooltipRC cursor={{fill: 'transparent'}} />
                    <LegendRC />
                    <BarRC dataKey="baseYield" stackId="a" fill="#3b82f6" name="Base Yield" />
                    <BarRC dataKey="communityBonus" stackId="a" fill="#f59e0b" name="Community Bonus" />
                 </BarChartRC>
               </ResponsiveContainerRC>
              </div>
          </div>
          <StakingRewardsCalculator 
            initialAmount={stakeAmount} 
            availableBalance={balance} 
            validators={activeValidators}
            selectedValidatorId={selectedValidatorId}
            onSelectValidatorId={setSelectedValidatorId}
            autoValidatorSwitching={autoValidatorSwitching}
          />
          <CompoundingSimulator 
            currentValidatorApr={selectedValidator?.apr || 15}
            validatorName={selectedValidator?.name || 'Standard Node'}
          />
          {/* Staking History */}
          <div className="bg-foreground/[0.02] rounded-2xl p-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Staking History</h3>
             <div className="space-y-2">
               {transactions
                 .filter(t => ['stake', 'unstake', 'claim_rewards'].includes(t.type))
                 .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                 .slice(0, 10)
                 .map((tx) => (
                 <div key={tx.id} className="flex items-center justify-between bg-background/20 p-3 rounded-lg text-xs">
                    <span className="text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</span>
                    <span className="font-bold text-foreground">
                      {tx.type === 'stake' ? '+' : tx.type === 'unstake' ? '-' : ''}
                      {tx.amount} JAM
                    </span>
                    <span className="text-[9px] font-bold text-green-500 uppercase">{tx.type.replace('_', ' ')}</span>
                 </div>
               ))}
               {transactions.filter(t => ['stake', 'unstake', 'claim_rewards'].includes(t.type)).length === 0 && (
                 <p className="text-[10px] text-muted-foreground p-3 text-center">No staking history yet.</p>
               )}
             </div>
          </div>
        </div>

        {/* Stake Action */}
        <div className="bg-blue-600/5 rounded-2xl p-2 space-y-2">
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
              className="w-full bg-background/40 rounded-xl p-2 text-xl font-black text-foreground outline-none focus:bg-neutral-500/10 transition-all placeholder:text-muted-foreground/30"
            />
            <button 
              onClick={() => setStakeAmount(balance.toString())}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400"
            >
              Max
            </button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
              Unbonding period: 28 days
            </p>
          </div>
          <button 
            onClick={handleStake}
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-500 hover:to-blue-300 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
