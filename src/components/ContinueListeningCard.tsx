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
      whileTap={{ scale: 0.99 }}
      className="bg-[#0A113A]/60 backdrop-blur-xl rounded-2xl p-4 relative overflow-hidden flex items-center justify-between gap-3 shadow-xl border-none text-left"
    >
      {/* Holographic background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5B6BFF]/10 to-[#00B4D8]/10 pointer-events-none" />
      
      <div className="flex items-center gap-3.5 min-w-0 z-10">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="min-w-0 text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00B4D8] block">
            CONTINUE LISTENING
          </span>
          <h4 className="text-sm font-extrabold text-white truncate mt-0.5 leading-none">
            {title}
          </h4>
          <p className="text-xs text-[#9AA0AE] truncate mt-1">
            {artist}
          </p>
        </div>
      </div>

      <button
        onClick={onPlay}
        className="w-11 h-11 rounded-full bg-[#5B6BFF] hover:bg-[#4856ea] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer border-none z-10"
      >
        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
      </button>
    </motion.div>
  );
};

export default ContinueListeningCard;
