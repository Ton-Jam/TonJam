import * as React from "react";
import { ChevronRight } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { colors, radius, spacing, typography } from "@/design";

interface CollectionCardProps {
  name?: string;
  creator?: string;
  floorPrice?: string;
  itemCount?: number;
  image?: string;
  isVerified?: boolean;
  onClick?: () => void;
}

export function CollectionCard({
  name = "Genesis Jam Passes",
  creator = "TonJam Official",
  floorPrice = "150 TON",
  itemCount = 250,
  image = "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=400",
  isVerified = true,
  onClick,
}: CollectionCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      style={{
        backgroundColor: colors.dark.surface,
        borderColor: colors.dark.border,
        borderRadius: radius.card,
        fontFamily: typography.fontFamily.primary,
      }}
    >
      <div className="aspect-square w-full overflow-hidden relative">
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 right-2.5 bg-background/90 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-text-primary">
          {itemCount} Assets
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary truncate">
              {name}
            </h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-[10px] font-medium text-text-muted">
            by {creator}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-divider mt-3 pt-3">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted block">
              Floor Price
            </span>
            <span className="text-xs font-black text-primary" style={{ color: colors.dark.primary }}>
              {floorPrice}
            </span>
          </div>
          <ChevronRight className="size-4 text-text-muted group-hover:text-text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
