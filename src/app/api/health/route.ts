import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const time = new Date().toISOString();

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    return NextResponse.json({ status: "db_unavailable", time });
  }

  try {
    const res = await db.execute(
      sql`SELECT to_regclass('public.users') AS users,
                 to_regclass('public.sessions') AS sessions,
                 to_regclass('public.audit_logs') AS audit_logs`,
    );
    const rows =
      (res as { rows?: Record<string, unknown>[] })?.rows ??
      (Array.isArray(res) ? (res as Record<string, unknown>[]) : []);
    const row = rows[0] ?? {};
    const schemaOk = Boolean(row.users) && Boolean(row.sessions) && Boolean(row.audit_logs);
    if (!schemaOk) {
      return NextResponse.json({ status: "schema_missing", time });
    }
  } catch {
    // A failed schema probe (e.g. permission denied) — connectivity works, schema unverifiable.
    return NextResponse.json({ status: "schema_unknown", time });
  }

  return NextResponse.json({ status: "ok", time });
}
