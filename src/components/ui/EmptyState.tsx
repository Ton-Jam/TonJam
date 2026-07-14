import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ className, title = "No items found", description, icon, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-card bg-surface/30 border border-border-subtle",
        className
      )}
      {...props}
    >
      <div className="mb-3 text-text-muted shrink-0">
        {icon || <FolderOpen className="size-8 opacity-40" />}
      </div>
      <h3 className="text-xs font-black uppercase tracking-wider text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] font-medium text-text-muted max-w-xs leading-normal">
          {description}
        </p>
      )}
    </div>
  );
}
