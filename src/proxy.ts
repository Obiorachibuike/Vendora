import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "./lib/auth";
import { cookies } from "next/headers";

/** Exact paths that never require a session. */
const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/health",
  "/favicon.ico",
]);

/** Path prefixes that never require a session. */
const PUBLIC_PREFIXES = ["/api/auth/", "/api/webhooks/", "/api/public/", "/_next/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/** After login, users with incomplete onboarding must finish it first. */
const ONBOARDING_PATH = "/onboarding";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  onboardingComplete: boolean;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static / API health / public routes
  if (isPublicPath(pathname)) return NextResponse.next();

  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.SESSION_COOKIE_NAME ?? "vendora_session",
  )?.value;

  let session;
  if (token) {
    try {
      session = await getSession(token);
    } catch (err) {
      // Session validation hit a server-side failure (e.g. DB unreachable).
      // Treat as unauthenticated and send the user to login instead of
      // rendering a bare "Internal Server Error" page.
      console.error("proxy getSession error", err);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // No valid session → login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = session.user;

  // Incomplete onboarding → onboarding page (except logout)
  if (
    !user.onboardingComplete &&
    pathname !== ONBOARDING_PATH &&
    pathname !== "/api/auth/logout"
  ) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$|.*\\.ico$).*)",
  ],
};
