import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { productCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const conds = [eq(products.storeId, storeId)];
    if (status) conds.push(eq(products.status, status as any));

    const rows = await db
      .select()
      .from(products)
      .where(...conds)
      .orderBy(desc(products.createdAt));

    return NextResponse.json({ products: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const v = parsed.data;
    const handle = v.handle || v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const [row] = await db
      .insert(products)
      .values({
        id: crypto.randomUUID(),
        storeId: v.storeId,
        title: v.title,
        handle,
        description: v.description,
        categoryId: v.categoryId,
        basePrice: v.basePrice,
        currency: v.currency,
        minMargin: v.minMargin,
        weight: v.weight,
        tags: v.tags ?? [],
        seoTitle: v.seoTitle,
        seoDescription: v.seoDescription,
        status: v.status,
      })
      .returning();

    return NextResponse.json({ product: row }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Create product failed" }, { status: 500 });
  }
}
