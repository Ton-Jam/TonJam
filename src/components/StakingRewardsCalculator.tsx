import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator } from 'lucide-react';
import { TJ_COIN_ICON } from '@/constants';

interface CalculatorProps {
  initialAmount?: string;
  availableBalance?: number;
}

const StakingRewardsCalculator: React.FC<CalculatorProps> = ({ initialAmount = '', availableBalance = 0 }) => {
  const VALIDATORS = [
    { name: 'TonJam Node A', apr: 15 },
    { name: 'TonJam Node B', apr: 14 },
    { name: 'TonJam Node C', apr: 13 },
  ];

  const [amount, setAmount] = useState(initialAmount);
  const [selectedValidator, setSelectedValidator] = useState(VALIDATORS[0]);
  const apr = selectedValidator.apr;

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const numericAmount = parseFloat(amount) || 0;
  const daily = numericAmount * (apr / 100) / 365;
  const weekly = daily * 7;
  const monthly = daily * 30;
  const yearly = numericAmount * (apr / 100);

  return (
    <div id="staking-rewards-calculator" className="bg-foreground/[0.02] rounded-2xl p-4">
       <div className="flex items-center gap-2 mb-4 text-muted-foreground">
         <Calculator className="w-4 h-4" />
         <h3 className="text-xs font-bold uppercase tracking-widest">Rewards Calculator</h3>
       </div>

       <div className="mb-4 text-xs space-y-2">
         <p className="text-[10px] font-bold text-muted-foreground uppercase">Select Validator</p>
         <table className="w-full text-left border-collapse bg-background/20 rounded-xl overflow-hidden text-[10px]">
           <thead>
             <tr className="border-b border-foreground/5 text-muted-foreground uppercase">
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
                onClick={() => setSelectedValidator(v)}
                className={`cursor-pointer ${selectedValidator.name === v.name ? 'bg-blue-500/20' : ''} hover:bg-white/5 transition-colors`}
               >
                 <td className="p-2 font-bold text-foreground">{v.name}</td>
                 <td className="p-2 text-blue-400">10%</td>
                 <td className="p-2 text-amber-500">{v.apr - 10}%</td>
                 <td className="p-2 font-bold text-emerald-400">{v.apr}%</td>
               </tr>
             ))}
           </tbody>
         </table>
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
       
       <div className="grid grid-cols-2 gap-2 text-xs">
         <div id="calc-daily" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Daily</p>
            <p className="font-bold text-emerald-400">{daily.toFixed(2)} JAM</p>
         </div>
         <div id="calc-weekly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Weekly</p>
            <p className="font-bold text-emerald-400">{weekly.toFixed(2)} JAM</p>
         </div>
         <div id="calc-monthly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Monthly</p>
            <p className="font-bold text-emerald-400">{monthly.toFixed(2)} JAM</p>
         </div>
         <div id="calc-yearly" className="bg-background/20 p-2 rounded-lg">
            <p className="text-[9px] text-muted-foreground uppercase">Yearly (APR {apr}%)</p>
            <p className="font-bold text-emerald-400">{yearly.toFixed(2)} JAM</p>
         </div>
       </div>
    </div>
  );
};

export default StakingRewardsCalculator;
