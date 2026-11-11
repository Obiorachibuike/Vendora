import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api";
import { db } from "@/db/client";
import { suppliers, supplierConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    const allSuppliers = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        marketplace: suppliers.marketplace,
        isActive: suppliers.isActive,
        isEnabled: suppliers.isEnabled,
        supportsApi: suppliers.supportsApi,
      })
      .from(suppliers);

    let connections: any[] = [];
    if (storeId) {
      connections = await db
        .select()
        .from(supplierConnections)
        .where(eq(supplierConnections.storeId, storeId));
    }

    const enriched = allSuppliers.map((s: any) => {
      const conn = storeId ? connections.find((c) => c.supplierId === s.id) : undefined;
      return {
        ...s,
        connectionStatus: conn ? conn.status : "PENDING",
        healthStatus: conn ? conn.healthStatus : "UNKNOWN",
        connected: conn ? conn.status === "ACTIVE" : false,
      };
    });

    return NextResponse.json({ suppliers: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Failed to load suppliers") }, { status: 500 });
  }
}
