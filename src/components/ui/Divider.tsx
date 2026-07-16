import * as React from "react";
import { cn } from "@/lib/utils";
import { colors } from "@/design";

interface DividerProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ className, orientation = "horizontal", style, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-divider shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        className
      )}
      style={{
        backgroundColor: colors.dark.divider,
        ...style
      }}
      {...props}
    />
  );
}

