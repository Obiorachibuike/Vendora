import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const [settings] = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.storeId, storeId))
      .limit(1);
    if (!settings) {
      return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
    }
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Failed to load settings") }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const body = await req.json();
    const { storeId, ...values } = body;
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const [settings] = await db
      .update(storeSettings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(storeSettings.storeId, storeId))
      .returning();
    if (!settings) return NextResponse.json({ error: "Store settings not found" }, { status: 404 });
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Update settings failed") }, { status: 500 });
  }
}
