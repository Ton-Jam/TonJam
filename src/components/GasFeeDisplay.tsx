import React, { useEffect, useState } from 'react';
import { getEstimatedGasFee, simulateTransaction, getTonPrice } from '@/services/tonService';
import { Zap, PlayCircle, Loader2, CheckCircle2, XCircle, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GasFeeDisplay: React.FC<{ 
  variant?: 'default' | 'inline', 
  className?: string,
  transactionData?: any 
}> = ({ variant = 'default', className, transactionData }) => {
  const [gasFee, setGasFee] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{success: boolean, message: string} | null>(null);
  const [showInUsd, setShowInUsd] = useState(false);
  const [tonPrice, setTonPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchFee = async () => {
      const fee = await getEstimatedGasFee();
      setGasFee(fee);
    };
    const fetchPrice = async () => {
      const price = await getTonPrice();
      setTonPrice(price);
    };
    fetchFee();
    fetchPrice();
    
    // Refresh fee every 30 seconds
    const interval = setInterval(fetchFee, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleCurrency = () => setShowInUsd(!showInUsd);

  const formatCurrency = (amount: number) => {
    if (showInUsd && tonPrice) {
      return `$${(amount * tonPrice).toFixed(2)}`;
    }
    return `${amount.toFixed(3)} TON`;
  };

  const handleSimulate = async () => {
    if (!transactionData) return;
    setIsSimulating(true);
    setSimulationResult(null);
    const result = await simulateTransaction(transactionData);
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const SimulationButton = () => (
    <button 
      onClick={handleSimulate}
      disabled={isSimulating || !transactionData}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full border border-zinc-700 text-[10px] font-bold text-white transition-all",
        !transactionData && "opacity-50 cursor-not-allowed"
      )}
    >
      {isSimulating ? <Loader2 className="w-3 h-3 animate-spin"/> : <PlayCircle className="w-3 h-3"/>}
      Simulate
    </button>
  );

  if (variant === 'inline') {
    return (
       <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-2">
            <button 
               onClick={toggleCurrency}
               className="flex items-center gap-1.5 font-mono text-foreground font-black text-sm hover:text-white transition-colors"
            >
                <span>{gasFee !== null ? formatCurrency(gasFee) : '...'}</span>
                {showInUsd ? <DollarSign className="w-3 h-3 text-emerald-400" /> : <Wallet className="w-3 h-3 text-orange-400" />}
            </button>
            <SimulationButton />
        </div>
        {simulationResult && (
            <div className={cn("text-[9px] font-bold flex items-center gap-1 mt-1", simulationResult.success ? "text-emerald-400" : "text-rose-400")}>
                {simulationResult.success ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                {simulationResult.message}
            </div>
        )}
       </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col gap-2 p-2 bg-neutral-900/50 rounded-lg border border-zinc-500/30", className)}>
        <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Estimated Gas:</span>
                <button 
                  onClick={toggleCurrency}
                  className="font-mono text-white hover:text-white/80 transition-colors"
                >
                  {gasFee !== null ? formatCurrency(gasFee) : 'Loading...'}
                </button>
            </div>
            <SimulationButton />
        </div>
        {simulationResult && (
            <div className={cn("text-[10px] font-bold flex items-center gap-1.5 mt-1 p-2 rounded bg-opacity-20", simulationResult.success ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300")}>
                {simulationResult.success ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                {simulationResult.message}
            </div>
        )}
    </div>
  );
};
