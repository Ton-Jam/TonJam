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
      <span className={cn("text-xs font-medium text-[#9BAAC5] truncate hover:text-[#F5F8FF] transition-colors", textClassName)}>
        {artist}
      </span>
      {verified && (
        <BadgeCheck
          className="w-3.5 h-3.5 text-[#3390EC] shrink-0"
          aria-label="Verified artist"
        />
      )}
    </div>
  );
};

export default VerifiedArtistLabel;
