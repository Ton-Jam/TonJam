import React from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedArtistLabelProps {
  artist: string;
  verified?: boolean;
  className?: string;
  textClassName?: string;
}

export const VerifiedArtistLabel: React.FC<VerifiedArtistLabelProps> = ({
  artist,
  verified = true,
  className,
  textClassName,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-1 min-w-0", className)}>
      <span
        className={cn(
          "text-xs font-medium text-[var(--tj-color-text-secondary,#C2C7CD)] truncate hover:text-[var(--tj-color-text-primary,#FFFFFF)] transition-colors",
          textClassName
        )}
      >
        {artist}
      </span>
      {verified && (
        <BadgeCheck
          className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)] shrink-0"
          aria-label="Verified artist"
        />
      )}
    </div>
  );
};

export default VerifiedArtistLabel;
