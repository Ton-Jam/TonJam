import React from "react";
import { motion } from "motion/react";
import { TON_LOGO } from "@/constants";

interface NFTCollectionCardProps {
  name: string;
  artist: string;
  coverUrl: string;
  floorPrice: string;
  mintedCount: number;
  totalLimit: number;
  onMint: () => void;
}

const NFTCollectionCard: React.FC<NFTCollectionCardProps> = ({
  name,
  artist,
  coverUrl,
  floorPrice,
  mintedCount,
  totalLimit,
  onMint,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="w-[155px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3 flex flex-col justify-between space-y-3 shadow-md border-none text-left"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#050A24]">
        <img src={coverUrl} alt={name} className="w-full h-full object-cover" />
        <div className="absolute bottom-1.5 right-1.5">
          <span className="text-[7px] font-black uppercase tracking-wider bg-black/70 text-white px-2 py-0.5 rounded-sm">
            {mintedCount}/{totalLimit}
          </span>
        </div>
      </div>

      <div className="text-left space-y-0.5">
        <h4 className="text-xs font-black text-white truncate leading-none">
          {name}
        </h4>
        <p className="text-[10px] text-[#9AA0AE] truncate mt-0.5">
          {artist}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.03]">
        <div className="text-align-left">
          <span className="text-[8px] uppercase tracking-wider text-[#9AA0AE] block leading-none">Floor</span>
          <p className="text-xs font-black text-[#00B4D8] font-mono leading-none flex items-center gap-0.5 mt-1">
            <img src={TON_LOGO} className="w-3 h-3 object-contain inline" alt="" />
            {floorPrice}
          </p>
        </div>
        <button
          onClick={onMint}
          className="h-6 text-[8px] font-black uppercase tracking-widest px-2.5 bg-[#5B6BFF] text-white hover:bg-[#4856ea] rounded-md cursor-pointer border-none"
        >
          Collect
        </button>
      </div>
    </motion.div>
  );
};

export default NFTCollectionCard;
