# _project/CLAUDE.md — Cyber Pharma v1 / Phase 1 / Project Spine (v2)

> **Project-specific direction.** Read this AFTER the module root `CLAUDE.md`. This file is the authority on scope, forbidden zones, tech stack, and operating rules SPECIFIC TO Cyber Pharma v1 Phase 1.

---

## Project Identity

**Project:** Cyber Pharma v1
**Phase:** 1 of 8 — Foundation Skeleton
**Repos in scope:** ONE (`cyber-pharma-v1` — main customer-facing app)
**Out of FFM scope:** Superadmin app moves to its own repo entirely (separate project: Super Admin Portal)
**Source:** Audited Next.js starter kit clone (`nextjs16-supabase-stripe-subscription-2026-v1`). Audit complete, zero vulnerabilities. Clean dep DNA inherited.
**Mission of this phase:** Bring the main app from "audited starter kit clone" to "branded foundation with the v1 design language installed." Install the **real** locked v1 design tokens so Phase 2 builds on a finalized foundation, not throwaway placeholders.

---

## Hero Outcome (Phase 1 Success)

> **A reviewer runs `npm run dev` locally, clicks through every route, sees the locked v1 brand language everywhere, confirms role gates hold, and trusts the foundation is ready for Phase 2 OwedBook work.**

The proof is in the local click-through. No staging deploys this phase — DevOps department handles that in a later phase.

---

## Forbidden Zones (Hard Stops — Phase 1 Specific)

### Deployment Work (Out of Scope — Separate Department Owns This)

A separate DevOps department owns deployment infrastructure for Cyber Pharma v1. This FFM does NOT:

- ❌ Run `gcloud` commands of any kind
- ❌ Configure Cloud Run services
- ❌ Set up CNAME / DNS records
- ❌ Author `Dockerfile` or `cloudbuild.yaml` modifications
- ❌ Deploy to any staging or production URL
- ❌ Configure environment-specific secrets beyond local `.env.local`

If a feature seems to require deploy work, flag it: **"This requires deploy work. Out of scope for this FFM. The DevOps department handles this in a later phase."**

### Superadmin App (Out of Scope — Moving to Its Own Repo)

Superadmin functionality is being moved to a separate project (Super Admin Portal). In this Phase 1 FFM, the inherited starter kit superadmin code gets DELETED, not preserved:

- ❌ DELETE `src/app/(superadmin)/` route group entirely (whole folder, all files)
- ❌ DELETE `src/app/api/superadmin/` route handlers (all of them)
- ❌ DELETE any inherited superadmin user management UI components
- ❌ DELETE the `superadmin-add-user` route specifically (also a TONY_DEMO vulnerability — gone for good)
- ❌ DO NOT include `'superadmin'` in `protectPage()` allowedRoles calls — use `['admin']` or `['member', 'admin']` only

