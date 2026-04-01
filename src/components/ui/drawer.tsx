"use client";

import { cn } from "@/lib/utils";
import { DrawerPreview as DrawerPrimitive } from "@base-ui/react/drawer";
import * as React from "react";
import { createContext, use } from "react";

const DrawerContext =
  createContext<DrawerPrimitive.Root.Props["swipeDirection"]>("down");

function Drawer({
  swipeDirection = "down",
  ...props
}: DrawerPrimitive.Root.Props) {
  return (
    <DrawerContext value={swipeDirection}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext>
  );
}

function DrawerTrigger({
  asChild,
  children,
  ...props
}: DrawerPrimitive.Trigger.Props & { asChild?: boolean }) {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      render={asChild ? (children as React.ReactElement) : undefined}
      {...props}
    >
      {!asChild && children}
    </DrawerPrimitive.Trigger>
  );
}

function DrawerPortal({ className, ...props }: DrawerPrimitive.Portal.Props) {
  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      className={cn("z-[9999]", className)}
      {...props}
    />
  );
}

function DrawerClose({
  asChild,
  children,
  ...props
}: DrawerPrimitive.Close.Props & { asChild?: boolean }) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      render={asChild ? (children as React.ReactElement) : undefined}
      {...props}
    >
      {!asChild && children}
    </DrawerPrimitive.Close>
  );
}

function DrawerContent({ className, ...props }: DrawerPrimitive.Content.Props) {
  return (
    <DrawerPortal>
      <DrawerBackdrop />
      <DrawerViewport>
        <DrawerPopup>
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className={cn(
              "transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100",
              className,
            )}
            {...props}
          />
        </DrawerPopup>
      </DrawerViewport>
    </DrawerPortal>
  );
}

function DrawerPopup({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const dir = use(DrawerContext);
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-popup"
      className={cn(
        "group/popup relative",
        "outline-1 outline-foreground/1 bg-background text-foreground dark:outline-border overflow-y-auto overscroll-contain touch-auto data-swiping:select-none",
        "data-ending-style:duration-300",
        // Nested drawer overlay (::after pseudo-element)
        "after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:pointer-events-none after:content-[''] after:transition-[background-color] after:duration-450 after:ease-[cubic-bezier(0.32,0.72,0,1)]",
        // Nested drawer states
        "data-nested-drawer-swiping:duration-0 data-nested-drawer-open:overflow-hidden data-nested-drawer-open:after:bg-background/5",
        {
          // Shared horizontal (left & right)
          "supports-[-webkit-touch-callout:none]:h-full w-[22rem] max-w-[calc(100vw-3rem)] p-2 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-[10px]":
            dir === "left" || dir === "right",
          // Right-only (with stacking transform + transition for box-shadow)
          "rounded-l-2xl pr-6 supports-[-webkit-touch-callout:none]:mr-2 supports-[-webkit-touch-callout:none]:pr-2 shadow-[-2px_0_10px_rgb(0_0_0/0.1)] data-ending-style:shadow-[-2px_0_10px_rgb(0_0_0/0)] origin-right data-swiping:duration-0 [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)]":
            dir === "right",
          // Left-only (with stacking transform + transition for box-shadow)
          "rounded-r-2xl pl-6 supports-[-webkit-touch-callout:none]:ml-2 supports-[-webkit-touch-callout:none]:pl-2 shadow-[2px_0_10px_rgb(0_0_0/0.1)] data-ending-style:shadow-[2px_0_10px_rgb(0_0_0/0)] origin-left data-swiping:duration-0 [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)]":
            dir === "left",
          // Right enter/exit
          "data-ending-style:translate-x-full data-starting-style:translate-x-full":
            dir === "right",
          // Left enter/exit
          "data-ending-style:-translate-x-full data-starting-style:-translate-x-full":
            dir === "left",
          // Shared vertical (up & down)
          "w-full max-h-[80vh] px-2":
            dir === "up" || dir === "down",
          // Down-only (with stacking transform + transitions for height & box-shadow)
          "rounded-t-2xl pt-2 pb-6 h-auto shadow-[0_2px_10px_rgb(0_0_0/0.1)] data-ending-style:shadow-[0_2px_10px_rgb(0_0_0/0)] origin-bottom data-swiping:duration-0 [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)]":
            dir === "down",
          // Up-only (with stacking transform + transitions for height & box-shadow)
          "rounded-b-2xl pb-2 pt-6 h-auto shadow-[0_-2px_10px_rgb(0_0_0/0.1)] data-ending-style:shadow-[0_-2px_10px_rgb(0_0_0/0)] origin-top data-swiping:duration-0 [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)]":
            dir === "up",
          // Down enter/exit
          "data-ending-style:translate-y-full data-starting-style:translate-y-full":
            dir === "down",
          // Up enter/exit
          "data-ending-style:-translate-y-full data-starting-style:-translate-y-full":
            dir === "up",
        },
        className,
      )}
      {...props}
    >
      {dir === "down" && (
        <div className="w-12 h-1 mx-auto mb-2 rounded-full bg-muted transition-opacity duration-200 group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100" />
      )}
      {children}
    </DrawerPrimitive.Popup>
  );
}

function DrawerViewport({
  className,
  ...props
}: DrawerPrimitive.Viewport.Props) {
  const dir = use(DrawerContext);
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={cn(
        "fixed flex inset-0 z-[9999]",
        {
          "items-stretch":
            dir === "left" || dir === "right",
          "justify-end": dir === "right",
          "justify-start": dir === "left",
          "items-end justify-center": dir === "down",
          "items-start justify-center": dir === "up",
        },
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  asChild,
  children,
  className,
  ...props
}: DrawerPrimitive.Title.Props & { asChild?: boolean }) {
  const dir = use(DrawerContext);

  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      render={asChild ? (children as React.ReactElement) : undefined}
      className={cn(
        "text-foreground text-base font-medium",
        {
          "text-center": dir === "down" || dir === "up",
        },
        className,
      )}
      {...props}
    >
      {!asChild && children}
    </DrawerPrimitive.Title>
  );
}

function DrawerDescription({
  asChild,
  children,
  className,
  ...props
}: DrawerPrimitive.Description.Props & { asChild?: boolean }) {
  const dir = use(DrawerContext);

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      render={asChild ? (children as React.ReactElement) : undefined}
      className={cn(
        "mt-3 text-muted-foreground text-sm",
        {
          "text-center": dir === "down" || dir === "up",
        },
        className,
      )}
      {...props}
    >
      {!asChild && children}
    </DrawerPrimitive.Description>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={cn(
        "fixed inset-0 min-h-dvh bg-black/80 backdrop-blur-sm transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-[9998]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerContent,
  DrawerPopup,
  DrawerViewport,
  DrawerTitle,
  DrawerDescription,
  DrawerBackdrop,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerPrimitive,
};
