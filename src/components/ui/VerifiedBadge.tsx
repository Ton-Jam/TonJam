import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { colors } from "@/design";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps extends React.ComponentProps<"svg"> {
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ className, size = "md", ...props }: VerifiedBadgeProps) {
  const sizeMap = {
    sm: "size-3.5",
    md: "size-4.5",
    lg: "size-6",
  };

  return (
    <ShieldCheck
      className={cn("text-verified shrink-0", sizeMap[size], className)}
      style={{ color: colors.dark.verified }}
      {...props}
    />
  );
}
