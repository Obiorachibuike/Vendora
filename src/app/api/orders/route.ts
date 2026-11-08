import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { orders, orderItems, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { orderCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    if (!storeId) return NextResponse.json({ error: "storeId is required" }, { status: 400 });

    const conds = [eq(orders.storeId, storeId)];
    if (status) conds.push(eq(orders.status, status as any));

    const rows = await db
      .select()
      .from(orders)
      .where(...conds)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = orderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { customerId, currency, customerNote, idempotencyKey } = parsed.data;

    // Idempotency: prevent duplicate order creation
    if (idempotencyKey) {
      const existing = await db
        .select()
        .from(orders)
        .where(eq(orders.idempotencyKey, idempotencyKey))
        .limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ order: existing[0], duplicate: true });
      }
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orderNumber = "VD-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    const [order] = await db
      .insert(orders)
      .values({
        id: crypto.randomUUID(),
        storeId: customer.storeId ?? session.user.id,
        customerId,
        orderNumber,
        status: "PENDING_PAYMENT",
        paymentStatus: "UNPAID",
        currency,
        subtotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        total: 0,
        customerNote,
        idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
      })
      .returning();

    await db.insert(require("@/db/schema").auditLogs).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      storeId: customer.storeId,
      action: "ORDER_CREATED",
      entityType: "Order",
      entityId: order.id,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Create order failed" }, { status: 500 });
  }
}
