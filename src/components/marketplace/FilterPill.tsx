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
      aria-pressed={active}
      className={cn(
        "filter-pill filter-silver-border border-silver-2 inline-flex items-center justify-center min-h-[34px] px-3.5 py-1.5 rounded-[var(--tj-radius-pill,999px)] text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 select-none cursor-pointer outline-none border-2 shadow-none shrink-0",
        active
          ? "active bg-[var(--tj-color-brand-primary,#00B4D8)] border-[rgba(192,192,192,0.35)] text-[var(--tj-color-text-primary,#FFFFFF)]"
          : "bg-[var(--tj-color-chip-background,#102943)] border-[rgba(192,192,192,0.22)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-[var(--tj-color-text-primary,#FFFFFF)] hover:bg-[var(--tj-color-surface-hover,#132B49)] hover:border-[rgba(192,192,192,0.35)]",
        className
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-[var(--tj-radius-pill,999px)] font-mono font-semibold tabular-nums",
            active
              ? "bg-[var(--tj-color-chip-active-background,#063C55)] text-[var(--tj-color-text-primary,#FFFFFF)]"
              : "bg-[var(--tj-color-surface-elevated,#111F36)] text-[var(--tj-color-text-secondary,#C2C7CD)]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default FilterPill;
