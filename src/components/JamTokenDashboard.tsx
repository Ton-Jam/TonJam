import React from 'react';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { TON_LOGO } from '@/constants';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const JamTokenDashboard: React.FC = () => {
  const { price, loading, error } = useTonPrice();

  return (
    <div className="bg-[#1c1c1e]/40 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">JAM / GRAM Price</h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-extrabold mb-6 text-white tracking-tight flex items-center gap-2">
            <img src={TON_LOGO} alt="TON" className="w-6 h-6 object-contain" />
            ${price?.toFixed(2) ?? '0.00'}
          </div>
          <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold transition-all">
            Swap
          </Button>
        </>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
};
