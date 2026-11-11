import type { ZodError } from "zod";

/**
 * Human-readable summary of a zod error, e.g. "email: Invalid email. password: Too short".
 * Use for 400 responses so clients always receive `error` as a plain string.
 */
export function zodErrorMessage(error: ZodError): string {
  const flat = error.flatten();
  const parts: string[] = [];
  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (!messages) continue;
    for (const message of messages as string[]) {
      parts.push(`${field}: ${message}`);
    }
  }
  parts.push(...flat.formErrors);
  return parts.length > 0 ? parts.join(". ") : "Invalid input";
}

/**
 * Map a thrown error to a safe, user-facing message. Callers should still
 * console.error the raw error server-side. Unexpected internals (SQL, hostnames,
 * driver noise) are never leaked to the client; known failure modes get an
 * honest, actionable reason.
 */
export function userMessage(err: unknown, fallback: string): string {
  const e = (err ?? {}) as { code?: string; message?: string };
  const code = String(e.code ?? "");
  const msg = String(e.message ?? "");

  const dbUnavailable =
    ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EHOSTUNREACH", "57P01", "57P03"].includes(code) ||
    /connection terminated|connection refused|connect etimedout|timeout exceeded|timeout expired|password authentication failed|no pg_hba|ssl|certificate/i.test(
      msg,
    );
  if (dbUnavailable) {
    return "We couldn't reach the database. Please try again in a moment.";
  }
  if (code === "23505") return "That record already exists.";
  if (code === "23503") return "A referenced record was not found. Refresh and try again.";
  if (code === "23502") return "A required field was missing.";
  if (code === "42P01" || code === "42703") {
    return "The database schema is out of date. Please run the migrations.";
  }
  return fallback;
}
