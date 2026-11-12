# Vendora AI

AI-powered dropshipping and ecommerce automation — product research with
transparent opportunity scoring, supplier discovery/comparison/integrations,
landed-cost profit pricing, automated order fulfillment and analytics.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind CSS v4**
- **Drizzle ORM** + **PostgreSQL** (migration: `src/db/migrations/0001_init.sql`)
- **pg-boss** job queue with a standalone worker (`npm run worker`)
- Auth: JWT sessions (`jose`) in an `httpOnly` cookie, CSRF double-submit cookie,
  route protection via the **proxy** (`src/proxy.ts`, Next.js 16 convention)
- Payments: Paystack, Flutterwave, Stripe (webhooks under `src/app/api/webhooks`)

## Getting started

```bash
npm ci --legacy-peer-deps   # note: npm ci needs --legacy-peer-deps
cp .env.example .env.local  # then fill in the required values
```

Required environment variables (see `.env.example`):

| Variable | Why |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Session JWT signing secret — **`next build` fails without it** |
| `ENCRYPTION_KEY` | AES-256-GCM key for supplier credentials (`openssl rand -base64 32`) |

Create the schema (pick one):

```bash
psql "$DATABASE_URL" -f src/db/migrations/0001_init.sql
# or
npx drizzle-kit push
```

Run it:

```bash
npm run dev      # http://localhost:3000
```

`/` is the public marketing site. After registering, you complete onboarding
(creates your organization, store and store settings in one transaction) and
land on `/dashboard` — every `/dashboard/*` route requires an active session.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build (needs SESSION_SECRET)
npm run start      # serve the production build
npm run lint       # eslint
npm run worker     # pg-boss worker (separate long-running process)
npm run db:generate|db:push|db:migrate|db:studio
```

## Deploying (Vercel)

Set the env vars from `.env.example` in the project settings (at minimum
`SESSION_SECRET`, `DATABASE_URL`, `ENCRYPTION_KEY`). `next build` fails if
`SESSION_SECRET` is missing because the auth module throws at import time.

The production database must be migrated once:

```bash
psql "$DATABASE_URL" -f src/db/migrations/0001_init.sql
```

If registration or login fails in production, open `/api/health` first:

| `status` | Meaning |
| --- | --- |
| `ok` | Database reachable, `users`/`sessions`/`audit_logs` present |
| `db_unavailable` | Cannot connect (env vars, networking, TLS, pool exhaustion) |
| `schema_missing` | Connected, but the migration has **not** been applied — run the `psql` above |
| `schema_unknown` | Connected, but the schema probe failed (permissions) |

API error responses are intentionally generic for unexpected internals, but
known failure modes are classified and reported honestly (unreachable DB,
schema out of date, duplicate record, bad credentials). The classifier
(`src/lib/api-error.ts`) unwraps drizzle-orm's `DrizzleQueryError.cause`
chain, so the Postgres SQLSTATE / socket code of the underlying driver error
is always what gets classified. The raw error (including `query` and
`params`) is logged server-side as `register error …`, `login error …`,
`onboarding error …`.

## Notes

- `npm ci` requires `--legacy-peer-deps` (vitest vs `@types/node` peer conflict).
- `npm test` (vitest) is wired up but there are no test files yet.
- The marketing landing page lives in `src/app/page.tsx` (static).
