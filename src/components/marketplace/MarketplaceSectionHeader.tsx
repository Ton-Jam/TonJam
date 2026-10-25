import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceSectionHeaderProps {
  title: string;
  supportingLabel?: string;
  actionText?: string;
  onAction?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const MarketplaceSectionHeader: React.FC<MarketplaceSectionHeaderProps> = ({
  title,
  supportingLabel,
  actionText = "See all",
  onAction,
  badge,
  className,
}) => {
  return (
    <div className={cn("flex items-end justify-between gap-3 mb-3.5 px-4 sm:px-0", className)}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F8FF] truncate">
            {title}
          </h2>
          {badge}
        </div>
        {supportingLabel && (
          <p className="text-xs text-[#9BAAC5] font-normal truncate">
            {supportingLabel}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#3390EC] hover:text-[#65B8FF] transition-colors shrink-0 cursor-pointer border-none bg-transparent p-0 pb-0.5 outline-none"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default MarketplaceSectionHeader;
