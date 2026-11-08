import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import {
  productImportSchema,
} from "@/lib/validations";
import {
  products,
  productSupplierMappings,
  supplierOffers,
  storeSettings,
  auditLogs,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculatePrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = productImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { supplierOfferId, storeId, variantId, title, basePrice, autoPublish } = parsed.data;

    const [offer] = await db
      .select()
      .from(supplierOffers)
      .where(eq(supplierOffers.id, supplierOfferId))
      .limit(1);
    if (!offer) {
      return NextResponse.json({ error: "Supplier offer not found" }, { status: 404 });
    }

    const [settings] = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.storeId, storeId))
      .limit(1);
    const minMargin = settings?.minProfitMargin ?? 0.2;

    const pricing = calculatePrice("PERCENTAGE", 50, {
      wholesalePrice: offer.wholesalePrice,
      shippingPrice: offer.shippingPrice,
      currency: offer.currency,
    }, { minMargin, psychological: true });

    const finalPrice = basePrice ?? pricing.suggestedSellingPrice;

    const [product] = await db
      .insert(products)
      .values({
        id: crypto.randomUUID(),
        storeId,
        title: title || `Imported ${offer.name}`,
        handle:
          (title || offer.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-") +
          "-" +
          crypto.randomUUID().slice(0, 4),
        description: offer.description,
        basePrice: finalPrice,
        currency: offer.currency,
        costBasis: pricing.totalEstimatedCost,
        minMargin,
        status: autoPublish ? "ACTIVE" : "DRAFT",
        images: [],
      })
      .returning();

    await db.insert(productSupplierMappings).values({
      id: crypto.randomUUID(),
      productId: product.id,
      variantId: variantId ?? null,
      supplierOfferId,
      storeId,
      isPrimary: true,
      autoSwitchEnabled: true,
    });

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      storeId,
      action: "PRODUCT_IMPORTED",
      entityType: "Product",
      entityId: product.id,
    });

    return NextResponse.json({ product, pricing }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Import failed" }, { status: 500 });
  }
}
