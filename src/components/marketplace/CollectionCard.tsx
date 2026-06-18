import React from "react";
import { motion } from "motion/react";
import { BadgeCheck, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    creator: string;
    floorPrice: string;
    volume: string;
    imageUrl: string;
    itemCount?: number;
    verified?: boolean;
    change?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onClick,
  className,
}) => {
  const isPositiveChange = collection.change ? collection.change.startsWith("+") : true;

  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer group flex items-center gap-4 p-3 bg-[#0A113A] rounded-2xl border border-white/[0.04] transition-all duration-300",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/40 xl:w-20 xl:h-20 shrink-0">
        <img
          src={collection.imageUrl}
          alt={collection.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white/90 uppercase tracking-widest font-black">
          {collection.itemCount || 10} Items
        </div>
      </div>

      {/* Info details */}
      <div className="min-w-0 flex-grow flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <h4 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-[#5B6BFF] transition-colors">
              {collection.name}
            </h4>
            <BadgeCheck className="w-3.5 h-3.5 text-[#5B6BFF] fill-current shrink-0" />
          </div>
          <p className="text-[10px] text-[#9AA0AE] font-semibold tracking-wider uppercase truncate">
            {collection.creator}
          </p>
        </div>

        {/* Pricing data */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.02]">
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase tracking-widest text-[#9AA0AE] font-semibold">
              Floor Price
            </span>
            <span className="text-xs font-black text-[#00B4D8]">
              {collection.floorPrice} <span className="text-[8px] text-[#9AA0AE]">TON</span>
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[7.5px] uppercase tracking-widest text-[#9AA0AE] font-semibold">
              24h Volume
            </span>
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              {collection.volume} <span className="text-[8px] font-medium text-[#9AA0AE]">TON</span>
              {collection.change && (
                <span
                  className={cn(
                    "text-[8px] font-bold",
                    isPositiveChange ? "text-[#2BE08C]" : "text-[#FF3A5C]"
                  )}
                >
                  {collection.change}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
