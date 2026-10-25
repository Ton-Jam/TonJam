import React from "react";
import { Disc3 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ProgressiveImage } from "@/components/common/ProgressiveImage";
import { VerifiedArtistLabel } from "./VerifiedArtistLabel";

export interface CollectionData {
  id: string;
  name: string;
  creator: string;
  creatorVerified?: boolean;
  verified?: boolean;
  itemCount: number;
  totalNFTs?: number;
  imageUrl: string;
  badge?: string;
  floorPrice?: string;
  volume?: string;
  change?: string;
}

interface CollectionCardProps {
  collection: CollectionData;
  onView?: (collection: CollectionData) => void;
  onClick?: () => void;
  className?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onView,
  onClick,
  className,
}) => {
  const badgeLabel = collection.badge || "COLLECTION";
  const totalNFTsCount = collection.totalNFTs ?? collection.itemCount;

  const handleClick = () => {
    if (onClick) onClick();
    else if (onView) onView(collection);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={cn(
        "w-[240px] sm:w-[260px] shrink-0 snap-start flex flex-col justify-between",
        "bg-[#101A32] hover:bg-[#152440] rounded-2xl p-3 shadow-lg shadow-black/25 cursor-pointer transition-colors duration-200 select-none",
        className
      )}
    >
      <div>
        {/* Artwork with subtle disc badge */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#070D20] group">
          <ProgressiveImage
            src={collection.imageUrl}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#070D20]/80 backdrop-blur-md text-[#65B8FF]">
            <Disc3 className="w-3 h-3 text-[#3390EC]" />
            <span>{badgeLabel}</span>
          </div>

          {/* Dynamic Total NFTs Chip */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#070D20]/85 backdrop-blur-md text-[#F5F8FF]">
            {totalNFTsCount} NFTs
          </div>
        </div>

        {/* Collection Name & Creator */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-bold text-[#F5F8FF] truncate leading-tight">
            {collection.name}
          </h3>
          <VerifiedArtistLabel
            artist={collection.creator}
            verified={collection.creatorVerified ?? true}
          />

          {/* Dynamic Total NFTs Metric */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-[#9BAAC5]">
            <span>Total NFTs</span>
            <span className="font-semibold text-[#65B8FF]">
              {totalNFTsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Floor Price or Explore */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-xs">
        {collection.floorPrice ? (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#9BAAC5]/80 block">
              Floor
            </span>
            <span className="text-xs font-bold text-[#65B8FF]">
              {collection.floorPrice}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-[#9BAAC5]">Curated Drop</span>
        )}

        <span className="text-xs font-semibold text-[#3390EC] hover:text-[#65B8FF] transition-colors">
          View Collection &rarr;
        </span>
      </div>
    </motion.div>
  );
};

export default CollectionCard;
