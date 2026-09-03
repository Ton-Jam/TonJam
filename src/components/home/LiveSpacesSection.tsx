import React from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export interface LiveSpaceItem {
  id: string;
  title: string;
  host: string;
  listeners: string;
  status: "LIVE" | "UPCOMING";
}

const STATIC_LIVE_SPACES: LiveSpaceItem[] = [
  { id: "space-1", title: "Afrobeats Producers Lounge 🌍", host: "Ayra Starr", listeners: "1.4k", status: "LIVE" },
  { id: "space-2", title: "TON Creators Hub - Minting Future 🚀", host: "DJ Krupy", listeners: "920", status: "LIVE" },
  { id: "space-3", title: "Music NFT Masterclass v2 💎", host: "Cyber Lord", listeners: "410", status: "LIVE" }
];

export const LiveSpacesSection: React.FC<{ spaces?: LiveSpaceItem[] }> = ({ spaces = STATIC_LIVE_SPACES }) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#FF3A5C] animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Live Audio Spaces
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#FF3A5C] bg-[#FF3A5C]/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
            On Air
          </span>
          <button 
            onClick={() => navigate("/jamspace")} 
            className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
          >
            More <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {spaces.map((room) => (
          <div
            key={room.id}
            className="p-3 sm:p-3.5 rounded-xl bg-transparent hover:bg-white/[0.03] flex items-center justify-between gap-3 border-none transition-colors"
          >
            <div className="space-y-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3A5C] animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                  {room.host} Space
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white leading-tight tracking-tight truncate max-w-[220px] sm:max-w-md">
                {room.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Shared with <strong className="text-white">{room.listeners}</strong> listening</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                confetti({ particleCount: 30, spread: 50 });
                navigate("/jamspace");
              }}
              className="h-8 bg-[#FF3A5C] hover:bg-[#e02d4d] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none transition-transform hover:scale-105 active:scale-95"
            >
              Join
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveSpacesSection;
