import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, radius, typography } from "@/design";

interface ChipProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

export function Chip({ className, active, style, ...props }: ChipProps) {
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.full,
    fontFamily: typography.fontFamily.primary,
    ...style,
  };

  return (
    <button
      style={tokenStyle}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-xs font-bold tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap select-none border-none",
        active
          ? "bg-[#00B4D8] text-white shadow-md shadow-[#00B4D8]/20 hover:bg-[#009CC0]"
          : "bg-[#0A1628] text-[#C2C7CD] hover:bg-[#0F1C32] hover:text-white",
        className
      )}
      {...props}
    />
  );
}

