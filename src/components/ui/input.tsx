import * as React from "react"

import { cn } from "@/lib/utils"
import { colors, radius, typography } from "@/design"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.input,
    fontFamily: typography.fontFamily.primary,
    backgroundColor: colors.dark.surface,
    borderColor: colors.dark.border,
    color: colors.dark.textPrimary,
    ...style,
  }

  return (
    <input
      type={type}
      data-slot="input"
      style={tokenStyle}
      className={cn(
        "flex h-11 w-full border px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Input }

