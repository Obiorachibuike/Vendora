"use client";

import * as React from "react";
import { toast } from "sonner";

const SHOWN_KEY = "vendora.db-health-toast.shown";

/**
 * Shows a one-time toast reporting whether the database is connected.
 *
 * Runs once per browser tab session (tracked in sessionStorage) on first
 * mount. The /api/health endpoint reports:
 *   ok             — database reachable, schema migrated
 *   db_unavailable — cannot connect to the database
 *   schema_missing — connected, but migrations have not been applied
 *   schema_unknown — connected, but the schema probe failed
 */
export function DbHealthToast() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(SHOWN_KEY)) return;
      // Set the flag up-front so React StrictMode's double-mount in dev
      // can't fire the toast twice.
      window.sessionStorage.setItem(SHOWN_KEY, "1");
    } catch {
      // sessionStorage unavailable (private mode etc.) — fall through and show once anyway.
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const res = await fetch("/api/health", {
          signal: controller.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const body = (await res.json().catch(() => null)) as
          | { status?: string }
          | null;

        if (res.ok && body?.status === "ok") {
          toast.success("Database connected", {
            description: "All systems are operational.",
          });
        } else if (body?.status === "schema_missing") {
          toast.error("Database schema is out of date", {
            description: "The database is reachable, but migrations have not been applied.",
          });
        } else if (body?.status === "schema_unknown") {
          toast.warning("Database schema unverified", {
            description: "Connected to the database, but the schema check failed.",
          });
        } else if (body?.status === "db_unavailable") {
          toast.error("Database disconnected", {
            description: "We couldn't reach the database. Some features may not work.",
          });
        } else {
          toast.error("Couldn't check database status", {
            description: `The health check returned an unexpected response${res.status ? ` (${res.status})` : ""}.`,
          });
        }
      } catch {
        toast.error("Couldn't check database status", {
          description: "The health check request failed or timed out.",
        });
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
