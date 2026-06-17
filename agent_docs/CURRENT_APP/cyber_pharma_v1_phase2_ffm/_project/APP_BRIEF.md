# APP_BRIEF v1.0 — Cyber Pharma v1 / Phase 2: Visual Fidelity (OwedBook, Demo Data)

> **Status:** LOCKED · **Phase:** 2 of 8 · **Predecessor:** Phase 1 (Foundation Skeleton, closed 15/15) · **Successor:** Phase 3 (Schema + RLS + Frank-domain tables)
> **Authored from:** `RECON_cyber-pharma-v1_phase2_2026-06-08.md` (verified ground truth) + FFM_PLAYBOOK v1.2. No claim here is from a doc alone; all stack/auth/token facts are recon-verified.

---

## 1. Mission Of This Phase

Bring the OwedBook to life on the Phase-1 foundation — the full ledger dashboard (KPI tiles, four tabs, filter rail, data table) rendered at production visual fidelity, driven by **demo data through a service layer**. No real backend. Frank looks at it and says "that's exactly my app, with mock numbers."

## 2. Hero Outcome

> **A reviewer opens `/admin-portal`, sees the OwedBook with live-looking demo data across all four tabs, filters by PBM and date, watches the table reflow to cards on mobile and the filter rail collapse to a drawer, toggles Mist↔Slate with the coral holding — and every byte of that data flowed through a service layer that Phase 3 will swap to real Supabase without touching a single component.**

## 3. In Scope (Phase 2 Only)

### Cluster 0 — Orphan cleanup (recon-flagged, do first)
- 🔒 Delete `src/components/layout/SuperadminSidebar.tsx` (orphan — consumer deleted Phase 1)
- 🔒 Delete `src/components/dashboard/DashboardCard.tsx` (operator ruling: delete; KPI tile built fresh per designer spec)
- 🔒 Remove empty `src/components/admin/` and `src/components/members/` dirs
- 🔒 NOT here: `command.tsx` `as any`, `server.ts` cookies cast, sass dep — kit-level, deferred to v3 harvest. Do not touch kit infra.

### Cluster 1 — The 3 KIPs (BUILD FIRST, before any OwedBook screen)
- 🔒 **KIP-1 DataTable** — sortable, sticky dark header, zebra rows, right-aligned tabular-figure numeric columns, per-cell semantic coloring (Owed/Diff → `text-success`/`text-destructive`), **mobile card-reflow mode** (one card per row, Owed as hero number)
- 🔒 **KIP-2 MultiSelect** — searchable, multi-check PBM filter, "All" handling, selected-count summary, open-panel state
- 🔒 **KIP-3 EmptyState** — icon + headline + sub-copy + optional action, for filtered-zero results
- 🔒 Each KIP gets component tests before it's consumed

### Cluster 2 — OwedBook screen (built FROM the KIPs)
- 🔒 OwedBook at `/admin-portal` (replaces the "Coming in Phase 2" placeholder)
- 🔒 4 KPI tiles: Commercial Underpaid, Commercial Scripts, Updated Difference, Owed (solid `--chart-*` colors, white label+value)
- 🔒 4 tabs: Commercial Dollars · Updated Commercial Payments · Federal Dollars · Summary
- 🔒 Filter rail: From/To date, Filter dropdown, PBM MultiSelect, Clear/Apply, Upload Data + Get Fresh Data buttons (UI only — no real upload/fetch wiring; Phase 5)
- 🔒 Pager (Prev/Next, "Page N of M", limit/total)
- 🔒 Status chips (Recovered / Emailed PBM / Pending / Underpaid / New)

