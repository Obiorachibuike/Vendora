import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, CSRF_COOKIE_NAME, SESSION_COOKIE_NAME } from "./auth";

/**
 * Authenticate an API request from the session cookie.
 * Returns { user, sessionId } or throws a 401 NextResponse.
 */
export async function authenticateRequest(
  request: Request,
): Promise<{
  user: NonNullable<
    Awaited<ReturnType<typeof getSession>>
  >["user"];
  sessionId: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const session = token ? await getSession(token) : null;
  if (!session) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/** Enforce CSRF double-submit for state-changing methods (Next 15 async cookies). */
export async function assertCsrf(request: Request): Promise<void> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
  }
}

/** Standard error response for API routes. */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

// Alias used by several API routes; same async behavior.
export const assertCsrfAsync = assertCsrf;
