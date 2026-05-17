# AlignOps

Enterprise goal governance and execution operating system built as a Next.js modular monolith.

This repository is intentionally scaffolded for rapid hackathon execution without pretending to be a distributed enterprise platform. The current phase sets up the foundation only: auth boundaries, role-aware routing, Prisma/Postgres, shadcn/ui, environment validation, and module organization.

## Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL via Supabase or Neon
- Supabase Auth utilities
- Zod validation
- Vercel deployment target

## Exact Setup Commands

The project was scaffolded with:

```bash
npx create-next-app@14.2.23 atomberg-goals --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Next was upgraded within the requested Next 14 line:

```bash
npm install next@14.2.35 eslint-config-next@14.2.35
```

Core dependencies:

```bash
npm install @prisma/client@6.19.3 @supabase/ssr @supabase/supabase-js zod @t3-oss/env-nextjs clsx tailwind-merge class-variance-authority lucide-react
npm install -D prisma@6.19.3 dotenv
```

shadcn/ui initialization and starter components:

```bash
npx shadcn@latest init -d
npx shadcn@latest add card badge table input label textarea select dropdown-menu separator skeleton alert avatar sheet form
```

Prisma initialization:

```bash
npx prisma init --datasource-provider postgresql
```

## Environment

Copy the example file:

```bash
cp .env.example .env.local
```

Required values:

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SKIP_ENV_VALIDATION="false"
```

Use `SKIP_ENV_VALIDATION=true` only for local codegen/typecheck when real secrets are unavailable.

## Development Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

## Directory Structure

```txt
src/
  app/
    (auth)/
      login/
      unauthorized/
    (protected)/
      employee/
      manager/
      admin/
      error.tsx
      layout.tsx
      loading.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    app/
    feedback/
    ui/
  config/
    env.ts
    navigation.ts
  lib/
    auth/
    db/
    supabase/
    utils.ts
  modules/
    audit/
    checkins/
    escalations/
    goals/
    org/
    reporting/
    shared-goals/
  types/
  validation/
prisma/
  schema.prisma
middleware.ts
```

## Architecture Rules

- Keep the app as a modular monolith.
- Put workflow modules under `src/modules/<domain>`.
- Keep reusable UI primitives under `src/components/ui`.
- Keep shell-level app components under `src/components/app`.
- Keep authorization in middleware and server-side guards.
- Keep database access behind service functions when domain work begins.
- Use Zod at module boundaries: forms, route handlers, server actions, and env config.
- Do not add microservices, queues, websockets, or Docker unless a later requirement proves the need.

## Auth and Roles

Protected routes:

- `/employee` requires `employee`
- `/manager` requires `manager`
- `/admin` requires `admin`

Role hierarchy:

```txt
admin > manager > employee
```

Supabase user metadata may use either:

```json
{ "role": "manager" }
```

or:

```json
{ "roles": ["employee", "manager"] }
```

Server-side guards live in:

```txt
src/lib/auth/session.ts
src/lib/auth/roles.ts
```

Middleware route protection lives in:

```txt
middleware.ts
src/lib/supabase/middleware.ts
```

## Prisma Foundation

The initial schema includes only identity/profile primitives:

- `UserProfile`
- `AppRole`
- `UserStatus`

Goal sheets, approvals, check-ins, audit logs, shared goals, reports, and escalations should be added in their respective module phase.

## Verification

The foundation currently passes:

```bash
SKIP_ENV_VALIDATION=true npm run typecheck
SKIP_ENV_VALIDATION=true npm run lint
SKIP_ENV_VALIDATION=true DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atomberg?schema=public" NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co" NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key" NEXT_PUBLIC_APP_URL="http://localhost:3000" npm run build
```
