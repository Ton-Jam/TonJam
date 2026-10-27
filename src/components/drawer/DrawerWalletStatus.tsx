import React from 'react';
import { Wallet, Coins, ChevronRight } from 'lucide-react';
import { TON_LOGO, TJ_COIN_ICON } from '@/constants';

interface DrawerWalletStatusProps {
  tonAddress?: string | null;
  tjBalance?: number | null;
  onNavigate?: (path: string) => void;
}

export const DrawerWalletStatus: React.FC<DrawerWalletStatusProps> = ({
  tonAddress,
  tjBalance,
  onNavigate,
}) => {
  const isConnected = Boolean(tonAddress && tonAddress.length > 8);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formattedTj = typeof tjBalance === 'number' ? tjBalance.toLocaleString() : '0';

  return (
    <div className="w-full rounded-2xl bg-white/[0.04] p-3 flex flex-col gap-2.5 text-left select-none">
      {/* WALLET STATUS ROW */}
      <button
        type="button"
        onClick={() => onNavigate?.('/wallet')}
        className="w-full flex items-center justify-between group cursor-pointer outline-none text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#229ED9]/15 flex items-center justify-center shrink-0">
            <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
                }`}
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isConnected ? 'TON Connected' : 'Wallet Unlinked'}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-white truncate">
              {isConnected ? formatAddress(tonAddress!) : 'Connect Wallet'}
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>

      {/* TJ REWARDS QUICK STATUS */}
      <button
        type="button"
        onClick={() => onNavigate?.('/tasks')}
        className="w-full flex items-center justify-between pt-2 border-t border-white/[0.04] group cursor-pointer outline-none text-left"
      >
        <div className="flex items-center gap-2">
          <img src={TJ_COIN_ICON} alt="TJ" className="w-4 h-4 object-contain shrink-0" />
          <span className="text-[11px] font-medium text-slate-300">TJ Rewards</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#229ED9] group-hover:text-white transition-colors">
          <span>{formattedTj} TJ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
};

export default DrawerWalletStatus;
