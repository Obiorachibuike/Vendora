import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password, country } = parsed.data;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        passwordHash,
        name,
        country,
        role: "STORE_OWNER",
        onboardingComplete: false,
      })
      .returning();

    const token = await createSession(
      user.id,
      undefined,
      req.headers.get("user-agent") ?? undefined,
    );

    const cookieStore = await cookies();
    cookieStore.set(process.env.SESSION_COOKIE_NAME ?? "vendora_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.set(process.env.CSRF_COOKIE_NAME ?? "vendora_csrf", crypto.randomUUID(), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
