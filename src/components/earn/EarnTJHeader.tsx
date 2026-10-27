import React, { useState } from 'react';
import { ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TJ_COIN_ICON } from '@/constants';

interface EarnTJHeaderProps {
  onInfoClick?: () => void;
}

export const EarnTJHeader: React.FC<EarnTJHeaderProps> = ({ onInfoClick }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 w-full bg-[#080D1A]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3 shrink-0">
      {/* LEFT: BACK BUTTON & TITLE */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none shrink-0 active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
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
