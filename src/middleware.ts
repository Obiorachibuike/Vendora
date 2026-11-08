import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "./lib/auth";
import { cookies } from "next/headers";

/** Paths that never require a session. */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/",
  "/api/webhooks/",
  "/api/public/",
  "/api/health",
  "/_next/",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static / API health / public routes
  if (isPublicPath(pathname)) return NextResponse.next();

  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.SESSION_COOKIE_NAME ?? "vendora_session",
  )?.value;

  let session;
  if (token) {
    session = await getSession(token);
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