The `app_role` enum in the `user_roles` table may keep the `superadmin` value (it's just data, no harm). UI and routes never reference it in this app.

### Backend Schema Work (Out of Scope for Phase 1 — Phase 3's Job)

Phase 1 uses ONLY the inherited starter kit tables: `auth.users` (Supabase managed) and `user_roles` (starter kit ships this). The 13 Frank-domain tables from MASTER_APP_BRIEF §5 — `businesses`, `user_businesses`, `user_data`, `subscriptions`, `apa_memberships`, `aac_reference`, `wac_reference`, `ful_reference`, `pbm_info`, `audit_logs`, `report_files`, `reference_dataset_versions`, `pending_registrations` — DO NOT exist in Phase 1. DO NOT create them. They land in Phase 3.

### Real Feature Work (Out of Scope for Phase 1 — Phase 2+)

Phase 1 ships:
- ✅ One new screen: `/` public landing page (per designer's `_design/landing-page-desktop.png`)
- ✅ Placeholder pages for `/admin-portal` and `/members-portal` saying "Coming in Phase 2"
- ✅ Rebrand of inherited auth screens (token application only, no logic changes)

Phase 1 does NOT ship:
- ❌ OwedBook screens (Phase 2 — `_design/phase2-reference/` artifacts are direction-only)
- ❌ Filter sidebar with PBM dropdown (Phase 2)
- ❌ KPI tiles (Phase 2)
- ❌ Tabs UI / DataTable (Phase 2 — needs KIPs first)
- ❌ Imports page (Phase 5)
- ❌ Reports viewer (Phase 6)
- ❌ Stripe (Phase 7)

**Critical:** the `_design/phase2-reference/` folder contains gorgeous OwedBook artifacts. They are VISUAL DIRECTION FOR PHASE 2, not Phase 1 build targets. If Claudy is tempted to build OwedBook from them, STOP.

### Roles In `user_metadata` (Security Regression)

Roles MUST be read from the `user_roles` table. The starter kit ships this pattern. DO NOT add role fields to `user_metadata`. DO NOT write code that checks `auth.user.user_metadata.is_*`. TONY_DEMO had this pattern and it was a vulnerability — Phase 1 must NOT regress.

### Numbered Tailwind Colors In Components (Theme Killer)

Per designer's locked rules: components read **semantic, token-backed utilities only** — `bg-primary`, `text-destructive`, `bg-card`, `border-border`. **NEVER** Tailwind's numbered palette (`bg-slate-800`, `text-red-600`, `dark:bg-zinc-900`). Numbered classes do not respond to the token file and silently break theming.

🔒 **Kit reconciliation task:** the starter kit currently hardcodes some colors (`dark:bg-slate-800`, role labels `text-red-600`, etc.). Phase 1 migrates those onto tokens. This is foundational — it's what makes the "one-click theme swap" actually work.

### Generic Hard Rules (Inherited from Stark Global)

- ❌ No `dangerouslySetInnerHTML` — use `html-react-parser` for HTML, `react-markdown` for markdown
- ❌ No `any` types — use `unknown` with narrowing
- ❌ No Pages Router patterns — App Router only
- ❌ No `dangerouslyAllowBrowser` on any client lib
- ❌ No skipping Plan Mode
- ❌ No silent fixes
- ❌ Saira via `next/font/google`, NOT a CDN `<link>` (performance + no FOUT)

---

## Tech Stack (Phase 1)

Verified against the starter kit clone:

### Framework
- **Next.js 16** (App Router only — no Pages Router)
- **React 19**
- **TypeScript 5** (strict mode on)
- Node 20+ runtime

### Auth & DB
- **Supabase** via `@supabase/ssr` and `@supabase/supabase-js`
- Three-client pattern verified:
  - `/src/utils/supabase/client.ts` — browser (anon key)
  - `/src/utils/supabase/server.ts` — SSR (cookie-bound, anon key)
  - `/src/utils/supabase/admin.ts` — service-role (server-only writes)
- `/src/utils/supabase/middleware.ts` — session refresh middleware

### UI (LOCKED — per designer's TOKEN_FILE.md)
- **Tailwind CSS 3.4.1** (confirmed via `grep tailwindcss package.json`)
- **shadcn/ui** (primitives only — themed by tokens)
- **Token mechanic:** CSS variables in `globals.css` (`:root` + `.dark`), HSL no-wrapper, mapped via `tailwind.config.ts`
- **Brand font:** Saira via `next/font/google`
- **Radius:** `0px` (Metro flat)
- **Themes shipped Phase 1:** Mist (light default) + Slate (dark default)
- **lucide-react** icons
- **html-react-parser** for HTML rendering

### State
- **Zustand** for client state
- **URL search params** drive shareable filtered views (per Cyberize state-management doctrine)

### Forms & Validation
- **react-hook-form** + **@hookform/resolvers**
- **Zod** for schema validation

### Testing
- **Vitest** for unit + integration tests
- **Playwright** for E2E (via `webapp-testing` skill from Anthropic)

### Build (No Deploy)
- `npm run build` succeeds clean (verification)
- `npm run dev` runs locally (verification)
- Deploy work: separate department, later phase

---

## What Phase 1 Ships

### New work
- 🔒 Install designer's locked `globals.css` (Mist + Slate themes)
- 🔒 Wire `tailwind.config.ts` to map tokens (`hsl(var(--primary))` etc.)
- 🔒 Wire Saira via `next/font/google`
- 🔒 Apply brand assets (logo files in `/public/brand/`)
- 🔒 Kit reconciliation: migrate hardcoded colors onto semantic tokens
- 🔒 **Build `/` — public marketing landing page** (THE new screen — per `_design/landing-page-desktop.png`)
- 🔒 Build `/admin-portal` placeholder ("Coming in Phase 2")
- 🔒 Build `/members-portal` placeholder ("Coming in Phase 2")
- 🔒 Build `/access-denied` page
- 🔒 Error boundaries on `(public)`, `(auth)`, `(members)`, `(admin)`
- 🔒 Fail-closed boot check (env vars must exist or app refuses to start)

### Rebrand only (no logic changes)
- 🔒 `/login` — apply tokens, swap logo
- 🔒 `/register` — apply tokens, swap logo
- 🔒 `/forgot-password` — apply tokens, swap logo
- 🔒 `/not-found` — apply tokens

### Delete entirely
- ❌ `src/app/(superadmin)/` route group
- ❌ `src/app/api/superadmin/` API routes
- ❌ Any superadmin-add-user references
- ❌ Inherited superadmin user management UI

### Verification (local only)
- 🔒 `npm run build` clean
- 🔒 `npm run dev` runs
- 🔒 Smoke walkthrough: register, login, logout, role-gate enforcement
- 🔒 Theme toggle works (Mist ↔ Slate)
- 🔒 Style tile renders correctly in browser
- 🔒 Env var fail-closed proven
- 🔒 Security greps all zero

---

## Lessons From Previous FFM Authoring

- **Designer outputs are load-bearing** — don't redo what designer already locked. Apply designer's tokens verbatim, don't interpret.
- **Phase scope discipline is the most important property** — if a gorgeous artifact is for Phase 2, it stays Phase 2 even if it would be easy to build now.
- **Service layer discipline from day one** — even Phase 1's minimal flows go through `/src/services/` (auth, role-resolution). No bare Supabase calls in components.
- **Brand tokens before screens** — token file lands first. Components inherit. Never the reverse.
- **Kit reconciliation is foundational, not nice-to-have** — until hardcoded colors are migrated, "change one file, re-theme everything" is a lie.

---

## Skills Loaded for This Project

Auto-loaded via `.claude/skills/` of the starter kit:

- **`stark-frontend-first`** (mandatory — declares this phase) — service layer doctrine, mock conventions, anti-patterns
- **`frontend-design`** (Anthropic-official) — kills generic AI aesthetic
- **`skill-creator`** (Anthropic-official) — meta-skill for authoring new skills during runs
- **`webapp-testing`** (Anthropic-official) — Playwright E2E testing for Sub-Phase 5 verification

---

## Operating Rules (Inherited from Stark Global CLAUDE.md)

### Plan Mode (NON-NEGOTIABLE)
Before ANY file creation, modification, or refactor:
1. Enter Plan Mode (announce: `🔵 ENTERING PLAN MODE`)
2. Write plan to session file as `PENDING_APPROVAL`
3. Present plan: Steps, Files to modify, Files to create, Files NOT touched, Assumptions, Risks
4. Wait for Stark's approval (`approved`, `go`, `do it`)
5. Execute exactly what was approved
6. Report completion: Changes made, Things NOT touched, Concerns, Tests to run

### Karpathy Protocol
> **You are the hands. Stark is the architect.**

Move fast, but never faster than Stark can verify.

### Eyesight-Aware Communication
- **Explanations BEFORE code blocks.** Always.
- No surprises. No code dumps. No bullet-list explanations *after* code.

### Surgical Changes
Touch only what you must. Don't refactor adjacent code. Don't "improve" working code.

### Surface Conflicts, Don't Average
When two patterns or sources contradict, pick one, explain why, flag the other.

### Fail Loud
"Completed" means actually completed. "Tests pass" means actually pass.

---

## TDD Flow (Stark Standard)

For every component or service:
```
Build → Unit Test → Integrate → Block Test → System Test → Finalize
```

For Phase 1:
- ~5-10 unit tests (env-check, role-resolution helpers)
- ~3-5 integration tests (auth flow, protected route check)
- ~5-8 E2E tests (login, logout, role-gate enforcement, error boundary, theme toggle)
- ~10 manual checks (local smoke, role demo, env var fail-closed, theme switch, style tile render)

---

## Approval Gates

Phase 1 has discrete approval gates. Claudy stops at each.

| Gate | What's Verified |
|---|---|
| **Gate 0** | Discovery complete — Claudy can summarize project, forbidden zones, tech stack, Phase 1 plan |
| **Gate 1** | Types & contract — Phase 1 types match DATA_CONTRACT exactly, `tsc --noEmit` clean |
| **Gate 2** | Service layer — auth services + role-resolution helper present, no direct Supabase calls in components |
| **Gate 3** | Mock data — minimal test fixtures for Phase 1; no Frank-domain mocks |
| **Gate 4** | Components — tokens installed, superadmin route deleted, kit reconciled, landing page built, placeholder portals built, brand applied |
| **Gate 5** | Verification — local build/dev clean, all tests pass, smoke walkthrough complete, env fail-closed verified, security greps zero |
| **Gate 6** | Retrospective — RUN_001_LESSONS.md draft authored, operator reviewed |

Do not advance past any gate without operator approval.

---

## Conflict Resolution

If two sources contradict:

1. **`DATA_CONTRACT.md`** wins on data shapes
2. **`UI_SPEC.md`** wins on UI behavior
3. **`_design/tokens/globals.css`** wins on token values (it's the executable source)
4. **This file (`_project/CLAUDE.md`)** wins on scope and forbidden zones
5. **Module root `CLAUDE.md`** wins on module structure
6. **Stark global CLAUDE.md** wins on universal doctrine

If conflict persists, STOP and surface to operator.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-03 | Initial project spine for Cyber Pharma v1 Phase 1. Two apps, deploy work included. |
| 2.0 | 2026-06-04 | Scope cut: one app (superadmin to its own repo). All deploy work removed (separate dept owns this). Designer's locked v1 tokens integrated (Tailwind 3.4.1 confirmed, HSL-no-wrapper, Mist + Slate themes). Kit reconciliation task added (hardcoded colors → semantic tokens). Landing page added as primary new screen. |

---

🛡️ **End of project spine. Read `_project/APP_BRIEF.md` next.**
