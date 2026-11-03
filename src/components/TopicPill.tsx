import React from "react";
import { motion } from "motion/react";

interface TopicPillProps {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const TopicPill: React.FC<TopicPillProps> = ({ label, onClick, isActive = false }) => {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={isActive}
      className="shrink-0 outline-none p-0 cursor-pointer border-none bg-transparent min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
    >
      <div className={`px-4 py-2 rounded-[var(--tj-radius-pill)] text-xs font-bold transition-all ${
        isActive
          ? "bg-[var(--tj-color-brand-primary)] text-white shadow-[0_4px_16px_rgba(34,158,217,0.35)]"
          : "bg-[var(--tj-color-chip-background)] hover:bg-[var(--tj-color-surface-hover)] text-[var(--tj-color-text-secondary)] hover:text-white"
      }`}>
        {label}
      </div>
    </motion.button>
  );
};

export default TopicPill;
