import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.storeId, storeId))
      .orderBy(desc(notifications.createdAt));
    return NextResponse.json({ notifications: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load notifications" }, { status: 500 });
  }
}
