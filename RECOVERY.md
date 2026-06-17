# Recovery State

> **RECONCILED 2026-06-17** after an 8-day gap. State below reconstructed from the working tree (read-only inspection), NOT from a live build. Nothing has been committed since `57a3154 session update` (09 Jun) — all of C0/C1/C2-so-far lives ONLY in the working tree. See `agent_docs/SESSIONS/session_2026-06-17.md`.

Last action: **Phase 2 Cluster 2 (OwedBook screen) IN PROGRESS — B-1 + B-2 done, B-3 NOT started.** On disk:
  - **B-1 ✅** user CRUD relocated from `/admin-portal` → `/admin-portal/users/` (8 renamed files) — user mgmt now a sub-route, NOT replaced.
  - Sidebar ✅ `AdminSidebar.tsx` adds "Users" link + repoints "Add Member" to `/users/add-member`.
  - **B-2 ✅** `src/app/(admin)/admin-portal/page.tsx` placeholder ("replaced by OwedBook screen in B-3").
  - Contract-first ✅ `src/types/OwedBook.ts` (full type set) + `src/services/owedbook.ts` (`OwedBookService` interface + C2 thin stub returning zero/empty per method, BACKEND_SWAP_NOTES inline).
  - **B-3 ❌ the actual OwedBook screen is NOT built** — placeholder still in place.

Prior actions: Cluster 1 (3 KIPs) COMPLETE, G4 ✅ — `DataTable.tsx` / `MultiSelect.tsx` / `EmptyState.tsx` + tests in `src/__tests__/common/` (prior baseline 62/9, NOT re-run this session). Cluster 0 (Orphan Cleanup) COMPLETE, G3 ✅. Checkbox + Popover MISSING from shadcn ui/ → fallback to raw `<input type="checkbox">` + document listeners (Tabs primitive PRESENT).

Pending: **Cluster 2 / B-3 — build the OwedBook screen** against the existing `owedBookService` stub. C2 lock (honored on disk): OwedBook lives ALONGSIDE the admin user CRUD at `/admin-portal`, NOT replacing it; user CRUD relocated to the `/users` sub-route. RECOMMEND a checkpoint commit of C0/C1/C2-so-far before B-3 (8-day uncommitted gap).

Phase: **Cyber Pharma v1 Phase 2** (OwedBook visual fidelity on demo data via service layer).
FFM: `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/` (v1.0, authored from `RECON_cyber-pharma-v1_phase2_2026-06-08.md`).
Branch: `phase2`.

Phase 2 hard gates status:
  - G1 build clean: ⏳ verify at C4
  - G2 dev runs: ⏳
  - G3 orphan cleanup done: ✅
  - **G4 3 KIPs built FIRST + tested: ✅** (this cluster — DataTable + MultiSelect + EmptyState, 20 tests)
  - G5 OwedBook 4 tabs with demo data: ⏳ Cluster 2 / B-3 (next step; service+types scaffolded, screen not built)
  - G6 4 KPI tiles via `--chart-*`: ⏳ Cluster 2 / B-3
  - G7 components import service, never mocks: ⏳ Cluster 3
  - G8 no Frank-domain tables: ⏳ (locked by forbidden zones — verify at C4)
  - G9 responsive (drawer + card-reflow): ⏳ Cluster 4
  - G10 no numbered Tailwind colors: ⏳ ongoing discipline
  - G11 theme toggle holds across OwedBook: ⏳ Cluster 4 visual
  - G12 env var names verbatim: ✅ (Phase 1 instrumentation.ts already validates these)
  - G13 tests pass: ⏳ ongoing
  - G14 grep-at-close + seam-walk: ⏳ Cluster 4
  - G15 RECOVERY current + RUN_002 retrospective: ⏳ post-Cluster 4

Files in flight (UNCOMMITTED, working tree only — 8-day gap, recommend checkpoint commit):
  - C2 new: `src/types/OwedBook.ts`, `src/services/owedbook.ts`, `src/app/(admin)/admin-portal/page.tsx` (placeholder).
  - C2 renames: `admin-portal/{AdminPortalPageContent,DeleteUserButton,actions,page}.tsx` + `add-member/*` + `edit/[id]/*` → `admin-portal/users/...`.
  - C2 modified: `src/components/layout/AdminSidebar.tsx`.
  - C1 new (untracked): `src/components/common/{DataTable,MultiSelect,EmptyState}.tsx` + `src/__tests__/common/`.
  - Docs: `agent_docs/RECON/`, `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/`.
Files deleted (C0): `src/components/layout/SuperadminSidebar.tsx`, `src/components/dashboard/DashboardCard.tsx`.
Dirs removed (C0): `src/components/admin/`, `src/components/members/`, `src/components/dashboard/`.

Test baseline: **62/9** (Phase 1 baseline 42/6 + 20 new KIP tests across 3 new suites: DataTable 8, MultiSelect 9, EmptyState 3). Locked.

Recon-locked facts (authoritative, do NOT contradict):
  - Stack: Next 16.2.1 / React 19.2.4 / TS strict / Tailwind 3.4.1 (HSL+config) / **Jest**. `proxy.ts` not `middleware.ts`.
  - Tokens: inherited from Phase 1 `src/app/globals.css` (v1.1 dark patch). Not reinstalled.
  - Auth: `useAuthStore` (client) + `supabase.auth.getUser()` (server); `protectPage([AppRole.X])`. NO auth-service wrapper.
  - AppRole: import from `src/utils/app-role.ts` (canonical).
  - Env names (verbatim): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`.
  - DB: 2 kit tables (`user_roles`, `profiles`). 13 Frank tables do NOT exist (Phase 3).

Forbidden zones (Phase 2 — top 3 most relevant):
  1. NO Frank-domain table for "demo data" — fixtures in `src/mocks/owedbook.ts` via the service.
  2. NO OwedBook screen before the 3 KIPs exist + pass tests (G4).
  3. NO components importing `src/mocks/` directly — they call `owedBookService` only (G7).

Lessons carried from Phase 1 (RUN_001): server shell + client island for nav; real-screen dark check; complex layouts at `lg:` not `md:`; grep-at-close on every verifiable gate; `rm -rf .next` before tsc smoke between deletion batches (applied this cluster); continuous seam-walk in every auth state; tests for deleted code die with the source.

OPERATIONAL NOTES:
  - Launch Claude Code with CWD = `agent_docs/`.
  - `.env.local` at repo root — DO NOT read or commit.
  - Kit-infra fixes (command.tsx `as any`, server.ts cookies cast, sass dep) are DEFERRED to v3 harvest — not touched in Phase 2.
