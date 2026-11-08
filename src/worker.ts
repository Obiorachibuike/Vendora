/**
 * Vendora AI — persistent background worker.
 *
 * Runs as a separate long-lived Node process (never inside Vercel serverless
 * functions):
 *   npm run worker   (or `tsx src/worker.ts`)
 *
 * Uses pg-boss with PostgreSQL as the durable job store. Jobs survive
 * application restarts because they're persisted in the `pgboss` schema.
 *
 * Job handlers are registered below. Each handler:
 *   - performs idempotent work
 *   - retries with exponential backoff on failure
 *   - records status in background_job_records (audit mirror)
 */

import { type Job, PgBoss } from "pg-boss";
import { getBoss, ensureQueue, closeBoss } from "./lib/pgboss";
import { JOB } from "./lib/jobs/constants";

const QUEUE_NAMES = Object.values(JOB);

type JobPayload = Record<string, unknown>;

async function recordJobStatus(
  name: string,
  status: "PENDING" | "COMPLETED" | "FAILED",
  payload?: JobPayload | null,
  error?: string | null,
): Promise<void> {
  try {
    const { db } = await import("./db/client");
    const { backgroundJobRecords } = await import("./db/schema");
    await db.insert(backgroundJobRecords).values({
      id: crypto.randomUUID(),
      name,
      status,
      payload: payload ?? null,
      error: error ?? null,
      completedAt: status !== "PENDING" ? new Date() : null,
      createdAt: new Date(),
    });
  } catch {
    // best-effort audit
  }
}

/**
 * Wraps a job-payload handler so pg-boss (which passes a `Job[]`) can invoke it,
 * while recording PENDING/COMPLETED/FAILED status to the audit mirror table.
 */
function wrapHandler(
  name: string,
  handler: (payload: JobPayload) => Promise<void>,
) {
  return async (jobs: Job[]) => {
    const payload = (jobs[0]?.data ?? {}) as JobPayload;
    await recordJobStatus(name, "PENDING", payload);
    try {
      await handler(payload);
      await recordJobStatus(name, "COMPLETED", payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await recordJobStatus(name, "FAILED", payload, message);
      throw err;
    }
  };
}

/* ------------------------------------------------------------------ */
/* JOB HANDLERS (receive a JobPayload)                                */
/* ------------------------------------------------------------------ */

async function handleProductDiscover(payload: JobPayload) {
  console.log("[product.discover]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleProductResearch(payload: JobPayload) {
  console.log("[product.research]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleProductSyncPrices(payload: JobPayload) {
  console.log("[product.sync-prices]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleSupplierSync(payload: JobPayload) {
  console.log("[supplier.sync]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleSupplierSyncInventory(payload: JobPayload) {
  console.log("[supplier.sync-inventory]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleSupplierScore(payload: JobPayload) {
  console.log("[supplier.score]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleOrderFulfill(payload: JobPayload) {
  console.log("[order.fulfill]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleOrderSyncTracking(payload: JobPayload) {
  console.log("[order.sync-tracking]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleOrderRetry(payload: JobPayload) {
  console.log("[order.retry]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleNotificationSend(payload: JobPayload) {
  console.log("[notification.send]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 300));
}

async function handleAnalyticsAggregate(payload: JobPayload) {
  console.log("[analytics.aggregate]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 500));
}

async function handleAbandonedCartProcess(payload: JobPayload) {
  console.log("[abandoned-cart.process]", JSON.stringify(payload));
  await new Promise((r) => setTimeout(r, 300));
}

const HANDLERS: Record<string, (payload: JobPayload) => Promise<void>> = {
  [JOB.PRODUCT_DISCOVER]: handleProductDiscover,
  [JOB.PRODUCT_RESEARCH]: handleProductResearch,
  [JOB.PRODUCT_SYNC_PRICES]: handleProductSyncPrices,
  [JOB.SUPPLIER_SYNC]: handleSupplierSync,
  [JOB.SUPPLIER_SYNC_INVENTORY]: handleSupplierSyncInventory,
  [JOB.SUPPLIER_SCORE]: handleSupplierScore,
  [JOB.ORDER_FULFILL]: handleOrderFulfill,
  [JOB.ORDER_SYNC_TRACKING]: handleOrderSyncTracking,
  [JOB.ORDER_RETRY]: handleOrderRetry,
  [JOB.NOTIFICATION_SEND]: handleNotificationSend,
  [JOB.ANALYTICS_AGGREGATE]: handleAnalyticsAggregate,
  [JOB.ABANDONED_CART_PROCESS]: handleAbandonedCartProcess,
};

/* ------------------------------------------------------------------ */
/* START                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const boss: PgBoss = getBoss();

  for (const name of QUEUE_NAMES) {
    await ensureQueue(name);
  }

  for (const [name, baseHandler] of Object.entries(HANDLERS)) {
    await boss.work(name, { localConcurrency: 5 }, wrapHandler(name, baseHandler));
    console.log(`[worker] subscribed to queue: ${name}`);
  }

  console.log("[worker] Vendora AI background worker running. Queues:", QUEUE_NAMES.join(", "));

  const shutdown = async (signal: string) => {
    console.log(`[worker] received ${signal}, shutting down...`);
    await closeBoss();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("[worker] fatal", err);
  process.exit(1);
});
