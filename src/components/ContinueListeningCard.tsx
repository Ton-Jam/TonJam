import React from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";

interface ContinueListeningCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  onPlay: () => void;
}

const ContinueListeningCard: React.FC<ContinueListeningCardProps> = ({
  title,
  artist,
  coverUrl,
  onPlay,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      className="bg-transparent rounded-xl p-0 relative overflow-hidden flex items-center justify-between gap-3 select-none text-left cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 z-10">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 shadow-md">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 text-left">
          <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 block">
            CONTINUE
          </span>
          <h4 className="text-[13px] font-semibold text-white/95 truncate leading-tight mt-0.5">
            {title}
          </h4>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            {artist}
          </p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        aria-label="Play track"
        className="w-10 h-10 rounded-full bg-[#0179f4] hover:bg-[#0179f4]/90 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#0179f4]/30 shrink-0 cursor-pointer border-none z-10"
      >
        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
      </button>
    </motion.div>
  );
};

export default ContinueListeningCard;
