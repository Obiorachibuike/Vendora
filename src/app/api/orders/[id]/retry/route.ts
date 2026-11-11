import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { supplierOrders, orderExceptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { orderRetrySchema } from "@/lib/validations";
import { zodErrorMessage, userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = orderRetrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
    }

    const { supplierOrderId } = parsed.data;

    const [so] = await db
      .select()
      .from(supplierOrders)
      .where(eq(supplierOrders.id, supplierOrderId))
      .limit(1);
    if (!so) {
      return NextResponse.json({ error: "Supplier order not found" }, { status: 404 });
    }

    const retryCount = (so.retryCount ?? 0) + 1;
    const maxRetries = 3;

    await db
      .update(supplierOrders)
      .set({
        status: "PENDING",
        error: null,
        retryCount,
        updatedAt: new Date(),
      })
      .where(eq(supplierOrders.id, supplierOrderId));

    if (retryCount > maxRetries) {
      await db
        .insert(orderExceptions)
        .values({
          id: crypto.randomUUID(),
          orderId: so.orderId,
          reason: `Supplier order failed after ${maxRetries} retries`,
          status: "OPEN",
        });
    }

    return NextResponse.json({
      supplierOrder: { id: supplierOrderId, status: "PENDING", retryCount },
      message: "Retried",
    });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Retry failed") }, { status: 500 });
  }
}
