import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbOk = await db
    .execute(sql`SELECT 1`)
    .then(() => true)
    .catch(() => false);
  return NextResponse.json({
    status: dbOk ? "ok" : "db_unavailable",
    time: new Date().toISOString(),
  });
}
