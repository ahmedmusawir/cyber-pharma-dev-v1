---
name: stark-kit-residue-cleaner
description: >
  Post-clone cleanup ritual for apps built on the Stark starter kit. Traces every
  kit demo surface's consumers, produces a DELETE/KEEP/COUPLED kill-list report for
  operator rulings, then executes the approved shed under exact-count gates.
  Trigger when an app's own surfaces are built and live-verified and the operator
  says to clean up the starter kit demo scaffolding, shed the kit, run kit-shed,
  or remove the example portals.
---

# stark-kit-residue-cleaner — Methodology

## Role

You are the engineer executing a two-phase, operator-gated cleanup. Phase 1 is a
read-only consumer trace producing a kill-list report. Phase 2 is the gated
execution of that list after operator rulings. You never proceed from Phase 1 to
Phase 2 without explicit approval.

## Phase 0 — Preconditions (verify, then STOP if any fail)

- A ground-truth recon of the clone EXISTS (Day-0 doc-vs-disk sweep). A kit-residue-cleaner run
  against an unrecon'd clone risks repeating the phantom-primitive failure —
  deleting or keeping based on what docs claim instead of what disk holds.
- The app's own surfaces exist and have passed a live verification (the app works).
- `git status` clean. A dedicated cleanup branch exists and is checked out.
  (You verify; the OPERATOR performs any git actions.)
- Baseline pinned: `tsc --noEmit` clean, `npm test` recorded (suites + tests).
  Pre-existing red stops the task before any deletion — never delete on a broken
  baseline.

## Phase 1 — TRACE (read-only)

Full procedure: `workflow/00-trace.md`. Summary:

1. Extract the full import-edge map of `src/` — use a MULTI-LINE-SAFE pattern
   (bare `from "..."`), never `^import.*from` (see ANTI_PATTERNS A-1).
2. For every surface in `references/KIT_DEMO_MANIFEST.md`, verify consumers on
   THIS repo and classify: **DELETE** (zero app consumers) / **KEEP** (the app
   consumes it) / **COUPLED** (shared — name the exact seam and surgery).
3. Run the four specific hunts: (a) every reference INTO soon-dead routes from
   KEEP surfaces — the retarget list; (b) the app's kit-born dependency manifest,
   file by file; (c) the test map — which suites die with which targets, and the
   PREDICTED post-cleanup baseline; (d) latent dependency orphans (report only —
   package.json belongs to a dep-hygiene task, not this skill).
4. Deliver the kill-list report (RESPONSES mirror first), including open
   QUESTIONS for surfaces where infra-vs-curriculum is ambiguous. **STOP.**

## — OPERATOR GATE —

The operator rules on every QUESTION and every COUPLED seam. Rulings are recorded
verbatim in the Phase 2 plan.

## Phase 2 — CLEANUP (approved plan only)

Full procedure: `workflow/01-cleanup.md`. Summary:

1. Present the execution plan: surgeries first, cascades whole, gates between
   waves, exact-count final gates. Recount the kill list yourself — do not trust
   the report's arithmetic (A-4). **STOP for approval.**
2. On approval: surgeries (retargets/link removals on KEEP surfaces) → delete
   route-group cascades + their tests → gate → delete now-orphaned shared code →
   gate. Clear the build cache before the first post-deletion `tsc` (A-3). Sweep
   deleted directories for non-code stragglers (A-2).
3. Final gates: `tsc` clean · build green with the route table matching the
   predicted shape EXACTLY · `npm test` equals the predicted count EXACTLY ·
   live walk (auth chain, every app screen 200, every dead route 404).
4. Result artifact to RESPONSES; remind the operator of the commit point.
   You do not commit.

## Gates Table

| Gate | Predicate | On deviation |
|---|---|---|
| G0 baseline | tsc clean + tests green pre-deletion | STOP before deleting |
| G1 post-cascade | tsc clean; tests already at predicted count | STOP + report |
| G2 post-orphans | tsc clean | STOP + report |
| G3 build | route table == predicted, exactly | STOP + report |
| G4 tests | suites/tests == predicted, exactly | STOP + report |
| G5 live walk | auth chain + all app screens 200 + all dead routes 404 | STOP + report |
| G6 operator visual | operator walks screens in a browser, both themes, mobile drawer | skill not done until passed |

G5 proves routes; G6 proves pixels. Never conflate them (A-9).

## Worked Example — MissionControl (2026-07)

- Trace: 649 import edges; 102 files claimed → recount 101 → operator kept 2
  (blessed infra) → 99 code files; execution discovered 1 non-code straggler
  (a README) → **100 paths deleted + 2 surgical edits.**
- Tests: 11 suites / 81 tests → predicted and landed **2 suites / 8 tests exactly.**
- Live walk: 15/15 including eight dead kit routes returning 404.
- Full artifacts: see `examples/mission-control-2026-07/`.

## Anti-Patterns (top 5 — full list in references/ANTI_PATTERNS.md)

- A-1 single-line import grep falsely orphans multi-line-imported files
- A-2 code-only trace is blind to non-code files riding in deleted directories
- A-3 stale `.next/` cache fails the first post-deletion tsc with phantom errors
- A-5 deleting zero-consumer INFRASTRUCTURE as if it were demo curriculum
- A-6 deleting before retargeting — a KEEP surface links a 404 mid-run

## When You're Done

- All gates G0–G5 green, zero deviations pushed through; G6 (operator visual pass)
  handed off as a named gate — the skill closes only when the operator's eyes say so.
- Blessed-KEEP durability EMITTED: header comment on every ruled zero-consumer KEEP
  + `KEEP_MANIFEST.md` written to the repo's agent_docs (A-10).
- Script/config fossils referencing deleted targets cleaned or loudly listed (A-11).
- Result artifact mirrored to RESPONSES with the final path count, the two-way
  diff summary (deleted / modified / untouched), and the new test baseline
  declared as the repo's going-forward number.
- Operator reminded of the commit point and the visual browser pass.
- Any lessons flagged: new anti-patterns here, trickle-ups to other skills named.

| Version | Date | Notes |
|---|---|---|
| v0.9 | 2026-07-10 | Authored from the MissionControl run |
| v0.9.1 | 2026-07-10 | Retro delta: recon precondition, G6 visual gate, marker emission |
| v0.9.2 | 2026-07-13 | Renamed to stark-kit-residue-cleaner |
