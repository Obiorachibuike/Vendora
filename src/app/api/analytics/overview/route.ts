import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { orders, payments, refunds, orderItems } from "@/db/schema";
import { eq, sum, avg, count, and } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const revenueResult = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(orders, eq(orders.id, payments.orderId))
      .where(and(eq(orders.storeId, storeId), eq(payments.status, "SUCCESS")));

    const orderResult = await db
      .select({ total: count(), avg: avg(orders.total) })
      .from(orders)
      .where(eq(orders.storeId, storeId));

    const refundResult = await db
      .select({ total: sum(refunds.amount) })
      .from(refunds)
      .innerJoin(orders, eq(orders.id, refunds.orderId))
      .where(and(eq(orders.storeId, storeId), eq(refunds.status, "PROCESSED")));

    const costResult = await db
      .select({ total: sum(orderItems.cost) })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(eq(orders.storeId, storeId));

    const grossRevenue = Number(revenueResult[0]?.total ?? 0);
    const refunded = Number(refundResult[0]?.total ?? 0);
    const netRevenue = grossRevenue - refunded;
    const orderCount = Number(orderResult[0]?.total ?? 0);
    const aov = orderCount > 0 ? netRevenue / orderCount : 0;
    const cogs = Number(costResult[0]?.total ?? 0);
    const grossProfit = netRevenue - cogs;

    return NextResponse.json({
      storeId,
      totalRevenue: grossRevenue,
      netRevenue,
      totalOrders: orderCount,
      averageOrderValue: Math.round(aov * 100) / 100,
      totalRefunds: refunded,
      cogs,
      grossProfit: Math.round(grossProfit * 100) / 100,
      netProfit: Math.round(grossProfit * 100) / 100,
      margin: grossRevenue > 0 ? Math.round((grossProfit / grossRevenue) * 10000) / 10000 : 0,
      note: "All metrics calculated from actual persisted transaction data.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Analytics failed") }, { status: 500 });
  }
}
