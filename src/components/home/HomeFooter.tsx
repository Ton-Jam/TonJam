import React from "react";
import { Disc } from "lucide-react";

export const HomeFooter: React.FC = () => {
  return (
    <footer className="pt-8 pb-12 text-center space-y-2 border-none">
      <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-black">
        TonJam Decentralized Music Marketplace
      </p>
      <div className="flex items-center justify-center gap-2 text-zinc-400 text-[9px] font-bold uppercase tracking-widest">
        <Disc className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
        <span>Smart Node Web3 Interface Connected</span>
      </div>
    </footer>
  );
};

export default HomeFooter;
