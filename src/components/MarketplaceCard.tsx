import React from "react";
import { motion } from "motion/react";

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
      whileHover={{ y: -3 }}
      className="w-[165px] shrink-0 rounded-2xl bg-[#0A113A]/45 p-3.5 flex flex-col justify-between space-y-3 text-left shadow-md border-none"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#050A24]">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 text-[7.5px] font-black tracking-widest uppercase bg-[#00B4D8] text-[#050A24] px-2 py-0.5 rounded">
          {badge}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-black text-white tracking-tight leading-none truncate">{title}</h4>
        <p className="text-[10px] text-[#9AA0AE] mt-0.5 truncate">Artist: {artist}</p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/[0.03]">
        <div className="text-left">
          <span className="text-[7.5px] uppercase tracking-wider text-[#9AA0AE] block leading-none">Value</span>
          <p className="text-xs font-black text-[#2BE08C] leading-none tracking-tight mt-1">{price}</p>
        </div>
        <button
          onClick={onBid}
          className="h-6 text-[8.5px] font-black uppercase tracking-widest px-2.5 bg-[#5B6BFF] hover:bg-[#4856ea] text-white rounded-md cursor-pointer border-none"
        >
          Bid
        </button>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
