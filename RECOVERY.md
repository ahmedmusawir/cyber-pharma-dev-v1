# Recovery State

> **B-3 COMPLETE 2026-06-17** — verified by full triad (tsc 0 / jest 73·15 / build 0). Two-surface split + role nav/guard + universal /profile + OwedBook screen built per UI_SPEC v1.3 (Amendment §A–§F). Base committed+pushed at `aee6e68` (origin/phase2); the B-3 work itself is UNCOMMITTED on top, held for operator review before Cluster 3. See `agent_docs/SESSIONS/session_2026-06-17.md`.

Last action: **B-3 sidebar correction (UI_SPEC v1.4) — FilterRail INSIDE the shared sidebar container.** Corrected the prior over-fix: `/owedbook` now uses the SAME sidebar box as `/admin-portal` (identical `w-[25rem] border-4` + `Command`/`CommandInput`). `AdminSidebar` owns both surfaces — content below the command input differs only (admin nav items | `<FilterRail/>`). New `OwedBookContext` + `OwedBookProvider` (in `/owedbook` layout) bridges filter state from the sidebar's rail to `OwedBookScreen` (main pane = label/title/KPIs/pager/tabs/table only). `/admin-portal` output unchanged. Spec already v1.4 (no doc change this round). Triad re-green: tsc 0 / jest 73·15 / build 0. **Screenshots NOT captured — both surfaces auth-gated; need a test admin login.**

Prior in this cluster: **Phase 2 Cluster 2 / B-3 (two-surface split + OwedBook screen) COMPLETE — awaiting review.**
  - **Two-surface shell ✅** new `/owedbook` route (layout guards `[ADMIN, MEMBER]`, server page → client `OwedBookScreen` island). `/admin-portal` redirects to `/admin-portal/users`. Surface-aware `AdminSidebar` (Dashboard-only on /owedbook*, Users/Add-Member/Profile on /admin-portal*). Navbar switcher (ADMIN-only, route-derived active).
  - **Role guard ✅** `protectPage` gained additive `{ unauthorizedRedirect }`; `(admin)` layout bounces MEMBER → `/owedbook`. Post-login + register → `/owedbook`. `/` auth-only redirect (guests keep marketing).
  - **§F universal profile ✅** `git mv (admin)/profile → /profile` (top-level, `[ADMIN, MEMBER]`, Navbar-only shell). Navbar dropdown already had Profile link.
  - **OwedBook screen ✅** KPI tiles (`bg-chart-1..4`), 4 tabs, filter rail, pager, status chips, loading/empty/error — all via `owedBookService` (stub → renders EmptyState/KPI=0, expected until Cluster 3). DataTable got additive `render` prop for the status chip.
  - **Surfaced gap (DATA_CONTRACT §8):** Updated-Payments tab "New Paid" / per-row "Updated Difference" have no `OwedBookRow` field — NOT invented; built with supported columns; needs operator decision in Cluster 3.

Prior actions: Cluster 1 (3 KIPs) COMPLETE, G4 ✅. Cluster 0 (Orphan Cleanup) COMPLETE, G3 ✅.

Pending: **Operator review of B-3 (empty-but-working screen), then Cluster 3** — flesh `owedBookService` mock body + `src/mocks/owedbook.ts` fixtures; resolve the New Paid / Updated Difference contract gap; live multi-role seam-walk (not yet run — needs real login).

Phase: **Cyber Pharma v1 Phase 2** (OwedBook visual fidelity on demo data via service layer).
FFM: `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/`. Spec authority: **UI_SPEC v1.4** (§A–§F; §A.1 + §5.1 = sidebar-is-filter-rail).
Branch: `phase2`. Base commit: `aee6e68` (pushed).

Phase 2 hard gates status:
  - G1 build clean: ✅ (B-3 `npm run build` exit 0)
  - G2 dev runs: ⏳ live seam-walk not yet run (needs real login)
  - G3 orphan cleanup done: ✅
  - **G4 3 KIPs built FIRST + tested: ✅**
  - G5 OwedBook 4 tabs (via service): ✅ built (4 tabs wired; empty via stub until C3)
  - G6 4 KPI tiles via `--chart-*`: ✅ (`bg-chart-1..4`, KpiTiles)
  - G7 components import service, never mocks: ✅ (OwedBookScreen → `owedBookService`; grep-confirmed)
  - G8 no Frank-domain tables: ✅ (none created)
  - G9 responsive (drawer + card-reflow): ⏳ Cluster 4 (DataTable card-reflow present; rail→drawer is C4)
  - G10 no numbered Tailwind colors: ✅ (grep-at-close clean on B-3 files)
  - G11 theme toggle holds across OwedBook: ⏳ Cluster 4 visual
  - G12 env var names verbatim: ✅
  - G13 tests pass: ✅ (73/73, 15 suites)
  - G14 grep-at-close + seam-walk: 🟡 grep-at-close done; live seam-walk pending
  - G15 RECOVERY current + RUN_002 retrospective: 🟡 RECOVERY current; retrospective post-Cluster 4

Files in flight — **B-3, UNCOMMITTED on top of `aee6e68`** (held for operator review; C0/C1/C2 already committed+pushed):
  - New routes: `src/app/owedbook/{layout,page}.tsx`, `src/app/profile/layout.tsx`.
  - New components: `src/components/owedbook/{OwedBookScreen,KpiTiles,FilterRail,StatusChip,columns,format}.{tsx,ts}`.
  - Moved (git mv): `(admin)/profile/{page,ProfileForm}.tsx` → `src/app/profile/`.
  - Modified: `(admin)/layout.tsx`, `(admin)/admin-portal/page.tsx`, `(public)/page.tsx`, `RegisterForm.tsx`, `Navbar.tsx`, `AdminSidebar.tsx`, `useAuthStore.ts`, `DataTable.tsx` (+render prop), `OwedBook.ts` (interface→type), `actions.ts` (protectPage param).
  - New tests: `__tests__/{owedbook/*,layout/AdminSidebar,global/Navbar.switcher,common/DataTable.render}`.

Test baseline: **73/15** (was 62/9 + 11 new B-3 tests across 6 suites: StatusChip 4, KpiTiles 1, OwedBookScreen 1, AdminSidebar 2, Navbar.switcher 2, DataTable.render 1).
Test note: AdminSidebar test polyfills `ResizeObserver` + `Element.scrollIntoView` (cmdk needs them in jsdom) — local to that file.

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
