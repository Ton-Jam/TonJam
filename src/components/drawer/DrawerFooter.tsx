import React from 'react';
import { Settings, HelpCircle, LogOut } from 'lucide-react';

interface DrawerFooterProps {
  isAuthenticated: boolean;
  onNavigate?: (path: string) => void;
  onSignOutClick?: () => void;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  isAuthenticated,
  onNavigate,
  onSignOutClick,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 pt-2 pb-1 select-none">
      <div className="w-full h-px bg-white/[0.04]" />

      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onNavigate?.('/settings')}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer outline-none"
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('/about')}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer outline-none"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>About & Support</span>
        </button>

        {isAuthenticated && (
          <button
            type="button"
            onClick={onSignOutClick}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition-colors cursor-pointer outline-none mt-0.5"
          >
            <LogOut className="w-4 h-4 text-rose-400/80 shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      <div className="px-3.5 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>TonJam Web3 Audio</span>
        <span className="font-mono">v1.4.2</span>
      </div>
    </div>
  );
};

export default DrawerFooter;
