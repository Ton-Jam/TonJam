import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Coins, HelpCircle, Sparkles, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TJ_COIN_ICON } from '@/constants';

const ResponsiveContainerRC = ResponsiveContainer as any;
const AreaChartRC = AreaChart as any;
const AreaRC = Area as any;
const XAxisRC = XAxis as any;
const YAxisRC = YAxis as any;
const TooltipRC = Tooltip as any;

interface CompoundingSimulatorProps {
  currentValidatorApr: number;
  validatorName: string;
}

const CompoundingSimulator: React.FC<CompoundingSimulatorProps> = ({ currentValidatorApr, validatorName }) => {
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [timeHorizon, setTimeHorizon] = useState<number>(12); // months
  const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('daily');

  // Compute stats
  const stats = useMemo(() => {
    const P = stakeAmount;
    const r = currentValidatorApr / 100;
    const t = timeHorizon / 12;

    let n = 1;
    let compoundLabel = 'None';
    if (compoundFrequency === 'daily') {
      n = 365;
      compoundLabel = 'Daily';
    } else if (compoundFrequency === 'weekly') {
      n = 52;
      compoundLabel = 'Weekly';
    } else if (compoundFrequency === 'monthly') {
      n = 12;
      compoundLabel = 'Monthly';
    }

    let finalAmount = 0;
    if (compoundFrequency === 'none') {
      finalAmount = P * (1 + r * t);
    } else {
      finalAmount = P * Math.pow(1 + r / n, n * t);
    }

    const totalRewards = Math.max(0, finalAmount - P);
    const effectiveApy = P > 0 ? ((finalAmount / P) - 1) * (12 / timeHorizon) * 100 : 0;
    const percentageGain = P > 0 ? (totalRewards / P) * 100 : 0;

    // Generate month-by-month trajectory data for the chart
    const trajectoryData = [];
    for (let m = 0; m <= timeHorizon; m++) {
      const currentYearFraction = m / 12;
      let monthAmount = P;
      if (compoundFrequency === 'none') {
        monthAmount = P * (1 + r * currentYearFraction);
      } else {
        monthAmount = P * Math.pow(1 + r / n, n * currentYearFraction);
      }
      trajectoryData.push({
        month: `Mo ${m}`,
        Principal: Math.round(P),
        Rewards: Math.max(0, Math.round(monthAmount - P)),
        Total: Math.round(monthAmount)
      });
    }

    return {
      finalAmount,
      totalRewards,
      effectiveApy,
      percentageGain,
      trajectoryData
    };
  }, [stakeAmount, timeHorizon, compoundFrequency, currentValidatorApr]);

  return (
    <div className="bg-foreground/[0.02] rounded-3xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-xl text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">JAM Compound Simulator</h3>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Compounding Interest Projection</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 rounded-full">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">{validatorName} ({currentValidatorApr}% APR)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          {/* Stake Amount Input/Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Simulation Stake Amount</span>
              <span className="text-foreground font-black text-xs">{stakeAmount.toLocaleString()} JAM</span>
            </div>
            <input 
              type="range"
              min="50"
              max="25000"
              step="50"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-background/50 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-black">
              <span>50 JAM</span>
              <span>10,000 JAM</span>
              <span>25,000 JAM</span>
            </div>
          </div>

          {/* Time Horizon Input/Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Time Horizon</span>
              <span className="text-foreground font-black text-xs">{timeHorizon} Months ({ (timeHorizon/12).toFixed(1) } yrs)</span>
            </div>
            <input 
              type="range"
              min="1"
              max="36"
              step="1"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-background/50 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground/60 font-black">
              <span>1 Month</span>
              <span>12 Months</span>
              <span>36 Months</span>
            </div>
          </div>

          {/* Compounding Frequency Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Compounding Frequency
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-background/30 p-1 rounded-xl">
              {(['daily', 'weekly', 'monthly', 'none'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setCompoundFrequency(freq)}
                  className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all text-center cursor-pointer ${
                    compoundFrequency === freq
                      ? 'bg-blue-600/20 text-blue-400 font-extrabold'
                      : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Educational Note */}
          <div className="flex items-start gap-2 p-2.5 bg-background/20 rounded-xl">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-muted-foreground/80 leading-relaxed font-sans">
              Compounding frequency determines how often reward yield is added back to your active staking base. More frequent compounding builds your reward capacity faster.
            </p>
          </div>
        </div>

        {/* Results / Visual Graph */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-background/20 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-bold">Total Gain</span>
              <p className="text-xs font-black text-green-400">+{stats.percentageGain.toFixed(1)}%</p>
            </div>
            <div className="bg-background/20 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-bold">Yield APY</span>
              <p className="text-xs font-black text-blue-400">{currentValidatorApr}%</p>
            </div>
            <div className="bg-background/20 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-bold">Net Return</span>
              <p className="text-xs font-black text-amber-400">+{Math.round(stats.totalRewards).toLocaleString()} JAM</p>
            </div>
          </div>

          {/* Chart Wrapper with responsive container */}
          <div className="bg-background/30 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Growth Curve Over Time</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[8px] font-bold text-muted-foreground uppercase">Value: {Math.round(stats.finalAmount).toLocaleString()} JAM</span>
              </div>
            </div>
            <div className="h-[105px] w-full">
              <ResponsiveContainerRC width="100%" height="100%">
                <AreaChartRC data={stats.trajectoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxisRC 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxisRC 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <TooltipRC
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', fontSize: '9px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a1a1aa' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <AreaRC type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChartRC>
              </ResponsiveContainerRC>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundingSimulator;
