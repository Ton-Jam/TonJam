"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  const cleanedClassName = className
    ? className
        .replace(/bg-white\/[0-9%gp\[\]\.]+/g, "")
        .replace(/bg-border\/[0-9%gp\[\]\.]+/g, "")
        .replace("bg-white/5", "")
        .replace("bg-white/[0.05]", "")
        .replace("bg-border", "")
    : ""

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-[#E2E8F0]/15 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        cleanedClassName
      )}
      {...props}
    />
  )
}

export { Separator }
