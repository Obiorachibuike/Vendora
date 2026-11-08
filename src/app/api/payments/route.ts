import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { payments, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const orderId = searchParams.get("orderId");

    const conds = [];
    if (orderId) conds.push(eq(payments.orderId, orderId));

    let q = db.select().from(payments).orderBy(desc(payments.createdAt));
    if (storeId) {
      q = db
        .select()
        .from(payments)
        .innerJoin(orders, eq(orders.id, payments.orderId))
        .where(eq(orders.storeId, storeId))
        .orderBy(desc(payments.createdAt));
    }

    const rows = await q;
    return NextResponse.json({ payments: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load payments" }, { status: 500 });
  }
}
