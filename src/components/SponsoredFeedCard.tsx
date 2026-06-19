import React from "react";
import { motion } from "motion/react";

interface SponsoredFeedCardProps {
  title: string;
  description: string;
  artwork: string;
  badge: string;
  ctaText: string;
  onClick: () => void;
}

const SponsoredFeedCard: React.FC<SponsoredFeedCardProps> = ({
  title,
  description,
  artwork,
  badge,
  ctaText,
  onClick,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-end p-5 text-left rounded-2xl overflow-hidden bg-[#0A113A]/50">
      <img
        src={artwork}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] via-[#050A24]/70 to-transparent" />
      
      <div className="relative z-10 space-y-1">
        <div className="inline-block px-2 py-0.5 rounded bg-[#5B6BFF] text-[8px] font-black uppercase tracking-widest text-white leading-none">
          {badge}
        </div>
        <h3 className="text-base font-extrabold text-white mt-1.5 leading-tight tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-[#9AA0AE] leading-normal max-w-[280px]">
          {description}
        </p>
        
        <div className="pt-2">
          <button
            onClick={onClick}
            className="h-7 bg-[#00B4D8] hover:bg-[#009bba] text-[#050A24] font-black text-[9px] uppercase tracking-widest px-3.5 rounded-full cursor-pointer leading-none border-none"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsoredFeedCard;
