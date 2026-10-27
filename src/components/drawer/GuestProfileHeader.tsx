import React from 'react';
import { LogIn } from 'lucide-react';
import { APP_LOGO } from '@/constants';

interface GuestProfileHeaderProps {
  onSignIn?: () => void;
}

export const GuestProfileHeader: React.FC<GuestProfileHeaderProps> = ({ onSignIn }) => {
  return (
    <div className="w-full rounded-2xl bg-white/[0.04] p-4 flex flex-col gap-3 text-left select-none relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#229ED9]/15 flex items-center justify-center shrink-0">
          <img src={APP_LOGO} alt="TonJam" className="w-7 h-7 object-contain" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-sm font-extrabold text-white tracking-tight">
            Welcome to TonJam
          </h2>
          <p className="text-[11px] text-slate-400">
            Web3 Music & NFT Marketplace
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Sign in to access your profile, personal library, playlists, and earn TJ rewards.
      </p>

      <button
        type="button"
        onClick={onSignIn}
        className="w-full py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none shadow-md"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    </div>
  );
};

export default GuestProfileHeader;
