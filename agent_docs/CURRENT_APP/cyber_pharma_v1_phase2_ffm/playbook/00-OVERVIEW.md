# Playbook 00 — Phase 2 Overview (Cluster Map)

> The phase-by-phase build plan for the OwedBook. KIPs FIRST, then the screen. Claudy STOPS at each cluster for operator approval. Runner = **Jest** (recon-verified).

## Clusters

| # | Cluster | Ships | Gate |
|---|---|---|---|
| 0 | Orphan cleanup | delete SuperadminSidebar.tsx, DashboardCard.tsx, empty admin/+members/ dirs | G3 |
| 1 | The 3 KIPs (FIRST) | DataTable (+card reflow), MultiSelect, EmptyState — each component-tested | G4 |
| 2 | OwedBook screen | 4 KPI tiles, 4 tabs, filter rail, pager, status chips (consumes the KIPs) | G5, G6 |
| 3 | Service + mocks | `owedBookService` (mock-backed, swap-stable) + `src/mocks/owedbook.ts` (DELETABLE) | G7, G8 |
| 4 | Responsive + verification | rail→drawer, KPI→2×2, tabs→scroll, table→cards; full triad + seam-walk | G9–G14 |
| — | Retrospective | RUN_002_LESSONS.md drafted honestly | G15 |

## Cluster order is enforced
Cluster 1 (KIPs) lands and tests BEFORE Cluster 2 (the screen that consumes them) — hard gate G4. Cluster 0 (cleanup) runs first so the tree is clean before building.

## Approval cadence
Each cluster: propose plan (Plan Mode) → STOP → operator approves → execute → STOP for review. Never batch.

## Verification doctrine (carried from RUN_001)
- Grep-at-close on every grep-verifiable gate (no sample-then-trust).
- `rm -rf .next` before tsc smoke between any deletion steps.
- Continuous SP5 seam-walk in every auth state (not just happy path).
- Tests for deleted code die with the source; baseline re-counted fresh from 42/42.

## The reusable playbook files
`01`–`07` are the reusable frontend-first methodology (Discovery → Types → Services → Mocks → Components → Verification → Retrospective), tuned to these clusters during the build. The cluster map above is the Phase-2 spine; the numbered files carry the per-step discipline.

## Cross-reference
Scope/gates → `_project/APP_BRIEF.md`. Shapes/service → `_project/DATA_CONTRACT.md`. KIPs/screen/responsive → `_project/UI_SPEC.md`. Forbidden zones/recon-locked facts → `_project/CLAUDE.md`.
