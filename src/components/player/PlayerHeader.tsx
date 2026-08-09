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
    <header className="h-[44px] w-full flex items-center justify-between px-4 text-[#F2F4F8] select-none z-20 bg-transparent">
      {/* Left: Minimize button */}
      <button
        onClick={onClose}
        aria-label="Minimize player"
        className="w-9 h-9 flex items-center justify-center rounded-[12px] text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#0A113A] transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Center: Context Label */}
      <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#9AA0AE] flex items-center gap-1.5 truncate">
          <Radio className="w-3 h-3 text-[#0098EA] animate-pulse" />
          NOW PLAYING
        </span>
        <span className="text-xs font-medium text-[#F2F4F8] truncate max-w-[200px]">
          {playlistName || track?.genre || "TonJam Music"}
        </span>
      </div>

      {/* Right: More options */}
      <button
        onClick={onMoreClick}
        aria-label="Track options"
        className="w-9 h-9 flex items-center justify-center rounded-[12px] text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#0A113A] transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </header>
  );
};

export default PlayerHeader;
