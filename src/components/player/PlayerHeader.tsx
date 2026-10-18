import React from "react";
import { ChevronDown, MoreVertical, Radio } from "lucide-react";
import { Track } from "@/types";

interface PlayerHeaderProps {
  onClose: () => void;
  onMoreClick: () => void;
  playlistName?: string;
  track?: Track | null;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  onClose,
  onMoreClick,
  playlistName = "TonJam Feed",
  track
}) => {
  return (
    <header 
      id="tonjam-full-player-header"
      className="h-[48px] w-full flex items-center justify-between px-1 text-[#FFFFFF] select-none z-20 bg-transparent !bg-transparent border-none shadow-none backdrop-blur-none"
      style={{ backgroundColor: "transparent", background: "transparent" }}
    >
      {/* Left: Minimize / Collapse button */}
      <button
        onClick={onClose}
        aria-label="Minimize player"
        className="w-10 h-10 flex items-center justify-center rounded-[12px] text-[#C2C7CD] hover:text-[#FFFFFF] hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -ml-1 border-none bg-transparent shadow-none"
        style={{ backgroundColor: "transparent" }}
      >
        <ChevronDown className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Center: Context Label */}
      <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center bg-transparent">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C8C8C] flex items-center gap-1.5 truncate">
          <Radio className="w-3 h-3 text-[#00B4D8] animate-pulse" />
          NOW PLAYING
        </span>
        <span className="text-xs font-semibold text-[#FFFFFF] truncate max-w-[220px]">
          {playlistName || track?.genre || "TonJam Music"}
        </span>
      </div>

      {/* Right: More options */}
      <button
        onClick={onMoreClick}
        aria-label="Track options"
        className="w-10 h-10 flex items-center justify-center rounded-[12px] text-[#C2C7CD] hover:text-[#FFFFFF] hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -mr-1 border-none bg-transparent shadow-none"
        style={{ backgroundColor: "transparent" }}
      >
        <MoreVertical className="w-5 h-5 stroke-[2]" />
      </button>
    </header>
  );
};

export default PlayerHeader;
