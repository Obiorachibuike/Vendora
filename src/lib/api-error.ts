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

/* ------------------------------------------------------------------ */
/* ERROR CAUSE-CHAIN UNWRAPPING                                        */
/* ------------------------------------------------------------------ */

/**
 * drizzle-orm wraps every query failure in a `DrizzleQueryError` whose
 * `.cause` holds the underlying driver error (node-postgres) carrying the
 * real Postgres SQLSTATE / socket code. Inspecting only the top-level
 * error means EVERY database failure collapses to the opaque fallback, so
 * we walk the whole `cause` chain (depth-capped, cycle-safe) and classify
 * on everything we find.
 */
interface ChainEntry {
  code?: string;
  message?: string;
}

const MAX_CHAIN_NODES = 12;

function unwrapErrorChain(err: unknown): ChainEntry[] {
  const chain: ChainEntry[] = [];
  const seen = new Set<unknown>();
  // Breadth-first walk so we also see codes living on the inner errors of a
  // Node `AggregateError` (what undici/pg produce with autoSelectFamily).
  const queue: unknown[] = [err];

  for (let visited = 0; visited < MAX_CHAIN_NODES && queue.length > 0; visited++) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const e = current as {
      code?: unknown;
      message?: unknown;
      cause?: unknown;
      errors?: unknown;
    };
    const code =
      typeof e.code === "string" || typeof e.code === "number"
        ? String(e.code)
        : undefined;
    chain.push({
      code,
      message: typeof e.message === "string" ? e.message : undefined,
    });

    if (e.cause !== undefined) queue.push(e.cause);
    if (Array.isArray(e.errors)) queue.push(...e.errors.slice(0, 10));
  }

  return chain;
}

/** Socket/DNS/TLS and Postgres connection-class SQLSTATEs: retryable, not a client problem. */
const CONNECTION_CODES = new Set([
  // Node.js socket / DNS errors
  "ECONNREFUSED",
  "ECONNRESET",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
  "EPIPE",
  // SQLSTATE class 08 — connection exception
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  "08P01",
  // SQLSTATE 57P01/57P02/57P03 — shutdown / cannot connect right now
  "57P01",
  "57P02",
  "57P03",
  // too_many_connections — serverless pool exhaustion is retryable
  "53300",
]);

/** Wrong DATABASE_URL credentials / insufficient privilege — a deployment config problem. */
const DB_AUTH_CODES = new Set(["28P01", "28000", "42501"]);

/**
 * Map a thrown error to a safe, user-facing message. Callers should still
 * console.error the raw error server-side. Unexpected internals (SQL, hostnames,
 * driver noise) are never leaked to the client; known failure modes get an
 * honest, actionable reason.
 */
export function userMessage(err: unknown, fallback: string): string {
  const chain = unwrapErrorChain(err);
  const codes = chain.map((e) => e.code).filter((c): c is string => !!c);
  const message = chain
    .map((e) => e.message ?? "")
    .join(" | ");

  const hasCode = (set: Set<string> | string[]) => {
    const wanted = Array.isArray(set) ? new Set(set) : set;
    return codes.some((c) => wanted.has(c));
  };

  if (
    hasCode(CONNECTION_CODES) ||
    /connection terminated|connection refused|connection closed|connect etimedout|getaddrinfo|timeout exceeded|timeout expired|server closed the connection|terminating connection|too many connections|ssl|certificate/i.test(
      message,
    )
  ) {
    return "We couldn't reach the database. Please try again in a moment.";
  }
  if (hasCode(DB_AUTH_CODES)) {
    return "A server configuration problem prevented this action. Please contact support.";
  }
  if (hasCode(["23505"])) return "That record already exists.";
  if (hasCode(["23503"])) return "A referenced record was not found. Refresh and try again.";
  if (hasCode(["23502"])) return "A required field was missing.";
  if (hasCode(["42P01", "42703", "3F000"])) {
    return "The database schema is out of date. Please run the migrations.";
  }
  return fallback;
}
