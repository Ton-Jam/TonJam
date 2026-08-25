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
    <header className="h-[44px] w-full flex items-center justify-between px-1 text-[#F2F4F8] select-none z-20 bg-transparent">
      {/* Left: Minimize button */}
      <button
        onClick={onClose}
        aria-label="Minimize player"
        className="w-10 h-10 flex items-center justify-center rounded-[12px] text-white/90 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -ml-1"
      >
        <ChevronDown className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Center: Context Label */}
      <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#9AA0AE] flex items-center gap-1.5 truncate">
          <Radio className="w-3 h-3 text-[#0179f4] animate-pulse" />
          NOW PLAYING
        </span>
        <span className="text-xs font-semibold text-[#F2F4F8] truncate max-w-[200px]">
          {playlistName || track?.genre || "TonJam Music"}
        </span>
      </div>

      {/* Right: More options */}
      <button
        onClick={onMoreClick}
        aria-label="Track options"
        className="w-10 h-10 flex items-center justify-center rounded-[12px] text-white/90 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -mr-1"
      >
        <MoreVertical className="w-6 h-6 stroke-[2.5]" />
      </button>
    </header>
  );
};

export default PlayerHeader;
