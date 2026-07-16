import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors, spacing, typography } from "@/design";

interface LoadingStateProps extends React.ComponentProps<"div"> {
  message?: string;
}

export function LoadingState({ className, message = "Loading sound waves...", style, ...props }: LoadingStateProps) {
  const tokenStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    padding: spacing[32],
    ...style,
  };

  return (
    <div
      style={tokenStyle}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className
      )}
      {...props}
    >
      <Loader2 className="size-6 text-primary animate-spin mb-3" />
      <span
        style={{
          fontSize: typography.fontSize.label,
          color: colors.dark.textMuted,
        }}
        className="font-black uppercase tracking-widest"
      >
        {message}
      </span>
    </div>
  );
}