### Cluster 3 — Service layer + demo data (the architecture spine)
- 🔒 **First real domain service:** `src/services/owedbook.ts` — typed, mock-backed (returns demo fixtures) in Phase 2; Phase 3 swaps the body for real Supabase/Frank-table queries with **zero component changes**. This is the frontend-first sole-swap-point pattern — NOT the forbidden auth-wrapper (it's project-specific domain logic, exactly what `src/services/` is for).
- 🔒 Demo fixtures in `src/mocks/owedbook.ts`, documented DELETABLE; components import the service, never the mocks directly

### Cluster 4 — Responsive + verification
- 🔒 Filter rail → slide-in drawer below `lg` (active-count badge)
- 🔒 KPI row → 2×2 on mobile; tabs → horizontal scroll strip; table → card reflow
- 🔒 Theme toggle holds across OwedBook (Mist + Slate)
- 🔒 Full verification: build + Jest + seam-walk

## 4. Out of Scope (Phase 2)

- ❌ Frank-domain tables (`businesses`, `user_data`, etc.) — **Phase 3**. Phase 2 invents NONE; data is demo-only via the service mock.
- ❌ Real upload / "Get Fresh Data" wiring — Phase 5 (Imports)
- ❌ Real reimbursement math — Phase 5
- ❌ Reports viewer, PDF, email, GHL — Phase 6
- ❌ Stripe / billing — Phase 7
- ❌ Auth-service wrappers — never (kit auth is complete; consume directly)
- ❌ Kit-infra fixes (`command.tsx`, `server.ts` cast, sass dep) — v3 harvest
- ❌ Superadmin anything — its own repo
- ❌ ANY deploy work — separate DevOps department

## 5. Hard Gates (Phase 2 cannot close without these)

| Gate | Verification |
|---|---|
| **G1** Local build clean | `npm run build` exit 0 |
| **G2** Local dev runs | `npm run dev` responds |
| **G3** Cluster 0 orphan cleanup done | `SuperadminSidebar.tsx` + `DashboardCard.tsx` gone; empty dirs resolved; grep confirms |
| **G4** 3 KIPs built FIRST + tested | DataTable, MultiSelect, EmptyState exist with passing component tests, authored BEFORE the OwedBook screen (cluster order shows it) |
| **G5** OwedBook renders 4 tabs with demo data | manual: each tab shows the right columns + demo rows |
| **G6** 4 KPI tiles render with `--chart-*` tokens | manual + grep (no numbered colors) |
| **G7** Data flows through the service layer | `owedBookService` exists; **grep: components import the service, never `src/mocks/` directly** |
| **G8** No Frank-domain tables created | `supabase/` unchanged; no new migrations/tables |
| **G9** Filter rail → drawer below `lg`; table → cards on mobile | manual at 375 / 1024 |
| **G10** No numbered Tailwind colors | grep zero in `src/components/` + `src/app/` |
| **G11** Theme toggle holds across OwedBook (Mist↔Slate) | manual, both modes |
| **G12** Env var names verbatim | recon-locked: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` — never legacy names |
| **G13** Tests pass (Jest) | baseline 42/42 preserved + new KIP & OwedBook tests on top |
| **G14** Grep-at-close + seam-walk done | every grep-verifiable gate re-grepped at SP-close; continuous walk in both auth states |
| **G15** RECOVERY.md updated + RUN_002 retrospective drafted | last action logged; retrospective honest |

## 6. Known Risks

| Risk | Mitigation |
|---|---|
| DataTable is the heaviest KIP; mobile card-reflow is fiddly | Build + test DataTable in isolation (Cluster 1) before the OwedBook depends on it; reflow is mandatory per Rule Zero |
| Demo data shape drifts from Phase-3 real shape | DATA_CONTRACT defines row/KPI/filter types AND notes the Phase-3 `user_data` mapping, so the service contract is swap-stable |
| `cookies() as any` in `server.ts` bites if OwedBook touches SSR | OwedBook reads via the client service + demo data; if an SSR path is needed, surface — don't fix kit infra inline |
| Tabs primitive may not be in the kit | recon/COMPONENT_MANIFEST says verify; if absent it's a small build, lower risk than the 3 KIPs |

## 7. Common Stumbles

| Stumble | Fix |
|---|---|
| Building OwedBook before the KIPs | Hard gate G4 — KIPs first, enforced by cluster order |
| Components importing `src/mocks/` directly | G7 grep — components call the service only |
| Inventing a Frank table "just for demo data" | G8 — demo data is fixtures in the service mock, not a table |
| Numbered colors creeping into the dense table | G10 grep-at-close |
| Re-wrapping auth in a service | the OwedBook service is DOMAIN logic; auth still consumed directly from the kit |
| Treating Phase-2 reference PNGs as untouchable | Phase 2 IS the phase to build the real OwedBook in JSX (reference the design artifacts in `_design/`) |

## 8. Estimated Effort

**3-5 sessions.** Cluster 1 (the 3 KIPs) is the heavy lift; Cluster 2 (OwedBook assembly) is fast once the KIPs exist; Clusters 0/3/4 are light.

## 9. Handoff To Phase 3

When Phase 2 closes: the OwedBook is visually complete and demo-driven through `owedBookService`. Phase 3 creates the 13 Frank-domain tables + RLS + audit, then **swaps the service mock body for real Supabase queries** — components untouched. The DATA_CONTRACT's Phase-3 mapping notes make that swap mechanical.

## 10. Constraints

- Recon-locked facts are authoritative (stack, env names, Jest, token system inherited-not-reinstalled, no auth wrappers).
- Service layer is the sole swap point — components never call Supabase or import mocks directly.
- KIPs before screens. Plan Mode before any build. Eyesight-aware (explanations before code). Grep-at-close on every verifiable gate.
- Tokens inherited from Phase 1 (`globals.css` v1.1) — Phase 2 does NOT reinstall or re-theme.

## 11. Phase Transitions

| Phase | What it does |
|---|---|
| 1 ✅ | Foundation skeleton (closed) |
| **2 (this FFM)** | **OwedBook visual fidelity, demo data via service layer** |
| 3 | Frank-domain schema + RLS + audit; swap service mock → real |
| 4 | Reference data pipeline |
| 5 | Math + imports |
| 6 | PDF + email + GHL |
| 7 | Stripe + multi-store admin |
| 8 | HIPAA hardening + prod deploy (DevOps dept) |

## 12. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-09 | Initial Phase 2 APP_BRIEF. Authored from recon report + FFM_PLAYBOOK v1.2. KIPs-first sequence locked; Cluster-0 orphan cleanup folded in (SuperadminSidebar + DashboardCard delete, empty dirs removed); demo-data-via-service-layer architecture (first real domain service); Frank tables explicitly Phase 3. |
