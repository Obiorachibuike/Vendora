import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { onboardingSchema } from "@/lib/validations";
import { db } from "@/db/client";
import { stores, storeSettings, users, organizations, organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const v = parsed.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await db.transaction(async (tx: any) => {
      // Create a personal organization for the user — stores.organization_id
      // is a hard FK to organizations(id). Mirrors the /api/stores flow.
      const orgSlug =
        v.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
        "-" +
        crypto.randomUUID().slice(0, 6);
      const [org] = await tx
        .insert(organizations)
        .values({
          id: crypto.randomUUID(),
          name: v.storeName,
          slug: orgSlug,
          country: v.country,
          currency: v.currency,
        })
        .returning();
      await tx.insert(organizationMembers).values({
        id: crypto.randomUUID(),
        organizationId: org.id,
        userId: session.user.id,
        role: "OWNER",
      });

      // Mark user onboarding complete
      await tx
        .update(users)
        .set({ onboardingComplete: true })
        .where(eq(users.id, session.user.id));

      // Create the store
      const slug =
        v.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        crypto.randomUUID().slice(0, 6);

      const [store] = await tx
        .insert(stores)
        .values({
          id: crypto.randomUUID(),
          name: v.storeName,
          slug,
          country: v.country,
          currency: v.currency,
          ownerId: session.user.id,
          organizationId: org.id,
        })
        .returning();

      // Create store settings
      await tx.insert(storeSettings).values({
        id: crypto.randomUUID(),
        storeId: store.id,
        minProfitMargin: v.expectedProfitMargin
          ? Number(v.expectedProfitMargin) / 100
          : 0.2,
      });

      return NextResponse.json({ store: { id: store.id, slug: store.name } });
    });
  } catch (err) {
    console.error("onboarding error", err);
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}
