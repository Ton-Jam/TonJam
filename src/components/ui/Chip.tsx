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
        "inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap select-none border",
        active
          ? "bg-primary text-[#050A24] border-[#c0c0c0]/40 hover:opacity-90"
          : "bg-surface text-text-secondary border-[#c0c0c0]/25 hover:bg-hover hover:text-text-primary",
        className
      )}
      {...props}
    />
  );
}

