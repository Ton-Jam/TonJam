import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-center -space-x-px rounded-md shadow-sm",
          "&>*:first-child:rounded-r-none &>*:last-child:rounded-l-none &>*:not(:first-child):not(:last-child):rounded-none",
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
