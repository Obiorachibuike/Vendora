import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { orders, supplierOrders, suppliers, fulfillments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { orderFulfillSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const { orderId } = { orderId: (req as any).params?.orderId ?? undefined };
    const body = await req.json();
    const parsed = orderFulfillSchema.safeParse({ orderId, ...body });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { orderId: oid, supplierId: overrideSupplierId } = parsed.data;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, oid))
      .limit(1);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Order must be paid before fulfillment" }, { status: 400 });
    }

    // Idempotency: prevent duplicate supplier orders
    const existing = await db
      .select()
      .from(supplierOrders)
      .where(eq(supplierOrders.orderId, oid))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ supplierOrder: existing[0], duplicate: true });
    }

    // Select supplier (deterministic). For now, use override or first enabled supplier.
    let supplier = null;
    if (overrideSupplierId) {
      [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, overrideSupplierId))
        .limit(1);
    } else {
      [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.isEnabled, true))
        .limit(1);
    }

    if (!supplier) {
      // Route to exception queue instead of silently failing
      await db
        .insert(require("@/db/schema").orderExceptions)
        .values({
          id: crypto.randomUUID(),
          orderId: oid,
          reason: "No eligible supplier available for automatic fulfillment",
          status: "OPEN",
        });
      await db
        .update(orders)
        .set({ status: "REQUIRES_ATTENTION" })
        .where(eq(orders.id, oid));
      return NextResponse.json({
        order: { id: oid, status: "REQUIRES_ATTENTION" },
        message: "No eligible supplier — routed to exception queue",
      });
    }

    const idempotencyKey = `fulfill-${oid}-${supplier.id}`;
    const [supplierOrder] = await db
      .insert(supplierOrders)
      .values({
        id: crypto.randomUUID(),
        orderId: oid,
        supplierId: supplier.id,
        connectionId: crypto.randomUUID(), // placeholder
        status: "PENDING",
        total: order.total,
        currency: order.currency,
        idempotencyKey,
      })
      .returning();

    await db.insert(fulfillments).values({
      id: crypto.randomUUID(),
      orderId: oid,
      status: "pending",
      supplierOrderId: supplierOrder.id,
    });

    await db
      .update(orders)
      .set({ status: "AWAITING_SUPPLIER_CONFIRMATION", fulfillmentStatus: "PENDING" })
      .where(eq(orders.id, oid));

    await db.insert(require("@/db/schema").auditLogs).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      storeId: order.storeId,
      action: "ORDER_FULFILL",
      entityType: "Order",
      entityId: oid,
    });

    return NextResponse.json({ supplierOrder, order: { id: oid, status: "AWAITING_SUPPLIER_CONFIRMATION" } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Fulfillment failed" }, { status: 500 });
  }
}
