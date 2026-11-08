import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { customers } from "@/db/schema";
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
      .from(customers)
      .where(eq(customers.storeId, storeId))
      .orderBy(desc(customers.createdAt));
    return NextResponse.json({ customers: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const body = await req.json();
    const { storeId, email, phone, name, externalId } = body;
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const [customer] = await db
      .insert(customers)
      .values({ id: crypto.randomUUID(), storeId, email, phone, name, externalId })
      .returning();
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Create customer failed" }, { status: 500 });
  }
}
