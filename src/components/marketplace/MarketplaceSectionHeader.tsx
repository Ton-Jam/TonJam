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
  actionText = "View All",
  onAction,
  badge,
  className,
}) => {
  return (
    <div className={cn("flex items-end justify-between gap-3 mb-2.5 px-3", className)}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--tj-color-text-primary,#FFFFFF)] truncate">
            {title}
          </h2>
          {badge}
        </div>
        {supportingLabel && (
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] font-normal truncate">
            {supportingLabel}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-[var(--tj-color-brand-hover,#21C2E8)] transition-colors shrink-0 cursor-pointer border-none bg-transparent px-1 py-1 outline-none whitespace-nowrap"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default MarketplaceSectionHeader;
