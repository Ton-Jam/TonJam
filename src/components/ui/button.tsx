import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-background hover:bg-primary-hover",
        secondary: "bg-elevated text-text-primary border border-border-subtle hover:bg-hover",
        ghost: "bg-transparent text-text-primary hover:bg-hover",
        outline: "bg-transparent text-text-primary border border-border-subtle hover:border-primary/50 hover:text-primary",
        destructive: "bg-error text-white hover:opacity-90",
        success: "bg-success text-white hover:opacity-90",
        default: "bg-primary text-background hover:bg-primary-hover",
        link: "text-primary underline-offset-4 hover:underline",
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
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function IconButton({
  className,
  variant = "secondary",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      {...props}
    />
  )
}

export { Button, IconButton, buttonVariants }
