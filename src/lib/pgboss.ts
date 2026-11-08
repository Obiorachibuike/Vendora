import { PgBoss, type ConstructorOptions } from "pg-boss";

type PGBoss = InstanceType<typeof PgBoss>;

/**
 * pg-boss client — PostgreSQL-backed persistent job queue.
 *
 * The worker runs as a separate long-lived Node process (src/worker.ts),
 * never inside Vercel serverless functions. pg-boss creates its own
 * `pgboss` schema / jobs table on first connection.
 *
 * Job names (see src/lib/jobs/constants.ts):
 * - product.discover, product.research, product.sync-prices
 * - supplier.sync, supplier.sync-inventory, supplier.score
 * - order.fulfill, order.sync-tracking, order.retry
 * - notification.send, analytics.aggregate, abandoned-cart.process
 */

let boss: PGBoss | null = null;

export function getBoss(opts?: ConstructorOptions): PGBoss {
  if (boss) return boss;

  const connectionString =
    opts?.connectionString ??
    process.env.PGBOSS_CONNECTION_STRING ??
    process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "PGBOSS_CONNECTION_STRING (or DATABASE_URL) is not set for pg-boss.",
    );
  }

  boss = new PgBoss({ connectionString });
  return boss;
}

export async function ensureQueue(name: string): Promise<void> {
  await getBoss().createQueue(name);
}

export async function closeBoss(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
  }
}
