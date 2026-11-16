import React from "react";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  active,
  onClick,
  count,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 select-none cursor-pointer outline-none border shadow-none shrink-0",
        active
          ? "bg-[var(--tj-color-brand-primary,#00B4D8)] border-[var(--tj-color-brand-primary,#00B4D8)] text-white"
          : "bg-[var(--tj-color-chip-background,#102943)] border-[var(--tj-color-border-subtle)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white hover:bg-[var(--tj-color-surface-hover,#132B49)]",
        className
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
            active ? "bg-black/25 text-white" : "bg-white/10 text-[var(--tj-color-text-secondary,#C2C7CD)]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default FilterPill;
