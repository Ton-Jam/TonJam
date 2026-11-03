import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { colors, radius, typography, spacing } from "@/design"

// Consume design system tokens explicitly for custom style attributes if needed
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tj-color-border-focus,#00B4D8)] disabled:pointer-events-none disabled:bg-[var(--tj-color-brand-disabled,#24536B)] disabled:text-[var(--tj-color-text-disabled,#64748B)] active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] active:bg-[var(--tj-color-brand-pressed,#009CC0)] text-black",
        secondary: "bg-[var(--tj-color-surface-elevated,#111F36)] hover:bg-[var(--tj-color-surface-hover,#132B49)] active:bg-[var(--tj-color-surface-pressed,#193657)] text-white",
        ghost: "bg-transparent hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white",
        outline: "bg-transparent hover:bg-[var(--tj-color-surface-hover,#132B49)] text-white",
        destructive: "hover:opacity-90",
        success: "hover:opacity-90",
        default: "bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] active:bg-[var(--tj-color-brand-pressed,#009CC0)] text-black",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
        "icon-sm": "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  // Explicitly map component style properties to design system tokens
  const getVariantStyles = (v: string): React.CSSProperties => {
    switch (v) {
      case "primary":
      case "default":
        return {
          backgroundColor: 'var(--tj-color-brand-primary, #00B4D8)',
          color: colors.dark.background,
        };
      case "secondary":
        return {
          backgroundColor: colors.dark.elevated,
          color: colors.dark.textPrimary,
        };
      case "ghost":
        return {
          backgroundColor: colors.dark.transparent,
          color: colors.dark.textPrimary,
        };
      case "outline":
        return {
          backgroundColor: colors.dark.transparent,
          color: colors.dark.textPrimary,
        };
      case "destructive":
        return {
          backgroundColor: colors.dark.error,
          color: colors.dark.textPrimary,
        };
      case "success":
        return {
          backgroundColor: colors.dark.success,
          color: colors.dark.textPrimary,
        };
      case "link":
        return {
          backgroundColor: colors.dark.transparent,
          color: colors.dark.primary,
        };
      default:
        return {};
    }
  };

  // Dynamically apply button radius, typography, colors, and margins from design tokens
  const tokenStyle: React.CSSProperties = {
    borderRadius: radius.button,
    fontFamily: typography.fontFamily.primary,
    fontSize: size === "sm" ? typography.fontSize.caption : typography.fontSize.button,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
    ...getVariantStyles(variant),
    ...style,
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      style={tokenStyle}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function IconButton({
  className,
  variant = "secondary",
  size = "icon",
  style,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      size={size}
      style={{ borderRadius: radius.full, ...style }}
      className={cn(className)}
      {...props}
    />
  )
}

export { Button, IconButton, buttonVariants }

