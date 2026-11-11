import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { pricingRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId is required" }, { status: 400 });

    const rows = await db.select().from(pricingRules).where(eq(pricingRules.storeId, storeId));
    return NextResponse.json({ rules: rows });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Failed to load pricing rules") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const body = await req.json();
    const { storeId, name, markupType, markupValue, minMargin, enabled } = body;
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const [rule] = await db.insert(pricingRules).values({
      id: crypto.randomUUID(),
      storeId,
      name: name || "Default",
      markupType,
      markupValue: String(markupValue),
      minMargin: minMargin ?? 0.2,
      enabled: enabled ?? true,
    }).returning();
    return NextResponse.json({ rule }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Create pricing rule failed") }, { status: 500 });
  }
}
