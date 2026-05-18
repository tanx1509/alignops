<div align="center">

<br/>

     █████╗ ██╗     ██╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗ ███████╗
    ██╔══██╗██║     ██║██╔════╝ ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
    ███████║██║     ██║██║  ███╗██╔██╗ ██║██║   ██║██████╔╝███████╗
    ██╔══██║██║     ██║██║   ██║██║╚██╗██║██║   ██║██╔═══╝ ╚════██║
    ██║  ██║███████╗██║╚██████╔╝██║ ╚████║╚██████╔╝██║     ███████║
    ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚══════╝

### The Governance Operating System for Enterprise Execution

*Not a goal tracker. The control layer that keeps 5,000 employees, managers, and governance teams aligned.*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_+_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Build](https://img.shields.io/badge/Build-Passing-22C55E?style=for-the-badge)](/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

[**Live Platform**](https://alignops-five.vercel.app) · [**Live Demo**](#demo-credentials) · [**Product Demo**](https://www.loom.com/share/605061dd2d28450781752f5d2b41a5e1) · [**Walkthrough**](#product-walkthrough) · [**Architecture**](#architecture) · [**Setup**](#quick-start)

<br/>

---

</div>

# Live Access

### Production Deployment

[Open AlignOps Live](https://alignops-five.vercel.app/)

---

## Product Demo

Watch the full AlignOps walkthrough here:

[![Watch the Demo](https://cdn.loom.com/sessions/thumbnails/605061dd2d28450781752f5d2b41a5e1-with-play.gif)](https://www.loom.com/share/605061dd2d28450781752f5d2b41a5e1)

### Demo Credentials
### Demo Credentials

Use password:

```text
AlignOps@123
```

| Role | Email |
|---|---|
| Admin | `aditi.rao@alignops.local` |
| Manager | `rohan.mehta@alignops.local` |
| Employee | `nisha.iyer@alignops.local` |

---

## The Problem

> **Enterprise execution doesn't fail because goals aren't written. It fails because no one can see when execution is breaking down until it's too late.**

At scale, organizations face a structural visibility problem:

*   **Goal sheets live in spreadsheets and disconnected tools**, meaning there is no execution control plane.
*   **Managers approve goals without risk context**, making approvals rubber stamps.
*   **Governance teams react to failures after quarterly reviews**, leaving no early warning system.
*   **Audit trails exist only in emails and meeting notes**, rendering accountability unenforceable.
*   **Escalation is ad-hoc and untracked**, making operational bottlenecks invisible.

AlignOps is the layer that closes this gap. It is a governance operating system, not a productivity app, built to make execution, risk, and accountability observable at every level of an organization.

---

## What AlignOps Delivers

<table>
<tr>
<td width="33%">

### Employee Goal Cockpit
The structured workspace where employees define, refine, and execute quarterly goals with full governance accountability.

*   **Progress rings** with live KPI confidence scoring
*   **SMART criteria enforcement** with per-criterion signals
*   **Quarterly timeline view** with phase tracking
*   **Achievement forecasting** and trajectory nudges
*   **Duplicate KPI detection** before submission
*   **Blocker capture** and resolution tracking

</td>
<td width="33%">

### Manager Operating Center
The risk-aware operating layer where managers govern approvals, spot execution problems early, and maintain team health.

*   **Prioritized approval queue** with risk scoring
*   **Execution risk radar** surfacing high-stakes goals
*   **Needs-attention queue** for delayed and at-risk sheets
*   **Performance distribution** across direct reports
*   **Escalation radar** with active escalation pressure
*   **Teams/email notification simulation** with card previews
*   **Manager effectiveness analytics**

</td>
<td width="33%">

### Admin Governance Control Tower
The policy and audit layer where HR governance teams run org-wide operations, enforce compliance, and export evidence.

*   **Org execution health** with department heatmaps
*   **Lifecycle matrix** across all active cycles
*   **Audit intelligence** with full event traceability
*   **Escalation tracking** and resolution management
*   **Unlock intervention center** with reason capture
*   **Operational metrics** and governance KPIs
*   **CSV export** for downstream compliance reporting

</td>
</tr>
</table>

---

## Governance Lifecycle

AlignOps models enterprise goal governance as a controlled state machine instead of a loose approval workflow.

Every transition is auditable, role-scoped, and policy-aware.

```mermaid
stateDiagram-v2
  [*] --> DRAFT : Employee creates goal sheet

  DRAFT --> DRAFT : Add/edit KPIs
  DRAFT --> SUBMITTED : Submit for review

  SUBMITTED --> APPROVED : Manager approves
  SUBMITTED --> RETURNED : Manager returns with feedback

  RETURNED --> DRAFT : Employee revises
  RETURNED --> SUBMITTED : Resubmission

  APPROVED --> CHECK_IN : Check-in cycle opens
  CHECK_IN --> LOCKED : Cycle closes

  LOCKED --> UNLOCKED : Admin intervention
  UNLOCKED --> DRAFT : Revision after unlock

```

This governance lifecycle becomes the backbone for:

* Audit intelligence
* Escalation tracking
* SLA monitoring
* Compliance exports
* Operational governance visibility

---

## Product Walkthrough

### Governance Control Tower

Enterprise-wide visibility into execution health, approvals, escalations, auditability, and governance operations.

![Governance Control Tower](./screenshots/02-governance-control-tower.png)

---

### Governance Audit Intelligence

Full governance traceability across approvals, escalations, interventions, and operational decisions.

![Governance Audit Intelligence](./screenshots/04-audit-log.png)

---

### Analytics & Governance Reporting

Operational analytics with reporting exports and organizational execution visibility.

![Analytics & Governance Reporting](./screenshots/05-analytics-reports.png)

---

### Manager Operating Center

Managers review approvals, identify execution risks, monitor SLA aging, and govern team performance.

![Manager Operating Center](./screenshots/06-manager-goal-control.png)

---

### Approval Workflow

Risk-aware approval flows with governance comments, escalation context, and audit persistence.

![Approval Workflow](./screenshots/07-approval-queue.png)

---

### Employee Goal Cockpit

Employees manage goals, KPI confidence, progress tracking, and execution readiness.

![Employee Goal Cockpit](./screenshots/10-employee-cockpit.png)

---

### Progress Journal

Structured quarterly check-ins and execution tracking across milestones.

![Progress Journal](./screenshots/11-progress-journal.png)

---

### Organizational Intelligence

Leadership visibility into execution bottlenecks, operational trends, and organizational health.

![Organizational Intelligence](./screenshots/12-team-insights.png)

---

## Architecture

AlignOps is a server-first modular monolith designed for enterprise delivery velocity and credible scalability. Every architectural decision prioritizes auditability, role separation, and operational clarity.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         ROLE PORTALS                                │
│    Employee Goal Cockpit  │  Manager Operating Center  │  Admin CT  │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │    Next.js 14 App Router   │
                         │  Server Components · RSC   │
                         │  Protected Route Groups    │
                         └─────────────┬─────────────┘
                                       │
              ┌────────────────────────▼────────────────────────┐
              │              IDENTITY BOUNDARY                   │
              │     Supabase Auth  ·  Role Claims  ·  Sessions  │
              │         Middleware Guards  ·  RBAC API Layer     │
              └────────────────────────┬────────────────────────┘
                                       │
        ┌──────────────────────────────▼──────────────────────────────┐
        │                   DOMAIN SERVICE LAYER                       │
        │  Goal State Machine  ·  Approval Engine  ·  Zod Validation  │
        │  Execution Health Engine  ·  Escalation Rules               │
        │  Notification Dispatcher  ·  Reporting & CSV Pipeline       │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
              ┌────────────────────────▼────────────────────────┐
              │           PERSISTENCE LAYER (Prisma ORM)         │
              │  PostgreSQL  ·  Audit Ledger  ·  Escalation Log  │
              │  Goal Sheets  ·  Org Units  ·  Role Assignments  │
              └─────────────────────────────────────────────────┘

```

```mermaid
flowchart TB
  subgraph Portals["Role Portals"]
    direction LR
    E["Employee\nGoal Cockpit"]
    M["Manager\nOperating Center"]
    A["Admin\nGovernance Control Tower"]
  end

  subgraph Frontend["Next.js 14 App Router"]
    direction TB
    RSC["Server Components (RSC)"]
    Routes["Protected Route Groups\n/(employee) /(manager) /(admin)"]
    APIRoutes["Route Handlers\n/api/v1/*"]
    Middleware["Middleware Layer\nSession resolution · RBAC gate · Role redirect"]
  end

  subgraph Identity["Identity Boundary"]
    direction LR
    SupaAuth["Supabase Auth\nJWT · SSO-ready"]
    RoleClaims["Role Claims\napp_metadata · Entra-ready"]
    SessionResolver["Session Resolver\nuser_id → AppRole mapping"]
  end

  subgraph Domain["Domain & Service Layer"]
    direction TB
    DAL["Data Access Layer (DAL)\nPrisma-backed service modules"]
    StateMachine["Goal Sheet State Machine\nDRAFT→SUBMITTED→APPROVED→LOCKED"]
    IntelEngine["Deterministic Execution Health Engine"]
    EscalationSvc["Escalation Service\nRule evaluation · Event creation"]
    NotifSvc["Notification Dispatcher\nTeams card preview · Email simulation"]
    ReportSvc["Reporting & CSV Pipeline\nOn-demand · Governance-grade"]
  end

  subgraph Intelligence["Execution Intelligence"]
    direction LR
    SMART["SMART Scorer"]
    KPIDupe["KPI Deduplication"]
    RiskEngine["Risk Engine"]
    WorkloadBalancer["Workload Balancer"]
    HealthScorer["Health Scorer"]
    ForecastEngine["Forecast Engine"]
  end

  subgraph Persistence["Persistence (Prisma ORM)"]
    direction TB
    PG["PostgreSQL / Supabase DB"]
    AuditLedger["Governance Audit Ledger\nImmutable event log"]
    EscLog["Escalation Events"]
    GoalSheets["Goal Sheets + KPIs\nVersioned · state-tracked"]
    OrgGraph["Org Unit Graph\nHierarchical · role-scoped"]
  end

  E & M & A --> RSC
  RSC --> Routes
  Routes --> Middleware
  APIRoutes --> Middleware
  Middleware --> SupaAuth
  SupaAuth --> RoleClaims --> SessionResolver
  SessionResolver --> DAL
  Middleware --> DAL
  DAL --> StateMachine
  DAL --> IntelEngine
  DAL --> EscalationSvc
  DAL --> NotifSvc
  DAL --> ReportSvc
  IntelEngine --> SMART & KPIDupe & RiskEngine & WorkloadBalancer & HealthScorer & ForecastEngine
  DAL --> PG
  PG --> AuditLedger & EscLog & GoalSheets & OrgGraph

  style Portals fill:#1e293b,stroke:#334155,color:#f8fafc
  style Frontend fill:#0f172a,stroke:#1d4ed8,color:#bfdbfe
  style Identity fill:#0f172a,stroke:#7c3aed,color:#e9d5ff
  style Domain fill:#0f172a,stroke:#0891b2,color:#bae6fd
  style Intelligence fill:#0f172a,stroke:#059669,color:#a7f3d0
  style Persistence fill:#0f172a,stroke:#d97706,color:#fde68a

```

---

## Feature Matrix

| Capability | Employee | Manager | Admin |
| --- | --- | --- | --- |
| **Goal Sheet Creation & Editing** | Full | - | - |
| **SMART Scoring & KPI Intelligence** | Live feedback | Risk context | Org-wide |
| **Goal Submission & Workflow** | Submit/revise | Approve/return | Override |
| **Quarterly Check-ins & Progress** | Self-update | Review desk | Tracking |
| **Shared Goal Participation** | Linked | Cross-team | Definition |
| **Execution Risk Visibility** | Own sheet | Full team | Org-wide |
| **Notification Center** | Receive | Receive/trigger | Full access |
| **Escalation System** | - | Radar view | Full management |
| **Governance Audit Trail** | - | Partial | Full ledger |
| **Unlock Intervention** | - | - | With audit |
| **Department Heatmaps** | - | - | Full |
| **CSV Export** | - | - | Governance-grade |
| **Org Analytics & Reporting** | - | Team-scope | Org-wide |
| **Manager Effectiveness Analytics** | - | Self-view | All managers |
| **Identity / RBAC** | Role-scoped | Role-scoped | Full control |

---

## Intelligence Layer

AlignOps ships a deterministic execution health engine. There are no external AI API costs, no hallucination risk, and no rate limiting. Every signal is rule-based, reproducible, and auditable.

| Engine | What It Detects | Where It Surfaces |
| --- | --- | --- |
| **SMART Scorer** | Per-criterion quality signals across Specific, Measurable, Achievable, Relevant, Time-bound axes | Employee cockpit, Manager approval view |
| **KPI Deduplication** | Similar KPI titles across an employee's active goal sheets | Employee cockpit warning, Manager risk view |
| **Risk Scorer** | Unrealistic target delta, vague measurement language, weight distribution imbalance | Manager risk radar, Admin heatmap |
| **Workload Balancer** | Goal count vs organizational baseline, total weight sum validation | Employee cockpit, Manager queue |
| **Health Scorer** | Composite of latest progress, check-in recency, and achievement trajectory (0-100) | Manager team view, Admin heatmap |
| **Forecast Engine** | P(achieve) at cycle-end based on current progress rate and trajectory | Employee cockpit, Admin lifecycle matrix |
| **Governance Heuristics** | Approval SLA breach, submission deadline risk, check-in gap detection | Escalation engine, Admin escalation tracker |

---

## Architecture Principles

* **Separation of Concerns:** Each business module (`goals`, `checkins`, `escalations`, `audit`, `reporting`, `org`, `shared-goals`) owns its own schema-facing services. Cross-module coordination is explicit, never implicit.
* **DAL Boundary:** All database access goes through a typed Data Access Layer. No raw Prisma calls in route handlers or UI. Every persistence operation is instrumentable, testable, and auditable.
* **RBAC at Every Layer:** Role enforcement happens at three independent checkpoints. Next.js middleware handles the session-level, API route handlers cover the request-level, and DAL service calls manage the data-level. Bypassing one layer does not bypass the system.
* **Immutable Audit Ledger:** All governance-relevant events, such as approvals, returns, unlocks, and escalations, are written to an append-only audit log table. The application never deletes audit records.
* **Server-First Rendering:** React Server Components serve the majority of UI. Client components are used only where interactivity demands it. This reduces client JavaScript, improves load performance, and keeps sensitive data server-side.
* **Extensibility by Default:** Role claim normalization is Entra-ready. The notification model is a structured queue with provider-agnostic dispatch. Real Teams or email integration requires only a provider implementation, not an architecture change.

---

## Demo Credentials

> Use password `AlignOps@123` for all demo accounts.

| Role | Email | Story Arc |
| --- | --- | --- |
| **Admin** | `aditi.rao@alignops.local` | HR governance owner. Sees full org execution health, runs audit intelligence, manages unlock interventions, exports compliance reports. |
| **Manager (Overloaded)** | `rohan.mehta@alignops.local` | Product manager under pressure. High-risk approval queue, active escalations, overloaded team, Teams notification preview in action. |
| **Manager (Healthy)** | `manav.shah@alignops.local` | Sales manager with a healthy operating rhythm. Approved sheets, lower risk signals, good team distribution. |
| **Employee (Thriving)** | `nisha.iyer@alignops.local` | Strong progress, high KPI confidence, clean SMART scores, forecast shows on-track to exceed. |
| **Employee (At-Risk)** | `aman.gupta@alignops.local` | Duplicate KPI signals, unrealistic target warnings, at-risk forecast. Showcases the intelligence engine working in real-time. |
| **Employee (Escalated)** | `kabir.ali@alignops.local` | Delayed draft, active escalation event, visible in manager and admin views. |

### Demo Flow

* **Act 1, Employee Execution:** Log in as `nisha.iyer` to show the Goal Cockpit. Highlight progress rings, KPI confidence, forecast, and the quarterly timeline. Show the SMART scoring panel and how each criterion is evaluated in real-time. Next, log in as `aman.gupta` to show duplicate KPI warnings, unrealistic target signals, and an at-risk forecast. This establishes that the platform catches quality problems before they become governance problems.
* **Act 2, Manager Governance:** Log in as `rohan.mehta` and open the Manager Operating Center. Show the prioritized approval queue, displaying risk-ranked submissions with execution health scores. Open a high-risk goal sheet to demonstrate the execution risk radar live on the approval screen. Return the risky goal with a comment, which triggers a notification to the employee. Approve a clean submission to show the audit event being written. Show the escalation radar to highlight `kabir.ali`'s active escalation. Show the Teams notification card preview. This establishes that managers make risk-informed decisions, not blind approvals.
* **Act 3, Admin Governance:** Log in as `aditi.rao` and open the Admin Governance Control Tower. Show the org execution health score and department heatmap. Open the Lifecycle Matrix to display all active goal sheets by state. Open Audit Intelligence to view approval events, return events, and escalation entries. Open the Escalation Tracker to show `kabir.ali`'s escalation thread end-to-end. Open the Unlock Intervention Center to demonstrate the auditable unlock/relock flow with reason capture. Open Reports, export a CSV, and show thrust-area analysis, UoM distribution, and QoQ trends. This establishes that governance is observable, auditable, and exportable.

---

## BRD Coverage Matrix

| Requirement | Status | Implementation |
| --- | --- | --- |
| Goal creation and SMART validation | Complete | Employee cockpit, Zod validation, SMART scorer, refinement modal |
| Manager approval workflow | Complete | Submitted queue, approve/return, comments, audit trail |
| Shared goals | Complete | Shared goal definitions, primary owner mapping, cross-team links |
| Quarterly check-ins and progress | Complete | Check-in windows, achievement updates, progress scoring |
| Role-based portals (Employee/Manager/Admin) | Complete | Three distinct operating layers with full RBAC |
| RBAC and protected routes | Complete | Middleware, server-side guards, API RBAC |
| Governance reporting | Complete | Admin dashboard, reports, CSV export, heatmaps |
| Audit trail | Complete | Immutable audit log, approval events, unlock capture |
| Escalation system | Complete | Escalation rules, events, manager radar, admin tracker |
| Deterministic execution intelligence | Complete | SMART, KPI dedup, risk, workload, health, forecast |
| Notification system | Simulated | Notification center with Teams/email card previews |
| Entra/SSO readiness | Placeholder | Role claim normalization, auth adapter, settings documentation |

Full BRD coverage map is available at `docs/brd-coverage.md`.

---

## Quick Start

```bash
# 1. Clone and install
git clone [https://github.com/your-org/alignops.git](https://github.com/your-org/alignops.git)
cd alignops
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in Supabase project credentials

# 3. Initialize database
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Start development server
npm run dev
# → http://localhost:3000

```

### Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SKIP_ENV_VALIDATION="false"

```

### Verify Build Integrity

```bash
SKIP_ENV_VALIDATION=true npm run typecheck
SKIP_ENV_VALIDATION=true npm run lint
SKIP_ENV_VALIDATION=true npm run build

```

All three must pass before demo deployment.

---

## Deployment

### Supabase (Database + Auth)

1. Create a new Supabase project.
2. Copy connection strings from Settings to Database.
3. Create Auth users for the 6 demo emails with password `AlignOps@123`.
4. Run migrations and seed the database using `npm run db:deploy && npm run db:seed`.

### Vercel (Application)

1. Import repository into Vercel.
2. Add all environment variables under Settings to Environment Variables.
3. Deploy using the build command `npm run build`.
4. Verify the deployment URL resolves and redirects to login.

### Post-Deployment Checklist

* [ ] All 6 demo credentials resolve to correct role dashboards.
* [ ] Seeded governance data is visible across all three portals.
* [ ] CSV export produces output from Admin reporting.
* [ ] Notification center shows seeded events for manager accounts.
* [ ] Audit log shows seeded governance events in admin view.

Full deployment playbook is available at `docs/deployment.md`.

---

## Tech Stack

| Technology | Why |
| --- | --- |
| **Next.js 14 App Router** | Server-first rendering eliminates data-fetching waterfalls. Protected route groups enforce RBAC at the routing layer. RSC keeps sensitive business logic server-side. |
| **TypeScript (strict)** | Enterprise codebases require type safety. Strict mode catches data contract violations at compile time. DAL type signatures make schema changes visible everywhere immediately. |
| **Prisma ORM** | Type-safe database access with schema-as-code. Migration history lives in the repository. Enums and relations are enforced at the ORM layer, not just in SQL. |
| **PostgreSQL via Supabase** | Relational integrity for a governance system is non-negotiable. Foreign keys, audit constraints, and hierarchical org structures require relational semantics. Supabase adds managed auth and connection pooling. |
| **Supabase Auth** | JWT-based sessions with metadata for role claims. Entra SSO integration requires only a provider configuration change, requiring no auth architecture rewrite. |
| **Tailwind CSS** | Utility-first CSS eliminates stylesheet bloat at scale. Design consistency comes from a constrained token system. Dark and light theming is trivial with CSS variables. |
| **Zod** | Runtime validation at API boundaries with TypeScript inference. Every form submission and API payload is validated before it reaches the DAL. |

---

## Scalability Roadmap

AlignOps is a modular monolith by design. The architecture supports the following production evolution without structural rewrites:

| Capability | Path |
| --- | --- |
| **Entra SSO** | Supabase Auth provider configuration plus the existing role claim normalization layer requires no auth architecture change. |
| **Real Teams/Email Notifications** | Implement provider interface in notification dispatcher. Schema and queue are already in place. |
| **Real-time Dashboard Updates** | Supabase Realtime subscriptions on goal sheet and audit tables. |
| **Background Escalation Jobs** | Connect escalation rule evaluation to Vercel Cron. Evaluation logic already exists. |
| **Multi-cycle Historical Analytics** | Schema supports multiple cycles. Reporting layer adds cycle-comparison queries. |
| **Observability** | Structured logging middleware at DAL boundary. Audit ledger is already the event source. |
| **Module Extraction** | Each `src/modules/*` is a bounded context and is extractable to a separate service if org scale demands it. |

---

## Repository Structure

```text
alignops/
├── README.md
├── package.json
├── next.config.js
├── tsconfig.json
├── middleware.ts               # Session resolution + RBAC routing
├── .env.example
│
├── screenshots/                # Walkthrough and demo images
│   ├── 02-governance-control-tower.png
│   ├── 04-audit-log.png
│   ├── 05-analytics-reports.png
│   ├── 06-manager-goal-control.png
│   ├── 07-approval-queue.png
│   ├── 10-employee-cockpit.png
│   ├── 11-progress-journal.png
│   └── 12-team-insights.png
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/
│   │   │   ├── employee/       # Employee Goal Cockpit
│   │   │   ├── manager/        # Manager Operating Center
│   │   │   └── admin/          # Admin Governance Control Tower
│   │   └── api/                # API Route Handlers
│   │
│   ├── modules/                # Domain modules (bounded contexts)
│   │   ├── goals/              # Goal sheet state machine + DAL
│   │   ├── checkins/           # Check-in logic + scoring
│   │   ├── escalations/        # Escalation rules + events
│   │   ├── audit/              # Immutable audit ledger
│   │   ├── reporting/          # Analytics + CSV pipeline
│   │   ├── org/                # Org unit hierarchy
│   │   └── shared-goals/       # Cross-team shared goal logic
│   │
│   ├── components/
│   │   ├── app/                # Domain UI components
│   │   └── ui/                 # Base UI primitives (shadcn/ui)
│   │
│   ├── lib/                    # Utilities, Prisma client, Supabase client
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Navigation, environment config
│
├── prisma/
│   ├── schema.prisma           # Full data model
│   └── seed.ts                 # Enterprise demo data
│
├── docs/
│   ├── architecture.mmd        # Mermaid architecture diagram
│   ├── brd-coverage.md         # Hackathon BRD mapping
│   ├── demo-walkthrough.md     # Judging walkthrough guide
│   └── deployment.md           # Deployment playbook
│
└── public/
```

---

**AlignOps** · AtomQuest Hackathon 1.0

The governance operating system for enterprise execution.

When goals are created without visibility, governance becomes guesswork. When approvals happen without risk context, accountability becomes theater. When escalations are untracked, execution breaks down invisibly.

AlignOps closes the gap.
