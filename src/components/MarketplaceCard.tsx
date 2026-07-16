import React from "react";
import { motion } from "motion/react";
import { cardTokens } from "@/design";

interface MarketplaceCardProps {
  title: string;
  artist: string;
  price: string;
  badge: string;
  image: string;
  onBid: () => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  title,
  artist,
  price,
  badge,
  image,
  onBid,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: cardTokens.animation.hoverScale }}
      whileTap={{ scale: cardTokens.animation.tapScale }}
      style={{ width: cardTokens.marketplace.width, padding: cardTokens.global.padding, borderRadius: cardTokens.global.borderRadius }}
      className="shrink-0 bg-[#0A113A]/45 flex flex-col justify-between space-y-2.5 text-left shadow-md border-none hover:bg-[#0A113A]/75 hover:shadow-[0_0_20px_rgba(91,107,255,0.2)] transition-all duration-300"
    >
      <div className="relative w-full aspect-square rounded-[6px] overflow-hidden bg-[#050A24]">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 text-[7.5px] font-black tracking-widest uppercase bg-[#00B4D8] text-[#050A24] px-1.5 py-0.5 rounded">
          {badge}
        </span>
      </div>

      <div className="space-y-0.5">
        <h4 className="text-[11px] font-black text-white tracking-tight leading-tight truncate uppercase">{title}</h4>
        <p className="text-[9px] text-[#9AA0AE] truncate uppercase font-semibold">Artist: {artist}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] mt-auto">
        <div className="text-left">
          <span className="text-[7.5px] uppercase tracking-wider text-[#9AA0AE] block leading-none">Value</span>
          <p className="text-[10px] font-black text-[#2BE08C] leading-none tracking-tight mt-1">{price}</p>
        </div>
        <button
          onClick={onBid}
          style={{ height: cardTokens.marketplace.buyButtonHeight }}
          className="text-[8.5px] font-black uppercase tracking-widest px-3 bg-[#5B6BFF] hover:bg-[#4856ea] text-white rounded-full cursor-pointer border-none flex items-center justify-center"
        >
          Bid
        </button>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
