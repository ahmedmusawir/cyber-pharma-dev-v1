# Cyber Pharma

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20RLS-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4%20%2B%20shadcn-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/Jest-118%20passed%20%2F%2025%20suites-success?style=flat-square&logo=jest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-e2e-2EAD33?style=flat-square&logo=playwright&logoColor=white)

A pharmacy reimbursement application — it surfaces what a pharmacy is **owed**
(PBM commercial + federal underpayments on claims) and gives the owner tools to
manage stores, staff, billing, and an audit trail.

Pharmacy underpayment data is scattered by design. PBM remittances land in one
system, federal claim rates in another, and reconciling the two — what a
pharmacy was actually paid versus what it should have been paid — is nobody's
job. Owners know they are losing money on claims and cannot say how much, on
which scripts, or from which PBM. Cyber Pharma puts that number on one screen
and makes it filterable down to the individual script. It was built through my
App Factory pipeline: a spec-first workflow where the data contract and screen
specs are written and locked before the first component is authored.

**Status:** Ongoing project — Phase 2 complete. Per App Factory doctrine this is
built frontend-first: what ships here is the finished **FFM (Frontend-First
Module)**, put in front of the client to finalize features and functionality
before a line of backend is written. Both surfaces (OwedBook + Admin Portal Demo
Shell) are built to visual fidelity and are mock-functional end to end. Auth is
real (Supabase); domain data is mock through a service layer that is the
**single swap point** for the real backend (Phase 7).

The completed product is a **HIPAA-compliant application on a Supabase backend**.
HIPAA hardening — BAA, security headers, MFA, session policy, and a
regenerate-at-source data migration — is the Phase 8 deliverable. The FFM you see
here carries no PHI: every claim, script number, and NPI in it is synthetic. See
[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md).

---

## The Two Surfaces

A signed-in user lands on one of two surfaces based on their role.

### OwedBook — the reimbursement ledger

The member surface, at `/owedbook`. Four KPI tiles headline the money —
Commercial Underpaid, Commercial Scripts, Updated Difference, and Owed — over a
paginated claims table that runs 25 rows to a page. Four tabs re-cut the same
ledger for a different question: **Commercial Dollars** (what the PBM paid
versus what was expected), **Updated Payments** (what changed after a
recovery attempt), **Federal Dollars** (the federal side of the same claim), and
**Summary**. A filter rail narrows by date range, claim status — recovered,
emailed PBM, pending, underpaid, new — and one or more PBMs, and the table
collapses to stacked cards on mobile. Upload Data and Get Fresh Data are wired
and UI-functional, but they are mocks: they report success without parsing or
storing anything.

### Admin Portal — stores, staff, billing, audit

The admin surface, at `/admin-portal`, gated at the layout by role. **My Stores**
lists every pharmacy the owner holds with its operational and subscription
status, and flags the ones needing attention. **Store Detail** opens a store's
member roster — active, invite-pending, and suspended staff — where members can
be invited, re-invited, suspended, unsuspended, or sent a recovery email; the
invite form takes an email and a job title, never a password. **Billing** and
**Settings** show per-store plan, charge dates, and pharmacy details, and
**Audit log** records all seven administrative action types with a done/failed
result. Every mutation is real against an in-memory store and reflects
immediately in the UI — and a page refresh resets it to seed, by design. The
"Demo · mock data" pill in the header says so on every screen.

---

## Screenshots — OwedBook & Admin

![OwedBook — dark theme, Updated Payments tab](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785123057/image_6_ruqybg.png)

**OwedBook, dark theme — Updated Payments tab.** The four KPI tiles sit above the
ledger, and the tab has swapped the column set to Original Paid / New Paid /
Updated Difference so a recovery attempt can be read as a delta, green for
recovered dollars and red for the ones that moved the wrong way. The filter rail
carries Upload Data, a from/to date range, the status filter, and the PBM
multi-select.

![OwedBook — light theme, same view](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785123057/image_5_ptxpku.png)

**The same view in light theme.** Both themes are first-class and driven by HSL
design tokens rather than a second stylesheet — the navbar keeps its identical
brand red in both, and every surface, border, and chart color re-derives from
the token set.

![Admin Portal — My Stores](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785123057/admin_stores_slate_yuo1na.png)

**Admin Portal — My Stores.** Each store card carries its NCPDP number, member
count, operational status, and subscription state, with a needs-attention count
in the subheader and a past-due subscription called out on the card itself. The
sidebar holds the other three destinations — Billing, Settings, and Audit log —
and the amber "Demo · mock data" pill marks the whole surface as running on
seeded state.

| | |
|---|---|
| ![OwedBook on mobile, dark theme](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785123056/image_1_titigj.png) | ![OwedBook on mobile, light theme](https://res.cloudinary.com/dyb0qa58h/image/upload/v1785123056/image_2_y11qey.png) |
| **Mobile — Commercial Dollars.** The KPI tiles reflow to a 2×2 grid and the data table becomes stacked cards, one per claim, led by the owed amount. The filter rail moves behind a Filters drawer so the ledger keeps the full width. | **Mobile — Updated Payments.** The same responsive treatment on the recovery tab: each card is headed by its script number with the original and new payment underneath, so the updated difference stays legible without a horizontal scroll. |

---

## Quick Start

```bash
npm install
cp .env.example .env.local      # then fill in the Supabase values
npm run dev                     # http://localhost:3000
```

> **`.env.local` is required before `npm run build`.** The `/access-denied` page
> is prerendered at build time and constructs a Supabase client, so a build
> against an unpopulated env fails with `Your project's URL and API key are
> required`. Fill the file first.

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
| `npm test`                  | Jest suite (118 tests / 25 suites)    |
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
  gates, and the shared authed shell.

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

---

Built by **Ahmed Musawir** — Software Architect & AI Engineer — through the App
Factory, an AI-augmented delivery methodology → [github.com/ahmedmusawir](https://github.com/ahmedmusawir)
