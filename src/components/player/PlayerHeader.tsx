import React from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Track } from "@/types";

interface PlayerHeaderProps {
  onClose: () => void;
  onMoreClick?: () => void;
  onQueueClick?: () => void;
  playlistName?: string;
  queueCount?: number;
  track?: Track | null;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = React.memo(({
  onClose,
  onMoreClick,
  onQueueClick,
  playlistName,
  track,
}) => {
  const handleMoreAction = onMoreClick || onQueueClick || (() => {});
  const contextSubtitle = playlistName || track?.album || track?.genre || "TonJam Audio";

  return (
    <header
      id="tonjam-full-player-header"
      className="h-[48px] w-full flex items-center justify-between px-0.5 text-[#FFFFFF] select-none z-30 bg-transparent border-none shadow-none backdrop-blur-none"
      style={{ backgroundColor: "transparent", background: "transparent", border: "none" }}
    >
      {/* Left: Collapse / Back Control */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Minimize player"
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#FFFFFF] hover:bg-white/10 transition-colors active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] border-none bg-transparent"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <ChevronDown className="w-6 h-6 stroke-[2.25]" />
      </button>

      {/* Center: Playing-Source Label */}
      <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center bg-transparent">
        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8FA3BF] flex items-center gap-1.5 truncate">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-[#229ED9]"
          />
          NOW PLAYING
        </span>
        <span className="text-xs font-semibold text-[#FFFFFF] truncate max-w-[200px] sm:max-w-[240px]">
          {contextSubtitle}
        </span>
      </div>

      {/* Right: More-Options Action */}
      <button
        type="button"
        onClick={handleMoreAction}
        aria-label="More options"
        title="Track Options"
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#C2C7CD] hover:text-[#FFFFFF] hover:bg-white/10 transition-colors active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] border-none bg-transparent"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <MoreHorizontal className="w-5 h-5 stroke-[2.25]" />
      </button>
    </header>
  );
});

PlayerHeader.displayName = "PlayerHeader";

export default PlayerHeader;
