import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, BarChart3, Timer, AlertTriangle, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TJ_COIN_ICON } from '@/constants';
import { Switch } from '@/components/ui/switch';

const ResponsiveContainerRC = ResponsiveContainer as any;
const BarChartRC = BarChart as any;
const BarRC = Bar as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;
const LegendRC = Legend as any;

interface CalculatorProps {
  initialAmount?: string;
  availableBalance?: number;
  validators?: any[];
  selectedValidatorId?: string;
  onSelectValidatorId?: (id: string) => void;
  autoValidatorSwitching?: boolean;
}

const getValidatorTrend = (v: any) => {
  if (v.id === 'validator-a' || (v.name && v.name.includes('Node A'))) {
    return { value: '+0.12%', isUp: true };
  }
  if (v.id === 'validator-b' || (v.name && v.name.includes('Node B'))) {
    return { value: '+0.05%', isUp: true };
  }
  if (v.id === 'validator-c' || (v.name && v.name.includes('Node C'))) {
    return { value: '-0.15%', isUp: false };
  }
  const hash = (v.id || v.name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const up = hash % 2 === 0;
  const val = ((hash % 15) / 100).toFixed(2);
  return { value: `${up ? '+' : '-'}${val}%`, isUp: up };
};

const StakingRewardsCalculator: React.FC<CalculatorProps> = ({ 
  initialAmount = '', 
  availableBalance = 0,
  validators,
  selectedValidatorId,
  onSelectValidatorId,
  autoValidatorSwitching = false
}) => {
  const FALLBACK_VALIDATORS = [
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

  const VALIDATORS = validators && validators.length > 0 ? validators : FALLBACK_VALIDATORS;

  const [localSelectedValidatorId, setLocalSelectedValidatorId] = useState('validator-a');
  const [amount, setAmount] = useState(initialAmount);
  const [autoCompound, setAutoCompound] = useState(false);
  const [unstakeType, setUnstakeType] = useState<'standard' | 'instant'>('standard');

  const activeSelectedValidatorId = selectedValidatorId !== undefined ? selectedValidatorId : localSelectedValidatorId;
  const handleSelectValidatorId = onSelectValidatorId !== undefined ? onSelectValidatorId : setLocalSelectedValidatorId;

  const selectedValidator = VALIDATORS.find(v => v.id === activeSelectedValidatorId || v.name === activeSelectedValidatorId) || VALIDATORS[0];
  const apr = selectedValidator.apr;

  const getNextDistributionDetails = () => {
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 1000 * 60;
    const dateUtc = new Date(utcNow);
    
    const currentHour = dateUtc.getUTCHours();
    const targetHour = currentHour < 12 ? 12 : 24;
    
    const target = new Date(dateUtc);
    target.setUTCHours(targetHour, 0, 0, 0);
    
    const diffMs = target.getTime() - dateUtc.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    const totalCycleMs = 12 * 60 * 60 * 1000;
    const elapsedMs = totalCycleMs - diffMs;
    const percentage = (elapsedMs / totalCycleMs) * 100;
    
    return {
      hours,
      minutes,
      seconds,
      percentage: Math.max(0, Math.min(100, percentage)),
      nextTimeStr: targetHour === 12 ? '12:00 UTC' : '00:00 UTC'
    };
  };

  const [cycleData, setCycleData] = useState(() => getNextDistributionDetails());

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleData(getNextDistributionDetails());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const numericAmount = parseFloat(amount) || 0;
  const rate = apr / 100;

  // Unbonding calculations
  const lostRewardsStandard = (numericAmount * rate / 365) * 1.5; // 36 hours of yield lost
  const lostRewardsInstant = (numericAmount * 0.015) + ((numericAmount * rate / 365) * 1.5); // 1.5% penalty fee + 36h unbonding yield lost

  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let yearly = 0;

  if (autoCompound) {
    // Compounded daily: A = P * (1 + r/n)^(n*t) - P
    daily = numericAmount * (rate / 365);
    weekly = numericAmount * Math.pow(1 + rate / 365, 7) - numericAmount;
    monthly = numericAmount * Math.pow(1 + rate / 365, 30) - numericAmount;
    yearly = numericAmount * Math.pow(1 + rate / 365, 365) - numericAmount;
  } else {
    // Simple interest
    daily = (numericAmount * rate) / 365;
    weekly = daily * 7;
    monthly = daily * 30;
    yearly = numericAmount * rate;
  }

  return (
    <div id="staking-rewards-calculator" className="bg-foreground/[0.02] rounded-2xl p-4">
       <div className="flex items-center gap-2 mb-4 text-muted-foreground">
         <Calculator className="w-4 h-4" />
         <h3 className="text-xs font-bold uppercase tracking-widest">Rewards Calculator</h3>
       </div>

       <div className="mb-4 text-xs space-y-2">
         <div className="flex items-center justify-between">
           <p className="text-[10px] font-bold text-muted-foreground uppercase">Select Validator</p>
           {autoValidatorSwitching && (
             <span className="text-[8px] text-blue-400 bg-blue-500/10 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1 leading-none">
               ⚡ Auto-Switch Active
             </span>
           )}
         </div>
         <table className="w-full text-left bg-background/20 rounded-xl overflow-hidden text-[10px]">
           <thead>
             <tr className="text-muted-foreground uppercase">
                <th className="p-2">Validator</th>
                <th className="p-2">Base</th>
                <th className="p-2">Bonus</th>
                <th className="p-2">Total</th>
             </tr>
           </thead>
           <tbody>
             {VALIDATORS.map(v => (
               <tr 
                key={v.name} 
                onClick={() => !autoValidatorSwitching && handleSelectValidatorId(v.id || v.name)}
                className={`${autoValidatorSwitching ? 'cursor-not-allowed opacity-[0.85]' : 'cursor-pointer'} ${v.id === activeSelectedValidatorId || v.name === activeSelectedValidatorId ? 'bg-blue-500/20' : ''} ${!autoValidatorSwitching ? 'hover:bg-white/5' : ''} transition-colors`}
               >
                 <td className="p-2 font-bold text-foreground">{v.name}</td>
                 <td className="p-2 text-blue-400">10%</td>
                 <td className="p-2 text-amber-500">{v.apr - 10}%</td>
                 <td className="p-2 font-bold text-emerald-400">
                   <div className="flex items-center gap-1.5 select-none">
                     <span>{v.apr}%</span>
                     {(() => {
                       const trend = getValidatorTrend(v);
                       return (
                         <span className={`text-[8px] font-mono px-1 py-0.5 rounded-sm shrink-0 leading-none font-bold ${
                           trend.isUp 
                             ? 'bg-emerald-500/10 text-emerald-400' 
                             : 'bg-red-500/10 text-red-400'
                         }`}>
                           {trend.value}
                         </span>
                       );
                     })()}
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>

         {/* Drill-down details of selected validator (Frameless, compact for mobile) */}
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           key={(selectedValidator as any).name}
           className="mt-2.5 bg-foreground/[0.03] rounded-xl p-3 space-y-3"
         >
           <div className="flex items-center justify-between text-[9px] text-muted-foreground uppercase font-black">
             <span>{(selectedValidator as any).name} Metrics</span>
             <span className="text-emerald-400">● {(selectedValidator as any).status}</span>
           </div>

           <div className="grid grid-cols-2 gap-2">
             <div className="bg-background/40 p-2 rounded-lg space-y-0.5">
               <span className="text-[8px] text-muted-foreground uppercase tracking-wider block">Uptime SLA</span>
               <p className="text-xs font-black text-foreground">{(selectedValidator as any).uptime}%</p>
               <div className="w-16 h-1 bg-emerald-500/10 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(selectedValidator as any).uptime}%` }} />
               </div>
             </div>
             
             <div className="bg-background/40 p-2 rounded-lg space-y-0.5">
               <span className="text-[8px] text-muted-foreground uppercase tracking-wider block">Validated Blocks</span>
               <p className="text-xs font-black text-foreground">{(selectedValidator as any).blocksValidated}</p>
               <p className="text-[7px] text-muted-foreground uppercase leading-none mt-1">Sustained Output</p>
             </div>

             <div className="bg-background/40 p-2 rounded-lg space-y-0.5">
               <span className="text-[8px] text-muted-foreground uppercase tracking-wider block">Self Bonded</span>
               <p className="text-xs font-black text-foreground">{(selectedValidator as any).selfStake}</p>
               <p className="text-[7px] text-blue-400 font-bold uppercase leading-none mt-1">Guaranteed stake</p>
             </div>

             <div className="bg-background/40 p-2 rounded-lg space-y-0.5">
               <span className="text-[8px] text-muted-foreground uppercase tracking-wider block">Current Commission</span>
               <p className="text-xs font-black text-foreground">{(selectedValidator as any).currentCommission}</p>
               <p className="text-[7px] text-amber-400 font-bold uppercase leading-none mt-1">Protocol Minimum</p>
             </div>
           </div>

           {/* Historical Commission Changes List (Drill-Down Detail) */}
           <div className="space-y-1.5 pt-1">
             <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Historical Commission Fee Changes</span>
             <div className="flex items-center justify-between gap-1.5">
               {((selectedValidator as any).commissionHistory || []).map((history: any, hIdx: number) => (
                 <div key={hIdx} className="flex-1 bg-background/30 rounded-lg p-1.5 text-center text-[9px] relative">
                   <span className="text-[8px] text-muted-foreground block font-mono leading-none mb-0.5">{history.date}</span>
                   <span className="font-extrabold text-foreground">{history.fee}</span>
                   {hIdx < (selectedValidator as any).commissionHistory.length - 1 && (
                     <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-muted-foreground/35 text-[9px] font-black pointer-events-none select-none">→</span>
                   )}
                 </div>
               ))}
             </div>
           </div>
         </motion.div>

          {/* Next Reward Distribution Timeline (Frameless, borderless, matching typography rules) */}
          <div className="bg-blue-500/[0.02] rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center">Rewards Timeline</span>
              </div>
              <span className="text-[8px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
                Epoch Step
              </span>
            </div>

            {/* Elegant Horizontal Progress Connector (Line-free custom connector) */}
            <div className="relative pt-1">
              <div className="h-1 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-transparent rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${cycleData.percentage}%` }}
                />
              </div>
            </div>

            {/* Timeline Milestones (3 dynamic points) */}
            <div className="grid grid-cols-3 gap-2 text-center select-none pt-0.5">
              {/* Milestone 1: Snapshot */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider font-mono">Snapshot</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground leading-normal font-mono">
                  Cycle started epoch logged
                </p>
              </div>

              {/* Milestone 2: Validation */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block shrink-0 animate-ping absolute" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0 relative" />
                  <span className="text-[8px] text-blue-400 font-black uppercase tracking-wider font-mono">Validating</span>
                </div>
                <div className="text-[7.5px] text-foreground font-semibold px-1 py-0.5 rounded bg-blue-500/10 inline-block mx-auto leading-none font-mono">
                  {cycleData.percentage.toFixed(0)}% Done
                </div>
              </div>

              {/* Milestone 3: Distribution */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 inline-block shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.3)]" />
                  <span className="text-[8px] text-amber-400 font-black uppercase tracking-wider font-mono">Pay Window</span>
                </div>
                <p className="text-[7.5px] text-muted-foreground leading-normal font-mono">
                  Est: {cycleData.nextTimeStr}
                </p>
              </div>
            </div>

            {/* Countdown Alert Notification Block (No border lines) */}
            <div className="flex items-center justify-between p-2.5 bg-background/30 rounded-lg">
              <div className="space-y-0.5">
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-bold font-mono">NEXT REWARD WINDOW</span>
                <span className="text-[9px] text-foreground leading-normal font-medium block font-bold">
                  Epoch block finality timer:
                </span>
              </div>
              <div className="text-right shrink-0 pl-2">
                <span className="font-mono font-black text-xs text-emerald-400 tabular-nums">
                  {cycleData.hours.toString().padStart(2, '0')}h {cycleData.minutes.toString().padStart(2, '0')}m {cycleData.seconds.toString().padStart(2, '0')}s
                </span>
                <span className="text-[7px] text-muted-foreground block uppercase font-black tracking-widest mt-0.5 font-mono">Time Remaining</span>
              </div>
            </div>
          </div>
       </div>

       <div className="relative">
        <input 
            id="calculator-amount-input"
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to stake"
            className="w-full bg-background/40 rounded-xl p-2 text-sm font-black text-foreground outline-none mb-4 focus:bg-neutral-500/10 transition-all placeholder:text-muted-foreground/30"
        />
        <button 
          onClick={() => setAmount(availableBalance.toString())}
          className="absolute right-4 top-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400"
        >
          Max
        </button>
       </div>
       
       {/* Auto-Compound Control (No border lines) */}
       <div className="flex items-center justify-between mb-4 bg-background/25 rounded-xl p-3 select-none">
         <div className="space-y-0.5 pr-2">
           <div className="flex items-center gap-1.5 flex-wrap">
             <span className="text-[10px] font-black uppercase tracking-wider text-foreground">Auto-Compound</span>
             <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
               Daily Restake
             </span>
           </div>
           <p className="text-[9px] text-muted-foreground leading-normal max-w-[215px]">
             Automatically restake earned daily rewards on the current validator's APR to earn an estimated APY of {((Math.pow(1 + rate / 365, 365) - 1) * 100).toFixed(2)}%.
           </p>
         </div>
         <Switch 
           checked={autoCompound} 
           onCheckedChange={setAutoCompound}
           className="scale-90 data-[state=checked]:bg-blue-600 cursor-pointer shrink-0"
         />
       </div>

       <div className="grid grid-cols-2 gap-2 text-xs">
         <div id="calc-daily" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Daily</p>
            <p className="font-bold text-emerald-400">{daily.toFixed(4)} JAM</p>
         </div>
         <div id="calc-weekly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Weekly</p>
            <p className="font-bold text-emerald-400">{weekly.toFixed(4)} JAM</p>
         </div>
         <div id="calc-monthly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Monthly</p>
            <p className="font-bold text-emerald-400">{monthly.toFixed(2)} JAM</p>
         </div>
         <div id="calc-yearly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Yearly ({autoCompound ? `APY ${((Math.pow(1 + rate / 365, 365) - 1) * 100).toFixed(2)}%` : `APR ${apr}%`})</p>
            <p className="font-bold text-emerald-400">{yearly.toFixed(2)} JAM</p>
         </div>
       </div>

       {/* Unbonding Simulator (No borders style, matching application spacing metrics) */}
        <div className="mt-5 bg-orange-500/[0.02] rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5 text-orange-400/90">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Unbonding Simulation</span>
            </div>
            <span className="text-[8px] bg-orange-500/10 text-orange-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
              Exit Forecast
            </span>
          </div>

          <p className="text-[9px] text-muted-foreground leading-normal">
            Simulate cooldown periods and penalty profiles when unstaking <strong>{numericAmount > 0 ? numericAmount.toLocaleString() : '0'} JAM</strong> from {selectedValidator.name}.
          </p>

          <div className="flex bg-background/30 rounded-lg p-0.5 select-none gap-0.5">
            <button
              type="button"
              onClick={() => setUnstakeType('standard')}
              className={`flex-1 text-[8px] font-bold uppercase tracking-wider py-1 rounded transition-all text-center cursor-pointer ${
                unstakeType === 'standard'
                  ? 'bg-orange-500/15 text-orange-400 font-black'
                  : 'text-muted-foreground hover:bg-neutral-500/5'
              }`}
            >
              Standard (36h)
            </button>
            <button
              type="button"
              onClick={() => setUnstakeType('instant')}
              className={`flex-1 text-[8px] font-bold uppercase tracking-wider py-1 rounded transition-all text-center cursor-pointer ${
                unstakeType === 'instant'
                  ? 'bg-rose-500/15 text-rose-400 font-black'
                  : 'text-muted-foreground hover:bg-neutral-500/5'
              }`}
            >
              Instant Force
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-background/20 p-2 rounded-lg space-y-0.5">
              <span className="text-[8px] text-muted-foreground uppercase">Estimated Wait</span>
              <p className={`font-black text-xs ${unstakeType === 'standard' ? 'text-orange-400' : 'text-rose-400'}`}>
                {unstakeType === 'standard' ? '36 Hours' : '0 Hours (Immediate)'}
              </p>
            </div>
            <div className="bg-background/20 p-2 rounded-lg space-y-0.5">
              <span className="text-[8px] text-muted-foreground uppercase">Estimated Forfeit / Fee</span>
              <p className="font-black text-xs text-rose-400">
                {unstakeType === 'standard' 
                  ? `${lostRewardsStandard.toFixed(4)} JAM` 
                  : `${lostRewardsInstant.toFixed(4)} JAM`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-1.5 p-2 bg-background/10 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[8px] text-muted-foreground/80 leading-normal">
              {unstakeType === 'standard' 
                ? 'Standard unstaking places assets into a cooldown queue for 36 hours. Staked principal does not yield rewards or allow transfers until the period completes fully.'
                : 'Emergency withdrawal bypasses the 36-hour unbonding cycle immediately but incurs a 1.5% network fee in addition to surrendering all pending staking yield.'}
            </p>
          </div>
        </div>

        {/* Validator Performance Comparison */}
       <div className="mt-6 text-xs">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Validator Comparison</span>
          </div>
          <div className="h-44 w-full bg-background/20 rounded-2xl p-3 flex items-center justify-center">
            <ResponsiveContainerRC width="100%" height="100%">
              <BarChartRC
                data={VALIDATORS.map(v => ({
                  name: v.name.replace('TonJam ', ''),
                  APR: v.apr,
                  Uptime: v.uptime !== undefined ? v.uptime : (v.apr === 15 ? 99.9 : v.apr === 14 ? 99.5 : 98.8)
                }))}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxisRC 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxisRC 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <TooltipRC
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '10px',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <BarRC dataKey="APR" name="APR %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <BarRC dataKey="Uptime" name="Uptime %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChartRC>
            </ResponsiveContainerRC>
          </div>
       </div>
    </div>
  );
};

export default StakingRewardsCalculator;
