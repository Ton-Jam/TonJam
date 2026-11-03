import React from "react";
import { motion } from "motion/react";
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
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none cursor-pointer outline-none border-none",
        active
          ? "bg-[var(--tj-color-chip-active-background,#063C55)] text-[#F5F8FF] shadow-sm shadow-[#063C55]/30"
          : "bg-[var(--tj-color-chip-background,#102943)] text-[#9BAAC5] hover:text-[#F5F8FF] hover:bg-[var(--tj-color-surface-hover,#132B49)]",
        className
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold",
            active ? "bg-white/20 text-white" : "bg-white/5 text-[#9BAAC5]"
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
};

export default FilterPill;
