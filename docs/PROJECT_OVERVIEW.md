# Project Overview — Cyber Pharma

> **What this is, what's built, and what's still mock.** Start here, then follow
> the [README documentation index](../README.md) into the rest of `/docs`.

---

## What Cyber Pharma Is

Cyber Pharma is a pharmacy reimbursement application. Its core job is to show a
pharmacy what it is **owed** — the gap between what PBMs (pharmacy benefit
managers) actually paid on claims versus what they should have paid, across
commercial and federal dollars — and to give the pharmacy owner the tools to
manage their stores, staff, billing, and an audit trail of administrative
actions.

The app is built on the Stark **database-authoritative RBAC starter kit**
(Supabase auth + Postgres role table + RLS). Cyber Pharma is what we built *on
top of* that foundation. The `/docs` foundation docs (ARCHITECTURE,
AUTHENTICATION, AUTHORIZATION, DATABASE_SETUP) describe the bones; this document
and [APP_ARCHITECTURE](./APP_ARCHITECTURE.md) describe the product.

---

## The Two Authed Surfaces

A signed-in user lands on one of two surfaces based on their role:

- **Member** (`role = member`) → **OwedBook** at `/owedbook` — the reimbursement
  ledger. KPI tiles, a filterable/paginated claims table across Commercial /
  Updated / Federal / Summary tabs, plus Upload and Get-Fresh actions. Members
  also have `/profile`.
- **Admin** (`role = admin`) → **Admin Portal** at `/admin-portal` — store and
  staff management. My Stores, Store Detail, Invite Member, Billing, Settings,
  and an Audit log. This is the **Admin Portal Demo Shell** — fully interactive
  on in-memory mock state (see "Current State" below).

There is also `/moose-portal`, an **env-gated operator escape hatch** with real
user CRUD, isolated from the demo shell. See
[ROUTES_AND_SURFACES](./ROUTES_AND_SURFACES.md) for the full map and role gates.

> **Note on `superadmin`:** the `superadmin` role still exists in the Postgres
> `app_role` enum and the `AppRole` type (and DATABASE_SETUP still shows how to
> promote one), but Cyber Pharma ships **no superadmin portal or UI**. The
> superadmin route group and the old admin-provisioning route were removed during
> Phase 2. The only shipped authed surfaces are member and admin.

---

## Current State (as of 2026-06-26)

**Phase 2 is complete.** Both surfaces are built to visual fidelity and are
mock-functional end to end:

- **Auth is real.** Supabase login / signup / logout, role-gated layouts, and
  the session-refresh proxy all run against a real Supabase project.
- **Domain data is mock.** OwedBook reads from fixtures; the Admin Portal reads
  and mutates an in-memory Zustand store seeded from mock data. Mutations (invite
  a member, suspend, add a store, save settings) work and reflect in the UI, but
  a **page refresh resets the admin demo state to seed** — by design. Nothing is
  persisted to a database yet.
- **No real backend for domain data.** Upload / Get-Fresh on OwedBook are
  UI-functional mocks (they fake success; they do not read, parse, or store
  anything). The whole point of the architecture is that the **service layer is
  the single swap point** for the eventual real backend — that swap is **Phase 7**.

See [APP_ARCHITECTURE](./APP_ARCHITECTURE.md) for how the mock-to-backend swap is
designed to work.

---

## Tech Stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16 (App Router only)                        |
| Language       | TypeScript (strict, no `any`)                       |
| UI             | React 19, Tailwind 3.4 (HSL tokens), shadcn primitives |
| State          | Zustand (cross-component), `useState` (local)       |
| Auth           | Supabase Auth (real)                                |
| Database       | Supabase / Postgres + RLS (auth + roles only so far)|
| Domain data    | Mock fixtures + in-memory store (Phase-7 swap)      |
| Tests          | Jest (117 tests / 25 suites), Playwright (e2e scaffold) |
| Lint           | ESLint 9 flat config (`eslint.config.mjs`)          |

---

## Where the Deep History Lives

`/docs` is the durable, developer-facing documentation. The blow-by-blow build
record lives elsewhere and is **not** duplicated here:

- **`phase2.md`** (repo root) — master Phase-2 reference + Phase-7 carry-forward flags.
- **`RECOVERY.md`** (repo root) — current recovery state / last action / next step.
- **`agent_docs/SESSIONS/`** — dated session logs (the build diary).
- **`agent_docs/CURRENT_APP/`** — the Frontend-First Module (FFM) specs the build ran against.
