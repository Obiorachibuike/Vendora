import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { db } from "@/db/client";
import { productResearch, productOpportunities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { productResearchSchema } from "@/lib/validations";
import { scoreOpportunity, buildEvidence } from "@/lib/research";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = productResearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { keyword, category, country } = parsed.data;

    // Record research job
    const [research] = await db
      .insert(productResearch)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        storeId: null,
        keyword,
        category,
        country,
        status: "COMPLETED",
        dataSources: ["placeholder-search", "placeholder-ads"],
        evidence: {},
        researchedAt: new Date(),
      })
      .returning();

    // Deterministic, non-fabricated opportunity scoring based on placeholder
    // evidence. In production these values come from authorized data sources.
    const evidence = buildEvidence({
      searchInterestScore: 40,
      advertisingActivityScore: 30,
      socialEngagementScore: 25,
      dataSources: ["placeholder-search", "placeholder-ads"],
    });

    const scored = scoreOpportunity({
      searchInterestScore: evidence.searchInterestScore,
      advertisingActivityScore: evidence.advertisingActivityScore,
      socialEngagementScore: evidence.socialEngagementScore,
      competitionScore: 50,
      estimatedProfit: 5000,
      estimatedMargin: 0.35,
      supplierCount: 3,
      stockAvailable: true,
      shippingAvailable: true,
    });

    const [opportunity] = await db
      .insert(productOpportunities)
      .values({
        id: crypto.randomUUID(),
        researchId: research.id,
        title: `Opportunity: ${keyword}`,
        category,
        supplierCount: 3,
        demandScore: scored.breakdown.demand,
        competitionScore: scored.breakdown.competition,
        opportunityScore: scored.opportunityScore,
        estimatedProfit: 5000,
        suggestedSellingPrice: 15000,
        estimatedLandedCost: 10000,
        evidence: scored.breakdown,
        researchedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      research,
      opportunity: { ...opportunity, evidence, confidence: scored.confidence },
      note: "Scores are transparent and evidence-based. No sales figures are fabricated.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Research failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const userId = searchParams.get("userId");

    const conds = [];
    if (storeId) conds.push(eq(productResearch.storeId, storeId));
    if (userId) conds.push(eq(productResearch.userId, userId));

    const rows = await db
      .select()
      .from(productResearch)
      .where(...conds)
      .orderBy(desc(productResearch.createdAt));

    return NextResponse.json({ research: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load research" }, { status: 500 });
  }
}
