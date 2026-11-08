import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { selectSupplier, DEFAULT_SELECTION_CONFIG } from "@/lib/supplier-selection";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await authenticateRequest(req);

    const body = await req.json();
    const { offers, weights, minMargin } = body;

    if (!Array.isArray(offers)) {
      return NextResponse.json({ error: "offers array is required" }, { status: 400 });
    }

    const config = {
      ...DEFAULT_SELECTION_CONFIG,
      weights: weights || DEFAULT_SELECTION_CONFIG.weights,
      minMargin: minMargin ?? DEFAULT_SELECTION_CONFIG.minMargin,
    };

    const ranked = selectSupplier(offers, config);
    const best = ranked.find((r) => r.eligible);

    return NextResponse.json({
      ranked,
      recommended: best ?? null,
      note: "Supplier selection uses deterministic structured scoring, not arbitrary AI guesses.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Supplier comparison failed" }, { status: 500 });
  }
}
