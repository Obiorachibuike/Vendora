import { jwtVerify, JWTPayload, SignJWT } from "jose";
import { compare, hash } from "bcryptjs";
import { db } from "../db/client";
import { sessions, users, auditLogs } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set");
}
const SIGNING_KEY = new TextEncoder().encode(SESSION_SECRET);

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "vendora_session";
export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME ?? "vendora_csrf";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? "12");

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  onboardingComplete: boolean;
}

/** Hash a password for storage. */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_SALT_ROUNDS);
}

/** Verify a plaintext password against a hash. */
export async function verifyPassword(
  password: string,
  hashValue: string,
): Promise<boolean> {
  return compare(password, hashValue);
}

/** Create a database-backed session and return the signed session cookie token. */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    sessionToken,
    userId,
    expires,
  });

  const token = await signSessionToken({
    sub: userId,
    sessionToken,
    exp: Math.floor(expires.getTime() / 1000),
  });

  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    userId,
    action: "SESSION_CREATED",
    entityType: "Session",
    entityId: sessionToken,
    ipAddress,
    userAgent,
  });

  return token;
}

/** Verify a session cookie token and return the user + session. */
export async function getSession(token: string): Promise<{
  user: SessionUser;
  sessionId: string;
} | null> {
  if (!token) return null;

  let payload: JWTPayload;
  try {
    const { payload: verified } = await jwtVerify(token, SIGNING_KEY);
    payload = verified;
  } catch {
    return null;
  }

  const sessionToken = payload.sessionToken as string | undefined;
  const userId = payload.sub as string | undefined;
  if (!sessionToken || !userId) return null;

  const [session, user] = await Promise.all([
    db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expires, new Date()),
        ),
      )
      .limit(1),
    db.select().from(users).where(eq(users.id, userId)).limit(1),
  ]);

  if (!session[0] || !user[0]) return null;

  return {
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name ?? null,
      role: user[0].role,
      onboardingComplete: !!user[0].onboardingComplete,
    },
    sessionId: session[0].id,
  };
}

/** Destroy a session (logout). */
export async function destroySession(sessionToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
}

/** Destroy all sessions for a user. */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Sign a session JWT. */
async function signSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_MS / 1000)
    .sign(SIGNING_KEY);
}

/** Generate a CSRF token. */
export function createCsrfToken(): string {
  return crypto.randomUUID();
}

/** Create an email verification token. */
export function createVerificationToken(): string {
  return crypto.randomUUID();
}

/** Create a password reset token. */
export function createPasswordResetToken(): string {
  return crypto.randomUUID();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
