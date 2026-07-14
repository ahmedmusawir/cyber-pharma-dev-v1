# stark-kit-residue-cleaner — Phase 2 PLAN (approved)

**Repo:** cyber-pharma · **Branch:** `repo-cleaner-v1` · **Date:** 2026-07-14
**Approval:** operator ruled Q1–Q3 + fossil + S-1; extended shed 10→12 (clean shed).
**Gates (operator-specified):** `tsc` 0 · `jest` **25/118 EXACTLY** · `find`-recount of deleted paths == 12.

## Rulings recorded verbatim
- **Q1:** DELETE all 10. "The starter kit is the toolkit; the app carries only what it consumes. Clean shed."
- **Q1-ext:** extend to 12 — `mocks/auth.ts` sole-consumes `AuthSnapshot` sole-consumes `User`; both newly orphaned → include. "extend to 12, clean shed."
- **Q2:** KEEP `(public)` landing + `NavbarHome`/`NavbarLoginReg`. LEDGER: "replace kit marketing landing with real Cyber Pharma landing — pre-staging design task." Not residue; placeholder doing a real job.
- **Q3:** KEEP `utils/supabase/admin.ts`. Emit blessed marker + KEEP_MANIFEST per A-10; marker adds: "/moose-portal carries its own service-role client — reconcile the duplicates at Phase 3."
- **Fossil:** DELETE the `test:integration` script line (A-11, in scope). `test:e2e` stays (playwright installed) — note only.
- **S-1:** A-1b (relative-import trace gap) accepted for trickle-up — verbatim in this run's result lessons.

## DELETE set (12 files — enumerate-then-delete, re-count before rm per A-4/§9)
1. `src/types/UserRole.ts`
2. `src/mocks/auth.ts`
3. `src/utils/supabase/fetchUserData.ts`
4. `src/components/common/Page.tsx`
5. `src/components/common/Box.tsx`
6. `src/components/common/Row.tsx`
7. `src/components/common/Container.tsx`
8. `src/components/common/BackButton.tsx`
9. `src/components/ui/table.tsx`
10. `src/components/ui/pagination.tsx`
11. `src/types/AuthSnapshot.ts`
12. `src/types/User.ts`

## Surgeries / non-deletion edits
- **S1 — Blessed marker** on `src/utils/supabase/admin.ts`: one-line header comment per A-10 + reconcile note.
- **S2 — KEEP_MANIFEST.md** created at `agent_docs/KEEP_MANIFEST.md`: Q3 blessed-infra entry + Q2 public-landing ledger entry.
- **S3 — package.json fossil:** remove the `test:integration` line.

## Retargets
NONE — every DELETE target has zero consumers; no KEEP surface links a dying path.

## Sequence
1. S1 + S2 + S3 (surgeries/markers/fossil) — no code depends on them, safe first.
2. Delete the 12 files (re-enumerate with `find` immediately before `rm`).
3. Clear `.next/` cache (A-3).
4. **Gate:** `tsc --noEmit` 0 · `find`-recount == 12 deleted · `jest` 25/118 EXACTLY.
5. Production `build` green + route table unchanged (no route/page deleted → structurally guaranteed; verify anyway).
6. G5/G6: **N/A-by-construction** — zero routes, pages, layouts, or in-render-tree components were deleted (all 12 are zero-consumer leaf files). No screen changed; no auth chain touched. Stated honestly rather than spinning a dev server for a no-op walk.
7. Result artifact → RESPONSES; update session + RECOVERY; remind operator of commit point.

## Non-goals (untouched)
package.json deps (dep-hygiene owns), `/moose-portal`, `(public)`, auth surface, all KEEP files in Phase-1 §B, the skill's own files (`_SKILLS/**` — A-1b flagged for operator to fold in, not edited by this run).
