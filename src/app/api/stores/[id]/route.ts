import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await authenticateRequest(req);
    const { id } = (req as any).params ?? {};
    const [s] = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    if (!s) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json({ store: s });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load store" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const { id } = (req as any).params ?? {};
    const body = await req.json();
    const { name, description, country, currency, theme, isPublished, timezone } = body;

    const [store] = await db
      .update(stores)
      .set({
        ...(name != null ? { name } : {}),
        ...(description != null ? { description } : {}),
        ...(country != null ? { country } : {}),
        ...(currency != null ? { currency } : {}),
        ...(theme != null ? { theme } : {}),
        ...(timezone != null ? { timezone } : {}),
        ...(isPublished != null ? { isPublished } : {}),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, id))
      .returning();
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json({ store });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Update store failed" }, { status: 500 });
  }
}
