"use client";

import * as React from "react";
import { ToasterComponent as Toaster } from "@/components/ui/toaster";
import { DbHealthToast } from "@/components/db-health-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DbHealthToast />
      <Toaster />
    </>
  );
}
