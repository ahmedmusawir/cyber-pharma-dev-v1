# stark-kit-residue-cleaner — Phase 2 RESULT (COMPLETE)

**Repo:** cyber-pharma · **Branch:** `repo-cleaner-v1` · **Date:** 2026-07-14
**Skill:** stark-kit-residue-cleaner v0.9.2 — first activation, closed.

## Outcome: clean shed, all gates green, zero deviations

**12 paths deleted + 3 files modified.** No route/page/rendered component touched.

### Gates
| Gate | Predicate | Result |
|---|---|---|
| G0 baseline | tsc 0 + 25/118 pre-deletion | ✓ pinned |
| find-recount | deleted == 12 exactly | ✓ 12/12 (enumerated before rm) |
| G1 tsc | 0 errors post-cache-clear | ✓ 0 |
| G4 tests | 25 suites / 118 tests EXACTLY | ✓ 25/118 (unchanged, as predicted) |
| G3 build | green + route table unchanged | ✓ 22 routes, identical shape |
| G5/G6 live+visual | — | **N/A-by-construction** (see below) |

**G5/G6 N/A-by-construction:** all 12 deletions were zero-consumer leaf files —
no route, page, layout, or in-render-tree component was removed. The route table
is byte-identical to pre-shed. No screen changed, no auth chain touched. Per A-9 we
do NOT fake a visual pass; here there is genuinely no rendered surface delta to walk.

## Two-way diff summary

**Deleted (12):**
`types/UserRole.ts` · `mocks/auth.ts` · `utils/supabase/fetchUserData.ts` ·
`components/common/{Page,Box,Row,Container,BackButton}.tsx` ·
`components/ui/{table,pagination}.tsx` · `types/AuthSnapshot.ts` · `types/User.ts`

**Modified (3):**
- `src/utils/supabase/admin.ts` — blessed-infra header marker (A-10) + Phase-3 reconcile note
- `package.json` — removed dead `test:integration` script (A-11)
- `RECOVERY.md` — refreshed to post-shed state

**New docs:** `agent_docs/KEEP_MANIFEST.md` (Q3 blessed + Q2 ledger) · this RESPONSES set · `session_2026-07-13.md`

**Untouched (per rulings & scope):** `(public)` landing + NavbarHome/NavbarLoginReg (Q2 KEEP), full auth surface, `/moose-portal`, `/owedbook`, `/profile`, admin-portal, all Phase-1 §B KEEPs, package.json deps (dep-hygiene owns), `_SKILLS/**`.

## Going-forward baseline (declared)
**tsc 0 · jest 25 suites / 118 tests · build green (22 routes).** This is the repo's
new baseline number.

## Concerns / open items (note-only)
- `test:e2e` / `test:e2e:ui` scripts remain; `@playwright/test` is installed but no e2e specs were found under `src`. Not a fossil (tooling present) — flagged for whoever owns e2e.
- `utils/supabase/admin.ts` vs `/moose-portal`'s own service-role client — **duplicate service-role clients; reconcile at Phase 3** (recorded in KEEP_MANIFEST + the file's marker).
- Latent dep orphans (REPORT ONLY, dep-hygiene owns): `stripe`, `dotenv`, possibly `@playwright/test`. Deleting ui/table+pagination freed no radix dep.

## Lessons — trickle-up to the skill (per operator ruling on S-1)

**A-1b — Relative-import trace gap (NEW anti-pattern; accepted for trickle-up).**
Verbatim for `references/ANTI_PATTERNS.md`:

> ## A-1b — Relative imports evade the alias-only edge map
> A-1 covers multi-line imports; it does NOT cover **relative** specifiers
> (`./LoginForm`, `../auth/Logout`, `./User`). An edge map built only from `@/`
> alias imports falsely orphans relatively-imported files. In the Cyber Pharma run
> this (i) falsely orphaned `Logout` (live — consumed by Navbar + UserMenu via
> `../auth/Logout`), and (ii) hid a second-order cascade during Phase 2 planning:
> `mocks/auth` → `AuthSnapshot` → `User` linked entirely by relative imports, so
> the 10-file shed was really 12.
> **Rule:** build the edge map from BOTH `@/`-alias AND relative (`./`, `../`)
> `from "..."` specifiers, resolved to canonical paths. Re-run the second-order
> orphan check after every DELETE-set is fixed, before predicting the final count.

**Manifest drift (S-2, for the maintainer):** for auth-gated apps that keep the kit
auth flow, manifest §A's `(auth)`/`(public)` "demo route groups" are REAL infra, not
curriculum. Consider a manifest note distinguishing "kit demo curriculum" from "kit
infra the app may retain."

**Scope note:** the heavy shed had already happened incrementally in prior sessions;
this run was a 12-file tail cleanup. The skill's exact-count/cascade machinery is
oversized for a tail this small but ran cheaply and caught the second-order cascade —
net positive.

## Commit point (operator owns git)
Working tree ready on `repo-cleaner-v1`: 12 deletions + 3 modifications + 3 new docs.
Suggested message subject: `chore(cleanup): shed 12 kit-residue orphans (clean shed, 25/118 baseline)`.
**I do not commit — that's yours.**
