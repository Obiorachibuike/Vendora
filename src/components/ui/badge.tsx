"use client";

import * as React from "react";
import { cn } from "@/ui";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "muted";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-border text-muted bg-secondary-bg",
      brand: "border-brand/30 bg-brand/10 text-brand",
      success: "border-green-500/30 bg-green-500/10 text-green-400",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      danger: "border-red-500/30 bg-red-500/10 text-red-400",
      muted: "border-border text-muted bg-secondary-bg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge };
