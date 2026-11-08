import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? "vendora_session")?.value;
  if (token) {
    await destroySession(token).catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(process.env.SESSION_COOKIE_NAME ?? "vendora_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set(process.env.CSRF_COOKIE_NAME ?? "vendora_csrf", "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
