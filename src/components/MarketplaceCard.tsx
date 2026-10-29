import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { cardTokens } from "@/design";

interface MarketplaceCardProps {
  title: string;
  artist: string;
  price: string;
  badge: string;
  image: string;
  onBid: () => void;
  onQuickBuy?: () => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  title,
  artist,
  price,
  badge,
  image,
  onBid,
  onQuickBuy,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: cardTokens.animation.hoverScale }}
      whileTap={{ scale: cardTokens.animation.tapScale }}
      style={{ width: cardTokens.marketplace.width, borderRadius: cardTokens.global.borderRadius }}
      className="shrink-0 bg-transparent p-0 flex flex-col justify-between space-y-2.5 text-left border-none transition-all duration-300"
    >
      <div className="relative w-full aspect-square rounded-[6px] overflow-hidden bg-neutral-900 shadow-md">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 text-[7.5px] font-black tracking-widest uppercase bg-[#00B4D8] text-[#050A24] px-1.5 py-0.5 rounded">
          {badge}
        </span>
      </div>

      <div className="space-y-0.5">
        <h4 className="text-[11px] font-black text-white tracking-tight leading-tight truncate uppercase">{title}</h4>
        <p className="text-[9px] text-[#9AA0AE] truncate uppercase font-semibold">Artist: {artist}</p>
      </div>

      <div className="flex items-center justify-between pt-1 mt-auto gap-1.5">
        <div className="text-left min-w-0">
          <span className="text-[7.5px] uppercase tracking-wider text-[#9AA0AE] block leading-none">Value</span>
          <p className="text-[10px] font-black text-[#2BE08C] leading-none tracking-tight mt-1 truncate">{price}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onQuickBuy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy();
              }}
              className="h-8 px-2.5 text-[8.5px] font-bold uppercase tracking-wider bg-[#229ED9] hover:bg-[#168AC4] text-white rounded-full cursor-pointer border-none flex items-center gap-1 active:scale-95 transition-transform"
              title="Quick Buy"
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>Quick Buy</span>
            </button>
          )}
          <button
            onClick={onBid}
            className="h-8 px-3 text-[8.5px] font-black uppercase tracking-widest bg-[#5B6BFF] hover:bg-[#4856ea] text-white rounded-full cursor-pointer border-none flex items-center justify-center active:scale-95 transition-transform"
          >
            Bid
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
