import React from "react";
import { Disc, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HomeFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center space-y-3 border-none">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/partnerships')}
          className="px-4 py-2 rounded-full bg-[#111C30] hover:bg-[#17243A] text-[#229ED9] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>Partner With TonJam</span>
        </button>
      </div>

      <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-black">
        TonJam Decentralized Music Marketplace
      </p>
      <div className="flex items-center justify-center gap-2 text-zinc-400 text-[9px] font-bold uppercase tracking-widest">
        <Disc className="w-3.5 h-3.5 text-[#229ED9] animate-spin" style={{ animationDuration: '4s' }} />
        <span>Smart Node Web3 Interface Connected</span>
      </div>
    </footer>
  );
};

export default HomeFooter;
