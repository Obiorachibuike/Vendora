"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app error boundary", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-text">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-text">
        We&apos;re currently having an issue on our end. Please try again in a
        moment — if the problem persists, sign out and sign back in, or come
        back later.
      </p>
      {error?.digest && (
        <p className="text-xs text-muted-text">Error reference: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-brand text-brand-contrast">
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Go to homepage</Button>
        </Link>
      </div>
    </div>
  );
}
