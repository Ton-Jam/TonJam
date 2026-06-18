import React from "react";
import { motion } from "motion/react";
import { BadgeCheck, Play, ArrowUpRight, ArrowDownRight, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingCardProps {
  rank: number;
  name: string;
  creator?: string;
  imageUrl: string;
  metricLabel: string;
  metricValue: string;
  change?: string;
  type?: "artist" | "collection" | "track";
  onPlayTrack?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export const RankingCard: React.FC<RankingCardProps> = ({
  rank,
  name,
  creator,
  imageUrl,
  metricLabel,
  metricValue,
  change,
  type = "collection",
  onPlayTrack,
  onClick,
}) => {
  const isPositive = change ? change.startsWith("+") : true;

  const handleInteract = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
      onClick={handleInteract}
      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A113A]/40 hover:bg-[#0A113A] transition-all duration-300 cursor-pointer border border-white/[0.02]"
    >
      {/* Rank Index */}
      <span className="w-5 text-center text-xs font-black text-[#9AA0AE]">
        {rank}
      </span>

      {/* Avatar/Artwork Shield */}
      <div className="relative shrink-0 w-11 h-11 bg-black/40 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className={cn(
            "w-full h-full object-cover",
            type === "artist" ? "rounded-full scale-100" : "rounded-lg"
          )}
        />
        {type === "track" && onPlayTrack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayTrack(e);
            }}
            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[#5B6BFF]"
          >
            <Play className="w-4 h-4 fill-current text-white" />
          </button>
        )}
      </div>

      {/* Primary Row description */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-black uppercase text-white tracking-tight truncate">
            {name}
          </p>
          {type === "artist" && (
            <BadgeCheck className="w-3.5 h-3.5 text-[#5B6BFF] fill-current shrink-0" />
          )}
        </div>
        {creator && (
          <p className="text-[9px] text-[#9AA0AE] font-semibold tracking-wider uppercase truncate">
            {creator}
          </p>
        )}
      </div>

      {/* Metrics breakdown (floor/volume value, change rate) */}
      <div className="flex flex-col items-end shrink-0 text-right">
        <span className="text-[11px] font-black text-white tracking-tight">
          {metricValue}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] uppercase tracking-widest text-[#9AA0AE] font-semibold">
            {metricLabel}
          </span>
          {change && (
            <span
              className={cn(
                "text-[9px] font-black tracking-widest uppercase flex items-center",
                isPositive ? "text-[#2BE08C]" : "text-[#FF3A5C]"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-2.5 h-2.5 inline" />
              ) : (
                <ArrowDownRight className="w-2.5 h-2.5 inline" />
              )}
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
