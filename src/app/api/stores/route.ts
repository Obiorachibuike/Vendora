import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { stores, storeSettings, organizations, organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    let rows: any[] = [];
    if (storeId) {
      const [s] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
      rows = s ? [s] : [];
    } else {
      rows = await db.select().from(stores).where(eq(stores.ownerId, session.user.id));
    }

    const enriched = await Promise.all(
      rows.map(async (s) => {
        const [settings] = await db
          .select()
          .from(storeSettings)
          .where(eq(storeSettings.storeId, s.id))
          .limit(1);
        return { ...s, settings };
      }),
    );

    return NextResponse.json({ stores: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load stores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);
    const body = await req.json();
    const { name, slug, country, currency } = body;
    if (!name || !slug || !country || !currency) {
      return NextResponse.json({ error: "name, slug, country, currency required" }, { status: 400 });
    }

    const slugExist = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);
    if (slugExist.length > 0) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const [org] = await db.insert(organizations).values({ id: crypto.randomUUID(), name, slug }).returning();
    const [store] = await db
      .insert(stores)
      .values({
        id: crypto.randomUUID(),
        name,
        slug,
        country,
        currency,
        ownerId: session.user.id,
        organizationId: org.id,
      })
      .returning();
    await db.insert(organizationMembers).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId: session.user.id,
      role: "OWNER",
    });
    await db.insert(storeSettings).values({
      id: crypto.randomUUID(),
      storeId: store.id,
      minProfitMargin: 0.2,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Create store failed" }, { status: 500 });
  }
}
