import { NextResponse } from "next/server";
import { authenticateRequest, assertCsrfAsync } from "@/lib/api";
import { supplierConnectSchema } from "@/lib/validations";
import { db } from "@/db/client";
import { suppliers, supplierConnections, supplierCredentials, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supplierRegistry } from "@/lib/suppliers/registry";
import { encryptString } from "@/lib/encryption";
import { zodErrorMessage, userMessage } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await authenticateRequest(req);
    await assertCsrfAsync(req);

    const body = await req.json();
    const parsed = supplierConnectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
    }

    const { supplierId } = parsed.data;

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1);
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const reg = supplierRegistry.get(supplier.id) ?? supplierRegistry.list().find((s) => s.id === supplierId);
    if (!reg) {
      return NextResponse.json({ error: "Supplier adapter not registered" }, { status: 404 });
    }
    if (!reg.enabled) {
      return NextResponse.json({ error: "Supplier integration is disabled by the administrator" }, { status: 403 });
    }

    const adapter = reg.adapter;

    // In a real flow the client posts credentials here. For now, we attempt a
    // connection test with whatever is in the body (token/secret).
    const { token, secret } = body;
    const test = await adapter.testConnection({ token, secret });

    let connection: any;
    if (test.success) {
      const [existing] = await db
        .select()
        .from(supplierConnections)
        .where(eq(supplierConnections.storeId, session.user.id))
        .limit(1);
      // NOTE: storeId linkage requires a store context; we associate with the
      // user's default organization/store created at onboarding. This is a
      // skeleton — real flows pass storeId explicitly.
      connection = await db
        .insert(supplierConnections)
        .values({
          id: crypto.randomUUID(),
          storeId: session.user.id, // placeholder: user's default store
          supplierId: supplier.id,
          status: "ACTIVE",
          healthStatus: "HEALTHY",
          lastHealthCheck: new Date(),
        })
        .returning();

      if (token || secret) {
        await db.insert(supplierCredentials).values({
          id: crypto.randomUUID(),
          connectionId: connection[0].id,
          encryptedToken: token ? await encryptString(token) : null,
          encryptedSecret: secret ? await encryptString(secret) : null,
        });
      }

      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "SUPPLIER_CONNECTED",
        entityType: "SupplierConnection",
        entityId: connection[0].id,
      });

      return NextResponse.json({
        supplier: { id: supplier.id, name: supplier.name },
        connection: { id: connection[0].id, status: connection[0].status },
        message: test.message,
      });
    }

    return NextResponse.json(
      { error: test.message ?? "Connection failed" },
      { status: 400 },
    );
  } catch (err: any) {
    return NextResponse.json({ error: userMessage(err, "Connect failed") }, { status: 500 });
  }
}
