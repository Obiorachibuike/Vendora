import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (secret && signature) {
      // Real impl: stripe.webhooks.constructEvent(body, signature, secret)
      // Skeleton: accept without strict verification until secret configured
    }

    const event = JSON.parse(body);
    const data = event.data?.object ?? {};
    const reference = data.metadata?.orderId || data.customer;

    if (event.type === "payment_intent.succeeded" && reference) {
      const orderId = String(reference).split("-")[0];
      await db
        .update(payments)
        .set({ status: "SUCCESS", providerTransactionId: data.id, updatedAt: new Date() })
        .where(eq(payments.orderId, orderId));

      await db
        .update(orders)
        .set({ paymentStatus: "PAID", status: "PROCESSING", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Webhook failed" }, { status: 500 });
  }
}
