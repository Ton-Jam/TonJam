import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ className, orientation = "horizontal", ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-divider shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        className
      )}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
      {...props}
    />
  );
}
