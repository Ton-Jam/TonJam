import React from 'react';
import { useTonPrice } from '@/contexts/TonPriceContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const JamTokenDashboard: React.FC = () => {
  const { price, loading, error } = useTonPrice();

  return (
    <div className="bg-[#1c1c1e]/40 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">JAM Token</h2>
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-extrabold mb-6 text-white tracking-tight">
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
