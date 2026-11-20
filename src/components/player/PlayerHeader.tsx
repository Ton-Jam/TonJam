import React from "react";
import { ChevronDown, ListMusic, Radio } from "lucide-react";
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
  queueCount = 0,
  track,
}) => {
  const handleQueueClick = onQueueClick || onMoreClick || (() => {});
  const contextSubtitle = playlistName || track?.album || track?.genre || "TonJam Music";

  return (
    <header
      id="tonjam-full-player-header"
      className="h-[48px] w-full flex items-center justify-between px-1 text-[#FFFFFF] select-none z-30 bg-transparent border-none shadow-none backdrop-blur-none"
      style={{ backgroundColor: "transparent", background: "transparent", border: "none" }}
    >
      {/* Left: Minimize / Collapse button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Minimize player"
        className="w-10 h-10 flex items-center justify-center rounded-[var(--tj-radius-md,10px)] text-[#FFFFFF] hover:text-[#FFFFFF] hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -ml-1 border-none bg-transparent shadow-none"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <ChevronDown className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Center: Context Label */}
      <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center bg-transparent">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C8C8C] flex items-center gap-1.5 truncate">
          <Radio className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)] animate-pulse" />
          NOW PLAYING
        </span>
        <span className="text-xs font-semibold text-[#FFFFFF] truncate max-w-[200px] sm:max-w-[240px]">
          {contextSubtitle}
        </span>
      </div>

      {/* Right: Track Queue icon button */}
      <button
        type="button"
        onClick={handleQueueClick}
        aria-label={queueCount > 0 ? `Track queue (${queueCount})` : "Track queue"}
        title="View Playback Queue"
        className="relative w-10 h-10 flex items-center justify-center rounded-[var(--tj-radius-md,10px)] text-[#C2C7CD] hover:text-[#FFFFFF] hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none -mr-1 border-none bg-transparent shadow-none"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <ListMusic className="w-5 h-5 stroke-[2]" />
        {queueCount > 0 && (
          <span className="absolute top-1.5 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--tj-color-brand-primary,#00B4D8)] text-[#FFFFFF] text-[9px] font-bold flex items-center justify-center leading-none">
            {queueCount > 99 ? "99+" : queueCount}
          </span>
        )}
      </button>
    </header>
  );
});

PlayerHeader.displayName = "PlayerHeader";

export default PlayerHeader;
