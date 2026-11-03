import * as React from "react"

import { cn } from "@/lib/utils"
import { colors, radius, typography } from "@/design"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.input,
    fontFamily: typography.fontFamily.primary,
    backgroundColor: 'var(--tj-color-input-background, #0B1F36)',
    borderColor: 'var(--tj-color-border-interactive, #245078)',
    color: colors.dark.textPrimary,
    ...style,
  }

  return (
    <input
      type={type}
      data-slot="input"
      style={tokenStyle}
      className={cn(
        "flex h-11 w-full border px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--tj-color-input-placeholder,#8193A8)] focus-visible:outline-none focus-visible:border-[var(--tj-color-border-focus,#00B4D8)] focus-visible:ring-1 focus-visible:ring-[var(--tj-color-border-focus,#00B4D8)] disabled:cursor-not-allowed disabled:text-[var(--tj-color-text-disabled,#64748B)] disabled:opacity-50 transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Input }

