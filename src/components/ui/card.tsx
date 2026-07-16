import * as React from "react"
import { cn } from "@/lib/utils"
import { colors, radius, typography, spacing, cardTokens } from "@/design"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      borderRadius: cardTokens?.global?.borderRadius || radius.card,
      backgroundColor: colors.dark.surface,
      borderColor: colors.dark.border,
      fontFamily: typography.fontFamily.primary,
      borderWidth: '1px',
      borderStyle: 'solid',
      ...style
    }}
    className={cn(
      "overflow-hidden transition-all",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: cardTokens?.global?.padding || spacing[24],
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6],
      ...style
    }}
    className={cn(className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    style={{
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.cardTitle,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.none,
      letterSpacing: typography.letterSpacing.tight,
      color: colors.dark.textPrimary,
      ...style
    }}
    className={cn(
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    style={{
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.regular,
      color: colors.dark.textMuted,
      lineHeight: typography.lineHeight.normal,
      ...style
    }}
    className={cn(className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: cardTokens?.global?.padding || spacing[24],
      paddingTop: 0,
      fontFamily: typography.fontFamily.primary,
      ...style
    }}
    className={cn(className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: cardTokens?.global?.padding || spacing[24],
      paddingTop: 0,
      fontFamily: typography.fontFamily.primary,
      ...style
    }}
    className={cn("flex items-center", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

