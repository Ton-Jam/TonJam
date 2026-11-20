import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';
import { useNavigate } from 'react-router-dom';
import { TJ_COIN_ICON } from '@/constants';

interface EarnTJHeaderProps {
  onInfoClick?: () => void;
}

export const EarnTJHeader: React.FC<EarnTJHeaderProps> = ({ onInfoClick }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: 'var(--tj-header-bg, transparent)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      className="sticky top-0 z-30 w-full bg-transparent backdrop-blur-none backdrop-filter-none border-none shadow-none px-4 py-3 flex items-center justify-between gap-3 shrink-0"
    >
      {/* LEFT: BACK BUTTON & TITLE */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-transparent hover:bg-white/10 text-[#FFFFFF] flex items-center justify-center transition-colors cursor-pointer outline-none border-none shrink-0 active:scale-95"
          aria-label="Go back"
        >
          <TonJamBackArrow size="md" />
        </button>

        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
              Earn TJ
            </h1>
            <img 
              src={TJ_COIN_ICON} 
              alt="TJ Coin" 
              className="w-5 h-5 object-contain shrink-0"
            />
          </div>
          <p className="text-[11px] font-medium text-slate-400 truncate">
            Complete tasks. Earn rewards.
          </p>
        </div>
      </div>

      {/* RIGHT: INFO BUTTON */}
      <button
        onClick={onInfoClick}
        className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none shrink-0 active:scale-95"
        title="About TJ Rewards"
        aria-label="About TJ Rewards"
      >
        <Info className="w-4 h-4 text-[#229ED9]" />
      </button>
    </div>
  );
};

export default EarnTJHeader;
