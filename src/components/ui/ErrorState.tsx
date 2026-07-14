import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ className, title = "System Error", message = "Unable to calibrate connection.", onRetry, ...props }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-card bg-error/5 border border-error/20",
        className
      )}
      {...props}
    >
      <AlertCircle className="size-8 text-error mb-3 animate-pulse" />
      <h3 className="text-xs font-black uppercase tracking-wider text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-[10px] font-medium text-text-muted max-w-xs mb-4 leading-normal">
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
