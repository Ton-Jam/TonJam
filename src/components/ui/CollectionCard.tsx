import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { colors, typography } from "@/design";

interface CollectionCardProps {
  id?: string;
  name?: string;
  creator?: string;
  floorPrice?: string;
  itemCount?: number;
  image?: string;
  isVerified?: boolean;
  onClick?: () => void;
}

export function CollectionCard({
  id = "genesis-pass",
  name = "Genesis Jam Passes",
  creator = "TonJam Official",
  floorPrice = "150 TON",
  itemCount = 250,
  image = "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=400",
  isVerified = true,
  onClick,
}: CollectionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/collections/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-lg shadow-black/30 border-none"
      style={{
        backgroundColor: colors.dark.surface,
        borderRadius: "10px",
        fontFamily: typography.fontFamily.primary,
      }}
    >
      <div className="aspect-square w-full overflow-hidden relative rounded-t-[10px]">
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-[4px] text-[8px] font-mono font-black uppercase tracking-widest text-white">
          {itemCount} Assets
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">
              {name}
            </h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-[10px] font-medium text-slate-400 truncate">
            by {creator}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
              Floor Price
            </span>
            <span className="text-xs font-black font-mono text-cyan-400">
              {floorPrice}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
