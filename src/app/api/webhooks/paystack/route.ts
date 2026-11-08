import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (secret && signature) {
      const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const data = event.data ?? {};
    const reference = data.reference;

    // reference format: orderId-timestamp
    const orderId = reference ? String(reference).split("-")[0] : null;

    if (event.event === "charge.success" && orderId) {
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
