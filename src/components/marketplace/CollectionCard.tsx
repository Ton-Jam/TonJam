import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BadgeCheck } from "lucide-react";
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
  const navigate = useNavigate();
  const isPositiveChange = collection.change ? collection.change.startsWith("+") : true;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/collections/${collection.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "cursor-pointer group flex items-center gap-3.5 p-3 bg-[#0B112C] hover:bg-[#0E1638] rounded-[10px] shadow-lg shadow-black/30 transition-all duration-300 border-none",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-black/40 xl:w-20 xl:h-20 shrink-0">
        <img
          src={collection.imageUrl}
          alt={collection.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] text-[8px] text-white/90 uppercase tracking-widest font-black">
          {collection.itemCount || 10} Items
        </div>
      </div>

      {/* Info details */}
      <div className="min-w-0 flex-grow flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <h4 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
              {collection.name}
            </h4>
            {collection.verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-current shrink-0" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase truncate">
            {collection.creator}
          </p>
        </div>

        {/* Pricing data */}
        <div className="flex items-center justify-between mt-2 pt-1.5">
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase tracking-widest text-slate-400 font-semibold">
              Floor Price
            </span>
            <span className="text-xs font-black text-cyan-400 font-mono">
              {collection.floorPrice} <span className="text-[8px] text-slate-400 font-sans">TON</span>
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[7.5px] uppercase tracking-widest text-slate-400 font-semibold">
              24h Volume
            </span>
            <span className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
              {collection.volume} <span className="text-[8px] font-medium text-slate-400 font-sans">TON</span>
              {collection.change && (
                <span
                  className={cn(
                    "text-[8px] font-bold",
                    isPositiveChange ? "text-emerald-400" : "text-rose-400"
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
