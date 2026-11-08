import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("verif-hash");
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;

    // Flutterwave webhook signature verification (skeleton)
    if (secret && signature) {
      // Real impl: verify signature against secret
    }

    const event = JSON.parse(body);
    const data = event.data ?? {};
    const txRef = data.tx_ref;
    const orderId = txRef ? String(txRef).split("-")[0] : null;

    if (event.event === "charge.completed" && orderId && data.status === "successful") {
      await db
        .update(payments)
        .set({ status: "SUCCESS", providerTransactionId: String(data.id), updatedAt: new Date() })
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
