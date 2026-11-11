/**
 * Read an error response body into a readable string.
 * Handles `error` as a string or as a zod fieldErrors object, so callers
 * always get something toast-friendly.
 */
export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    const err = json?.error ?? json?.message;
    if (typeof err === "string" && err.trim()) return err;
    if (err && typeof err === "object") {
      const parts = Object.entries(err as Record<string, unknown>).flatMap(([field, value]) =>
        Array.isArray(value)
          ? value.map((m) => `${field}: ${m}`)
          : [`${field}: ${String(value)}`],
      );
      if (parts.length > 0) return parts.join(". ");
    }
    return fallback;
  } catch {
    return res.statusText ? `${fallback} (${res.status} ${res.statusText})` : fallback;
  }
}

export const networkError = "Network error — please check your connection and try again.";
