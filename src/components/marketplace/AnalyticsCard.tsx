import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  const isPositiveChange = change?.startsWith("+");

  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex-shrink-0 w-48 p-4 rounded-2xl bg-[#0A113A] border border-white/[0.04] transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-wider text-[#9AA0AE] uppercase">
          {title}
        </span>
        <div className="text-[#5B6BFF] opacity-80">{icon}</div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-[10px] font-black tracking-wide uppercase",
              isPositiveChange ? "text-[#2BE08C]" : "text-[#9AA0AE]"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
};
