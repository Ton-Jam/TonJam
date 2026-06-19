import React from "react";
import { Users } from "lucide-react";
import { motion } from "motion/react";

interface LiveSpaceCardProps {
  title: string;
  host: string;
  listeners: string;
  onJoin: () => void;
}

const LiveSpaceCard: React.FC<LiveSpaceCardProps> = ({
  title,
  host,
  listeners,
  onJoin,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-2xl bg-[#0A113A]/60 backdrop-blur-md flex items-center justify-between gap-3 shadow-md border-none text-left"
    >
      <div className="space-y-1.5 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3A5C] animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#9AA0AE] leading-none">
            {host} Space
          </span>
        </div>
        <h4 className="text-xs font-black text-white leading-tight tracking-tight truncate max-w-[220px]">
          {title}
        </h4>
        <div className="flex items-center gap-1 text-[10px] text-[#9AA0AE]">
          <Users className="w-3.5 h-3.5 text-[#00B4D8]" /> Shared with <span className="font-extrabold text-white">{listeners} listening</span>
        </div>
      </div>

      <button
        onClick={onJoin}
        className="h-8 bg-[#FF3A5C] hover:bg-[#e02d4d] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none"
      >
        Join
      </button>
    </motion.div>
  );
};

export default LiveSpaceCard;
