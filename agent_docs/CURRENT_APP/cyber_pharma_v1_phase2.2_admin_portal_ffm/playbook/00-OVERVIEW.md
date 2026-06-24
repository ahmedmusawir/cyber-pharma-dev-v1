# Playbook 00 — Phase 2.2 Overview (Cluster Map)

> The cluster plan for the **Admin Portal Demo Shell** — mock-functional, owner-scoped, replaces `/admin-portal`'s user-CRUD with a StoreLens preview. Runner = **Jest**. Claudy STOPS at each cluster for operator approval. Derived from `verification/PHASE_GATES.md` (Gate 0–6).
>
> _v2 (2026-06-24): rewritten for Phase 2.2. The prior content was a stale copy of the OwedBook Phase-2 map (KIPs → OwedBook screen); superseded._

## Clusters

| # | Cluster | Ships | Gate |
|---|---|---|---|
| 0 | Discovery / Recon | recon report + this cluster plan + file tree; `/moose-portal` confirmed untouched | Gate 0 |
| 1 | Types & Contract | `src/types/adminDemo.ts` — 7 view-models + 6 status vocabs + `ActionResult` (DATA_CONTRACT §1–2); `jobTitle` demo-only flag | Gate 1 |
| 2 | Service layer + Zustand store | `src/store/useAdminDemoStore.ts` + 5 services (OwnerStores/StoreMember/Billing/Settings/Audit); HARD invariants (invite-no-password, no-charge, owner-scoped, mutators append audit) | Gate 2 |
| 3 | Mock seed | `src/mocks/adminDemo.ts` (DELETABLE) seeding every rendered state | Gate 3 |
| 4 | Components + 6 screens + chrome **+ Gate M** | **4a:** sidebar nav swap + route takeover (delete `users/*`) + Demo marker → checkpoint commit. **4b:** the 6 screens matching `_design/` + responsive (375 holds) | Gate 4 + **Gate M** |
| 5 | Verification | triad + gating greps + mock-functional smoke walk + operator eyes-on at 375 | Gate 5 |
| 6 | Retrospective | `RETROSPECTIVES/RUN_001_LESSONS.md` + Phase-7 requirements harvest | Gate 6 |

## Cluster order is enforced
Types → services+store → mocks → screens. The service layer is the SOLE Phase-7 swap point: components call services only, never the store or `/mocks` directly. **Gate M (mobile) is built INTO Cluster 4, verified there — never deferred.** Cluster 4 checkpoint-commits after chrome+route-takeover (4a), before the screens (4b), so it isn't one giant blob.

## Approval cadence
Each cluster: propose plan (Plan Mode) → STOP → operator approves → execute → STOP for review. Never batch. Checkpoint commit between clusters (and within C4).

## Reuse / chrome
OwedBook's `AuthedShell` is reused VERBATIM. The only chrome change is the sidebar nav items (My Stores · Billing · Settings · Audit). Navbar stays coral both modes (already live, identical `12 83% 47%` — operator ruling, no token change). Tokens inherited; only net-new visual is the "Demo · mock data" pill (`--warning`).

## Phase-7 flags (carried)
- `jobTitle` is demo-only (no Frank-schema source).
- **Sidebar search input** was removed in Phase 2.1; the FFM design predates that. If the designer intended it to become a real **command palette** (search across stores/members/actions), that's a Phase-7 decision — captured here, not built now.
- Billing visual / add-store mock / real invite + RLS → Phase-7 (StoreLens).

## Cross-reference
Scope/gates/the-one-hard-rule → `_project/APP_BRIEF.md` + `_project/CLAUDE.md`. Shapes/services/store → `_project/DATA_CONTRACT.md`. Screens/states/responsive → `_project/UI_SPEC.md`. Pixel targets → `_design/HTML/` + `_design/PNG-S/` + `_design/DOCS/admin_component_states_*`.
