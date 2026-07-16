import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { colors, radius, typography } from "@/design"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-[#050A24] hover:opacity-90",
        secondary: "border-transparent bg-elevated text-white hover:bg-elevated/80",
        outline: "text-white border-border-subtle hover:bg-surface",
        verified: "border-transparent bg-verified text-white hover:opacity-90",
        nft: "border-transparent bg-nft text-white hover:opacity-90",
        reward: "border-transparent bg-reward text-[#050A24] hover:opacity-90",
        destructive: "border-transparent bg-error text-white hover:opacity-90",
        error: "border-transparent bg-error text-white hover:opacity-90",
        success: "border-transparent bg-success text-white hover:opacity-90",
        primary: "border-transparent bg-primary text-[#050A24] hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
 }: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  const tokenStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    ...style,
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      style={tokenStyle}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

