"use client";

import { Toaster, useSonner, type ToastT } from "sonner";

export { useSonner as useToast, type ToastT };

export function ToasterComponent() {
  return (
    <Toaster
      position="top-right"
      richColors
      className="[&_*]:text-text [&_.sonner-toast]:border-border [&_.sonner-toast]:bg-card"
      toastOptions={{
        style: {
          background: "var(--color-card)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        },
      }}
    />
  );
}

export { Toaster };
