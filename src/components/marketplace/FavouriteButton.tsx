import React, { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !favourited;
    setFavourited(next);
    if (onToggle) onToggle(next);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      className={cn(
        "rounded-full flex items-center justify-center transition-colors cursor-pointer outline-none border-none",
        "bg-[#070D20]/75 backdrop-blur-md shadow-sm",
        size === "sm" ? "w-7 h-7" : "w-8 h-8",
        favourited
          ? "text-[#FF4A6B] hover:text-[#FF6685]"
          : "text-[#9BAAC5] hover:text-[#F5F8FF]",
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
    </motion.button>
  );
};

export default FavouriteButton;
