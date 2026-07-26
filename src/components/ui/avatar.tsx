"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { colors, radius, typography } from "@/design"

function Avatar({
  className,
  size = "default",
  style,
  onClick,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
  onClick?: React.MouseEventHandler<HTMLElement>;
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      style={{
        borderRadius: radius.avatar,
        backgroundColor: colors.dark.surface,
        borderColor: colors.dark.border,
        ...style
      }}
      className={cn(
        "group/avatar relative flex size-10 shrink-0 select-none border data-[size=lg]:size-12 data-[size=sm]:size-8",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      style={{
        borderRadius: radius.avatar,
        ...style
      }}
      className={cn(
        "aspect-square size-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      style={{
        borderRadius: radius.avatar,
        backgroundColor: colors.dark.elevated,
        color: colors.dark.textMuted,
        fontFamily: typography.fontFamily.primary,
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        ...style
      }}
      className={cn(
        "flex size-full items-center justify-center text-sm font-bold group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, style, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      style={{
        backgroundColor: colors.dark.primary,
        color: colors.dark.background,
        borderColor: colors.dark.background,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: radius.full,
        ...style
      }}
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      style={{
        borderRadius: radius.full,
        backgroundColor: colors.dark.elevated,
        color: colors.dark.textSecondary,
        borderColor: colors.dark.background,
        borderWidth: '2px',
        borderStyle: 'solid',
        fontFamily: typography.fontFamily.primary,
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.medium,
        ...style
      }}
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

