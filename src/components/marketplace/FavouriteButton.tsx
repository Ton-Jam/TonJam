import React, { useState, useEffect } from "react";
import { AnimatedHeart } from "@/components/common/AnimatedHeart";
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
        "rounded-[var(--tj-mkt-radius-compact,6px)] flex items-center justify-center transition-colors duration-150 cursor-pointer outline-none border-0 backdrop-blur-none",
        "bg-[#07182B]/85",
        size === "sm" ? "w-8 h-8" : "w-9 h-9",
        favourited
          ? "text-[var(--tj-color-state-danger,#F16D78)] hover:opacity-90"
          : "text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-[var(--tj-color-text-primary,#FFFFFF)]",
        className
      )}
    >
      <AnimatedHeart
        liked={favourited}
        className={cn(
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          favourited ? "fill-current" : ""
        )}
        strokeWidth={2}
      />
      {typeof count === "number" && (
        <span className="text-[10px] ml-1 font-semibold font-mono tabular-nums">{count}</span>
      )}
    </button>
  );
};

export default FavouriteButton;
