import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  initialFavourited?: boolean;
  onToggle?: (favourited: boolean) => void;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}

export const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  initialFavourited = false,
  onToggle,
  count,
  className,
  size = "md",
}) => {
  const [favourited, setFavourited] = useState(initialFavourited);

  useEffect(() => {
    setFavourited(initialFavourited);
  }, [initialFavourited]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !favourited;
    setFavourited(next);
    if (onToggle) onToggle(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={favourited}
      className={cn(
        "rounded-[var(--tj-radius-xs,4px)] flex items-center justify-center transition-colors cursor-pointer outline-none border border-[var(--tj-color-border-subtle)]",
        "bg-[var(--tj-color-surface-overlay,#07182BCC)] backdrop-blur-md",
        size === "sm" ? "w-7 h-7" : "w-8 h-8",
        favourited
          ? "text-[#FF4A6B] border-[#FF4A6B]/50 hover:text-[#FF6685]"
          : "text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white",
        className
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          favourited ? "fill-current" : ""
        )}
        strokeWidth={2}
      />
      {typeof count === "number" && (
        <span className="text-[10px] ml-1 font-semibold">{count}</span>
      )}
    </button>
  );
};

export default FavouriteButton;
