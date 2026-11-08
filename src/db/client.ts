import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Database client.
 *
 * Uses a pg Pool backed by DATABASE_URL. In serverless environments (Vercel)
 * point DATABASE_URL at a pooled connection (Neon/Supabase/RDS with PgBouncer
 * via ?pgbouncer=true&connection_limit=1) so serverless functions don't
 * exhaust connections.
 *
 * The persistent pg-boss worker is a separate long-running Node process
 * (see src/worker.ts) with its own pool.
 *
 * `pg` is lazy-required so this module can be imported during builds and
 * prerendering without a live database connection or edge-runtime issues.
 */

let pool: any = null;
let dbInstance: any = null;

function getPool(): any {
  if (pool) return pool;
  const { Pool } = require("pg");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }
  pool = new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? "10"),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT ?? "30000"),
    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT ?? "10000"),
  });
  return pool;
}

export const db = new Proxy({} as any, {
  get(_target: any, prop: string) {
    const inst = dbInstance ?? drizzle(getPool(), { schema });
    dbInstance = inst;
    return inst[prop];
  },
});

export type DB = any;

export async function healthCheck(): Promise<boolean> {
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}
