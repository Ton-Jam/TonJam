import { cn } from "@/lib/utils"
import React from "react"

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="skeleton"
        className={cn("relative overflow-hidden rounded-md bg-muted", className)}
        {...props}
      >
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
