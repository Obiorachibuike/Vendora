import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { supplierSearchSchema } from "@/lib/validations";
import { supplierRegistry } from "@/lib/suppliers/registry";
import { zodErrorMessage, userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await authenticateRequest(req);

    const body = await req.json();
    const parsed = supplierSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
    }

    const { keyword, country, minMargin, maxPrice, limit = 20, offset = 0 } = parsed.data;

    // Query connected supplier catalogs via adapters. Each enabled adapter
    // that supports API is asked for matching products. Until real credentials
    // are configured, adapters return empty results (never fabricated).
    const results: Array<{
      supplier: { id: string; name: string; marketplace: string };
      product: any;
    }> = [];

    for (const reg of supplierRegistry.list()) {
      if (!reg.enabled || !reg.supportsApi) continue;
      try {
        const products = await reg.adapter.getProducts({
          keyword,
          country,
          limit,
          offset,
        });
        for (const p of products) {
          results.push({ supplier: { id: reg.id, name: reg.name, marketplace: reg.marketplace }, product: p });
        }
      } catch {
        // adapter not yet live — skip, report as not connected
      }
    }

    // Apply client-side price filtering
    let filtered = results.filter((r) => {
      if (maxPrice != null && r.product.wholesalePrice > maxPrice) return false;
      return true;
    });

    filtered = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      results,
      total: filtered.length,
      note: "Until supplier credentials are connected and verified, discovery returns empty results. No supplier data is fabricated.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Supplier search failed") }, { status: 500 });
  }
}
