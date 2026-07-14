import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

export function Chip({ className, active, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap select-none border border-border-subtle",
        active
          ? "bg-primary text-background border-primary hover:opacity-90"
          : "bg-surface text-text-secondary hover:bg-hover hover:text-text-primary",
        className
      )}
      {...props}
    />
  );
}
