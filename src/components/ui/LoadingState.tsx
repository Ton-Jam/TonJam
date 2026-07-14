import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.ComponentProps<"div"> {
  message?: string;
}

export function LoadingState({ className, message = "Loading sound waves...", ...props }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
      {...props}
    >
      <Loader2 className="size-6 text-primary animate-spin mb-3" />
      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
        {message}
      </span>
    </div>
  );
}
