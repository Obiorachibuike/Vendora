"use client";

import * as React from "react";
import { cn } from "@/ui";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse skeleton", className)}
      {...props}
    />
  );
}
