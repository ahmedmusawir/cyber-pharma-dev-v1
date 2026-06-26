# Cyber Pharma

A pharmacy reimbursement application — it surfaces what a pharmacy is **owed**
(PBM commercial + federal underpayments on claims) and gives the owner tools to
manage stores, staff, billing, and an audit trail.

**Status:** Phase 2 complete. Both surfaces (OwedBook + Admin Portal Demo Shell)
are built to visual fidelity and are mock-functional end to end. Auth is real
(Supabase); domain data is mock through a service layer that is the single
swap point for the eventual backend (Phase 7). See
[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md).

---

## Quick Start

```bash
npm install
cp ".env copy.example" .env.local   # then fill in the Supabase values
npm run dev                         # http://localhost:3000
```

Auth and roles need a provisioned Supabase project — run
[docs/setup.sql](docs/setup.sql) once against a fresh database (or
[docs/migration_add_profiles.sql](docs/migration_add_profiles.sql) on an existing
one). See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md).

### Scripts

| Command                     | What it does                          |
| --------------------------- | ------------------------------------- |
| `npm run dev`               | Start the dev server                  |
| `npm run build`             | Production build                      |
| `npm start`                 | Serve the production build            |
| `npm run lint`              | ESLint (flat config)                  |
| `npm test`                  | Jest suite (117 tests / 25 suites)    |
| `npm run test:integration`  | Jest — API/integration tests only     |
| `npm run test:e2e`          | Playwright end-to-end                 |
| `npm run test:e2e:ui`       | Playwright in UI mode                 |

---

## Documentation Index

All project documentation lives in [`/docs`](docs/). Start with the Overview,
then the App docs for what we built, then the Foundation docs for the underlying
RBAC starter kit.

### Project

- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** — what Cyber Pharma is, the
  two surfaces, current state (what's real vs mock), tech stack. **Start here.**

### App (what we built)

- **[APP_ARCHITECTURE.md](docs/APP_ARCHITECTURE.md)** — the frontend-first
  component → service → store → mock flow and the Phase-7 backend swap point.
- **[ROUTES_AND_SURFACES.md](docs/ROUTES_AND_SURFACES.md)** — the route map, role
  gates, the shared authed shell, and the `/moose-portal` escape hatch.

### Foundation (RBAC starter kit)

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — the receptionist (Next.js) vs
  vault-guard (Postgres + RLS) security model.
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** — Supabase auth, session
  lifecycle, the `proxy.ts` refresh loop, env vars.
- **[AUTHORIZATION.md](docs/AUTHORIZATION.md)** — the `user_roles` table,
  `AppRole`, `protectPage()`, layout-level role gating.
- **[DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** — the runnable SQL blueprint
  (roles, profiles, trigger, RLS pattern). Companion files:
  [setup.sql](docs/setup.sql), [migration_add_profiles.sql](docs/migration_add_profiles.sql).

### Testing

- **[TESTING.md](docs/TESTING.md)** — the Jest suite: what's covered and why.
- **[MANUAL_TESTING.md](docs/MANUAL_TESTING.md)** — the manual smoke walk for
  OwedBook + the Admin Portal (both themes × 375 / tablet / desktop).

### History

- **[docs/change_logs/](docs/change_logs/)** — dated starter-kit changelogs (v0.2–v0.4).
- **`phase2.md`** (repo root) — master Phase-2 reference + Phase-7 carry-forward.
- **`RECOVERY.md`** (repo root) — current recovery state.
- **`agent_docs/SESSIONS/`** — dated build session logs.

---

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind 3.4 + shadcn
· Zustand · Supabase (auth + Postgres + RLS) · Jest + Playwright.

## Built From

Generated from [ahmedmusawir/nextjs16-starter-supabase-role-access-2026-v2](https://github.com/ahmedmusawir/nextjs16-starter-supabase-role-access-2026-v2) on 2026-05-06.
