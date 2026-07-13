# ANTI_PATTERNS — stark-kit-residue-cleaner

> Field-earned. Every entry cost something once. Read before Phase 1.

| Version | Date | Notes |
|---|---|---|
| v0.9.1 | 2026-07-10 | Seeded from the MissionControl run + close-out retro (A-9, A-10) |

## A-1 — Single-line import grep falsely orphans files

`^import.*from` MISSES multi-line imports (`} from "..."` on its own line). In run 1
this falsely orphaned `ui/breadcrumb` and `ui/alert-dialog` — files the app's live
screens depended on. A wrong DELETE there breaks production screens.
**Rule:** build the edge map with a bare `from "..."` pattern; spot-check any
zero-consumer verdict on a file the app's screens plausibly use.

## A-2 — Code-only traces are blind to non-code files

The import trace maps `.ts/.tsx` consumers. READMEs, fixtures, images, and notes
riding inside deleted directories are invisible to it. Run 1 discovered a stray
`__tests__/superadmin/README.md` only because whole-directory deletion swept it.
**Rule:** before deleting a directory, list ALL its contents; enumerate non-code
stragglers in the plan so the path count is honest.

## A-3 — Stale build cache fails the first post-deletion typecheck

`.next/` holds GENERATED route validators referencing deleted pages. The first
`tsc` after a cascade can fail with phantom errors showing zero `src/` problems.
**Rule:** clear the build cache before the first post-deletion `tsc`; let the
Step-4 build regenerate fresh validators, then re-verify.

## A-4 — Trusting the report's arithmetic

Run 1's recon claimed 102 files; plan-mode recount found 101 (a bucket miscount).
**Rule:** Phase 2 recounts the kill list by enumeration before presenting the plan.
Disk wins — even over our own reports.

## A-5 — Deleting infrastructure as if it were curriculum

Zero-consumer is NOT sufficient for deletion. Client factories, middleware, role
resolvers are blessed infra that later phases consume (run 1: client.ts/admin.ts
kept by ruling; they will look "dead" to future recons until consumed — expected).
**Rule:** anything in the manifest's BLESSED-INFRA table is a QUESTION, never a
silent delete.

## A-6 — Deleting before retargeting

If a KEEP surface references a soon-dead route (run 1: the login page's
forgot-password link → /auth; the confirm route's failure redirect → /error),
deleting first leaves a live page linking a 404.
**Rule:** surgeries are STEP ONE, before any deletion. Hunt the full reference map
INTO soon-dead routes from KEEP surfaces; each gets a retarget/removal ruling.

## A-7 — Panic at the shrinking test count

Kit tests die with kit surfaces. 81 → 8 is shedding, not regression — but only if
predicted in advance.
**Rule:** the predicted post-cleanup baseline is computed in Phase 1 and gated
EXACTLY in Phase 2. Declare the new number as the repo's going-forward baseline.

## A-8 — Assuming instead of tracing the app's own dependencies

Run 1's architect expected the app to consume `useAuthStore`; the trace proved the
app called the api routes directly and the store was kit-only.
**Rule:** the KEEP manifest is COMPUTED per app, file by file, with evidence.
Nobody's memory of the architecture outranks the edge map.

## A-9 — The curl walk masquerading as the visual gate

A 200 with a content marker proves the SERVER rendered a route — client-rendered
screens sit behind skeletons, so what the human sees rode on nothing. Run 1's blank
dashboard chart passed tsc, build, AND tests before an eyeball caught it.
**Rule:** G5 (mechanical walk) and G6 (operator visual pass, both themes, mobile
drawer) are two named gates. The skill is not done until the operator's eyes say so.

## A-10 — Unmarked blessed KEEPs get re-litigated forever

A zero-consumer file kept by a ruling recorded only in session logs looks like an
orphan to every future recon, and someone re-argues the delete each time.
**Rule:** the cleanup EMITS durability: a header comment on each blessed file
(`// BLESSED INFRA — kept unconsumed by ruling <date>; <expected consumer>`) and a
KEEP_MANIFEST.md at the repo's agent_docs root listing every ruled KEEP with its
reason and expected consumption phase.

## A-11 — Script and config fossils outlive their targets

Deleting packages/files while leaving `package.json` scripts or configs that
reference them plants a UX bug: the operator runs `npm run test:e2e` hours later
and hits a dead pointer. **Rule:** Phase 1 hunts script/config references into
kill-list targets; Phase 2 either cleans them (if ruled in scope) or lists them
loudly in the result's concerns.
