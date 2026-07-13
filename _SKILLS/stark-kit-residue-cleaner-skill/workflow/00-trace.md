# workflow/00-trace.md — Phase 1: Consumer Trace (read-only)

Output: a kill-list report the operator can rule on. Repo byte-for-byte unchanged.
Mirror the report to `agent_docs/RESPONSES/response_<date>_<HHMMSS>_kitshed-trace.md`
BEFORE printing.

## 0. Environment discovery

`pwd` · `git branch` · `git status` · package.json name · identify the app's OWN
surfaces (its route groups, services, components) vs kit-born surfaces. State the
kit version if determinable; note manifest-version mismatch if any.

## 1. Build the edge map

Extract every import edge in `src/` with a multi-line-safe pattern (bare
`from "..."`). Record the edge count. This map is the ground truth for every
verdict that follows (A-1).

## 2. Classify every manifest surface

For each entry in `references/KIT_DEMO_MANIFEST.md` sections A–C:

- List its consumers from the edge map.
- Verdict: **DELETE** (zero app consumers — evidence: the empty reverse-dep list) /
  **KEEP** (app consumes it — name the consuming files) / **COUPLED** (shared —
  name the exact seam and the surgery that frees it).
- Label every claim: EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION.
- Anything in manifest section D (BLESSED-INFRA) with zero consumers → QUESTION,
  never DELETE (A-5).

## 3. The four hunts

1. **Retarget list:** every reference INTO a soon-dead route (href, redirect,
   fetch target) FROM a KEEP surface. Each one is a pre-deletion surgery (A-6).
   Include middleware/proxy redirect targets.
2. **KEEP manifest:** the complete file-by-file list of kit-born code the app
   consumes (api routes, client factories, resolvers, ui primitives, providers).
   Computed, not assumed (A-8).
3. **Test map:** which suites cover DELETE targets (they die together); which
   survive. Compute the PREDICTED post-cleanup baseline: N suites / N tests.
   Sweep test dirs for non-code files (A-2).
4. **Latent dep orphans:** deps orphaned already + deps orphaned by the shed.
   REPORT ONLY — package.json belongs to a dep-hygiene task.
5. **Script/config fossils:** package.json scripts and config files referencing
   kill-list targets or absent tooling (run 1: a dead `test:e2e` pointer cost the
   operator time the same evening). Flag each for a ruling: clean in Phase 2 or
   list in concerns (A-11).

## 4. Deliver + STOP

Report sections: headline · classification tables · the four hunts · surprises ·
open QUESTIONS for the operator · sequencing constraints for Phase 2 (surgeries
first; cascades whole; cache clear; exact-count gates). Then STOP for rulings.
