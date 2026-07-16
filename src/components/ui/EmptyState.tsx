import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors, radius, spacing, typography } from "@/design";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ className, title = "No items found", description, icon, style, ...props }: EmptyStateProps) {
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.card,
    borderColor: colors.dark.border,
    fontFamily: typography.fontFamily.primary,
    padding: spacing[32],
    ...style,
  };

  return (
    <div
      style={tokenStyle}
      className={cn(
        "flex flex-col items-center justify-center text-center border bg-surface/30",
        className
      )}
      {...props}
    >
      <div className="mb-3 text-text-muted shrink-0">
        {icon || <FolderOpen className="size-8 opacity-40" />}
      </div>
      <h3
        style={{
          fontSize: typography.fontSize.caption,
          fontFamily: typography.fontFamily.primary,
        }}
        className="font-black uppercase tracking-wider text-text-primary mb-1"
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: typography.fontSize.label,
            color: colors.dark.textMuted,
          }}
          className="font-medium max-w-xs leading-normal"
        >
          {description}
        </p>
      )}
    </div>
  );
}

