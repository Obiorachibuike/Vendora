"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/ui";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }
>(({ className, side = "right", ...props }, ref) => {
  const positionClasses = {
    top: "top-0 left-0 h-auto w-full rounded-b-xl sm:rounded-b-none",
    bottom: "bottom-0 left-0 h-auto w-full rounded-t-xl sm:rounded-t-none",
    left: "left-0 top-0 h-full w-full sm:max-w-[440px]",
    right: "right-0 top-0 h-full w-full sm:max-w-[440px]",
  };
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 grid gap-4 border bg-card p-6 text-text shadow-lg rounded-xl",
          positionClasses[side],
          className,
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-text", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
