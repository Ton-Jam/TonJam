import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { colors, radius, spacing, typography } from "@/design";

interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ className, title = "System Error", message = "Unable to calibrate connection.", onRetry, style, ...props }: ErrorStateProps) {
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.card,
    borderColor: colors.dark.error + "33", // hex overlay for alpha (20%)
    fontFamily: typography.fontFamily.primary,
    padding: spacing[32],
    ...style,
  };

  return (
    <div
      style={tokenStyle}
      className={cn(
        "flex flex-col items-center justify-center text-center bg-error/5 border",
        className
      )}
      {...props}
    >
      <AlertCircle className="size-8 text-error mb-3 animate-pulse" />
      <h3
        style={{
          fontSize: typography.fontSize.caption,
          fontFamily: typography.fontFamily.primary,
        }}
        className="font-black uppercase tracking-wider text-text-primary mb-1"
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: typography.fontSize.label,
          color: colors.dark.textMuted,
        }}
        className="font-medium max-w-xs mb-4 leading-normal"
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-error/20 hover:border-error text-error font-black tracking-widest text-[9px] uppercase">
          Retry System Connection
        </Button>
      )}
    </div>
  );
}

