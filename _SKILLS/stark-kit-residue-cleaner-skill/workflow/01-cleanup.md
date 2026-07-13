# workflow/01-cleanup.md — Phase 2: Gated Execution

Precondition: Phase 1 report delivered, operator rulings received. This phase has
its own plan → approval → execute cycle.

## 1. Present the execution plan (STOP for approval)

- Apply rulings verbatim; record them at the top of the plan.
- RECOUNT the kill list by enumeration (A-4). State the final path count.
- Structure: Step 0 baseline → Step 1 surgeries → Step 2 route cascades + tests →
  Step 3 orphaned shared code → Step 4 full gates → Step 5 live walk → Step 6 report.
- FILES I WILL NOT TOUCH section: the full KEEP manifest + rulings + package.json.
- Verify preconditions the OPERATOR must have performed: clean tree, dedicated
  branch. If not met, STOP and hand them the commands (git ban — you never run git).

## 2. Execute (approved plan only)

**Step 0 — Baseline:** `tsc --noEmit` clean · `npm test` matches the last known
green. Pre-existing red STOPS the task (never delete on a broken baseline).

**Step 1 — Surgeries:** every retarget/removal from the Phase 1 retarget list.
KEEP surfaces must never link a dead route, even transiently (A-6).

**Step 2 — Route-group cascades + their tests:** delete each group whole with its
exclusive components and test files in one stroke. Before deleting any directory,
list ALL contents and enumerate non-code stragglers (A-2). Clear the build cache
before the first post-deletion `tsc` (A-3). Gate: tsc clean; tests already at the
predicted count.

**Step 3 — Orphaned shared code:** components/services/stores/types/utils whose
consumers died in Step 2. Extract-and-keep any live file inside a dying folder
(run 1: ThemeToggler, SpinnerLarge). Remove emptied directories. Gate: tsc clean.

**Step 4 — Full gates:** tsc · build — route table matches the predicted shape
EXACTLY (nothing extra, nothing missing) · `npm test` == predicted count EXACTLY
(A-7). Any deviation: STOP and report; do not push through.

**Step 5 — Live walk (prod build, real auth):** anonymous root → auth-gate chain ·
login renders (surgeries visible) · authed walk of EVERY app screen (200 + content
marker) · logout → gate re-engages · EVERY dead route returns 404. The dead-route
sweep is mandatory — prove the corpses are dead.

**Step 6 — Report + durability:** result artifact to RESPONSES: final counts,
changes made, things untouched, concerns, the NEW test baseline declared
going-forward, lessons (new anti-patterns here; trickle-ups to other skills named).
EMIT blessed-KEEP durability: header comment on every ruled zero-consumer KEEP +
`KEEP_MANIFEST.md` in the repo's agent_docs (A-10). Clean or loudly list script/
config fossils per rulings (A-11). Remind the operator: commit point + the G6
visual pass is a NAMED GATE — the shed is not closed until their eyes pass it
(A-9). You do not commit.
