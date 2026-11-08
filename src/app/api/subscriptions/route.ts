import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.storeId, storeId));
    return NextResponse.json({ subscriptions: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load subscriptions" }, { status: 500 });
  }
}
