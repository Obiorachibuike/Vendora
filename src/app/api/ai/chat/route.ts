import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { createAIProvider } from "@/lib/ai/provider";
import { aiUsage } from "@/db/schema";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const { messages, storeId } = body;
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const provider = createAIProvider();
    const result = await provider.complete(messages as any, {});

    if (storeId) {
      await db.insert(aiUsage).values({
        id: crypto.randomUUID(),
        storeId,
        userId: session.user.id,
        provider: result.provider,
        model: result.model,
        tokens: result.usage?.totalTokens ?? 0,
        cost: result.cost ?? 0,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "AI chat failed") }, { status: 500 });
  }
}
