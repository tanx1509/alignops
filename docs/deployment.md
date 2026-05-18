# Deployment Guide

## Production Target

- Next.js 14 App Router on Vercel
- PostgreSQL on Supabase
- Supabase Auth for identity
- Prisma ORM with pooled and direct connection URLs

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
SKIP_ENV_VALIDATION="false"
```

## Database

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

## Supabase Auth

Create Supabase Auth users for the demo emails listed in `docs/demo-walkthrough.md`. The Prisma seed creates application users and role assignments; Supabase Auth must have matching user emails so the session can resolve to the application user.

Recommended demo password: `AlignOps@123`.

## Vercel

1. Import the repository into Vercel.
2. Set all environment variables above.
3. Ensure the build command remains:

```bash
npm run build
```

4. Deploy.
5. Run migrations before the final deployment if the production database is new:

```bash
npm run db:deploy
```

6. Seed only the demo environment, not a real production tenant:

```bash
npm run db:seed
```

## Verification

```bash
SKIP_ENV_VALIDATION=true npm run typecheck
SKIP_ENV_VALIDATION=true npm run lint
SKIP_ENV_VALIDATION=true npm run build
```

For a real deployment, run build with real production environment variables and `SKIP_ENV_VALIDATION=false`.

## Cost Optimization

- Modular monolith avoids unnecessary microservices.
- Server components reduce client JavaScript.
- Deterministic intelligence avoids external AI API cost.
- Prisma and Supabase keep the backend simple and low-ops.
- CSV reports are generated on demand from existing data.
- Notification center simulates enterprise workflows without paid messaging integrations.
