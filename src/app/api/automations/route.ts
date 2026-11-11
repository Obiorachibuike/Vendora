import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { automationRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });
    const rows = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.storeId, storeId));
    return NextResponse.json({ automations: rows });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Failed to load automations") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const body = await req.json();
    const { storeId, name, type, config, enabled } = body;
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const [row] = await db
      .insert(automationRules)
      .values({
        id: crypto.randomUUID(),
        storeId,
        name,
        type: type ?? "scheduled",
        config: config ?? null,
        isActive: enabled ?? true,
      })
      .returning();
    return NextResponse.json({ automation: row }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Create automation failed") }, { status: 500 });
  }
}
