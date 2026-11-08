import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { backgroundJobRecords } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await authenticateRequest(req);
    const { id } = (req as any).params ?? {};
    const [job] = await db
      .select()
      .from(backgroundJobRecords)
      .where(eq(backgroundJobRecords.id, id))
      .limit(1);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load job" }, { status: 500 });
  }
}
