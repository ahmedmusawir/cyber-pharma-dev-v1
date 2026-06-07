# Playbook 00 — Overview

> The phase-by-phase build plan for Cyber Pharma v1 Phase 1 Foundation Skeleton.

---

## The Phases

Phase 1 work proceeds through these sub-phases. Each has a verification gate. **Do not advance until the gate passes.**

```
0. Discovery  →  1. Types & Contract  →  2. Service Layer  →  3. Mock Data
                                                                      ↓
                                                                4. Components
                                                                      ↓
                                                                5. Verification
                                                                      ↓
                                                                6. Retrospective
```

Note: this is the FFM's internal sub-phasing. The outer "Phase 1" (Foundation Skeleton) of the Cyber Pharma 8-phase roadmap is one of those eight. Don't confuse the two scales.

---

## Sub-Phase Summary

| Sub-Phase | What Ships | Estimated Time | Approval Gate |
|---|---|---|---|
| 0 — Discovery | Acknowledgment summary, Phase 0 plan | 10-15 min | Operator confirms scope, forbidden zones, plan |
| 1 — Types & Contract | TypeScript types in `/src/types/` matching DATA_CONTRACT | 30 min | `tsc --noEmit` clean, all types present |
| 2 — Service Layer | `authService` + `roleService` in `/src/services/` | 1 hour | Service contracts match DATA_CONTRACT, no component imports Supabase |
| 3 — Mock Data | Test fixtures in `/src/mocks/auth.ts` | 30 min | All fixtures satisfy types, Vitest can import them |
| 4 — Components | Placeholder pages + login/register + role-gated layouts + brand tokens | 2-3 hours | All routes navigable, role gates hold, brand applied |
| 5 — Verification | Smoke tests + E2E + deploy + env var check | 1-2 hours | All 15 hard gates from APP_BRIEF pass |
| 6 — Retrospective | `RUN_001_LESSONS.md` drafted | 30 min | Operator reviews, lessons captured |

**Total estimated time:** 1-2 sessions (per PHASE_ROADMAP).

---

## Skill Activation Per Sub-Phase

The `stark-frontend-first` skill is active throughout. The Anthropic-official skills activate as needed:

| Sub-Phase | Custom Skill | Anthropic Skills Likely To Trigger |
|---|---|---|
| 0 Discovery | stark-frontend-first | none |
| 1 Types | stark-frontend-first | none |
| 2 Services | stark-frontend-first | none |
| 3 Mocks | stark-frontend-first | none |
| 4 Components | stark-frontend-first | frontend-design |
| 5 Verification | stark-frontend-first | none |
| 6 Retrospective | stark-frontend-first | skill-creator (if proposing new skills based on lessons) |

---

## Approval Gate Protocol

At each sub-phase boundary, Claudy:

1. Completes the sub-phase's work
2. Writes a structured completion summary:
   ```
   ## Sub-Phase N Complete

   ### What I Did
   - [bullet 1]
   - [bullet 2]

   ### Files Created
   - [list]

   ### Files Modified
   - [list]

   ### Files NOT Touched
   - [confirmed forbidden zones intact]

   ### Tests Run
   - [results]

   ### Concerns / Open Questions
   - [if any]

   ### Proposed Next Sub-Phase
   - [next sub-phase number and brief plan]

   ### Awaiting Approval
   Ready to proceed? Type "approved" or specify changes.
   ```
3. STOPS and waits for operator approval

The AI tool then STOPS and waits. Does not proceed to the next sub-phase until the operator types "approved" or equivalent.

---

## Recovery Protocol

If a session is interrupted, the AI tool resumes by:

1. Reading `RECOVERY.md` at the starter kit project root
2. Reading the current sub-phase's playbook file
3. Re-reading any files mentioned as "in progress" in RECOVERY.md
4. Proposing to the operator: "Last sub-phase completed: X. Current sub-phase: Y, mid-step Z. Proposed continuation: ..."
5. Awaiting approval before resuming

`RECOVERY.md` is updated by the AI tool at the end of every sub-phase, and ideally after each significant within-sub-phase step.

---

## Tests Per Sub-Phase

Unit tests are written DURING the sub-phases where they belong, not deferred to the end:

| Sub-Phase | Tests Added |
|---|---|
| 1 Types | none (types compile-checked instead) |
| 2 Services | service contract tests (each method returns correct shape from mocked Supabase) |
| 3 Mocks | mock data validation (each fixture satisfies its type) |
| 4 Components | LoginForm, RegisterForm, role-gated layout component tests |
| 5 Verification | full test suite run, `npm run build`, deploy verification, manual smoke walkthrough |

**Testing framework:** Vitest + Playwright (verified in Sub-Phase 0 Discovery).

---

## Sequencing With Stark Repo Security

Before Sub-Phase 0 (Discovery) begins, the operator confirms:

- The starter kit has been audited (`npm audit` = 0 vulnerabilities)
- The `stark-repo-security/` bundle is installed in the repo
- The audit findings ledger at `agent_docs/security/` is initialized
- The middleware update from the audit is applied (the security skill flagged this)

If any of the above is incomplete, Sub-Phase 0 surfaces it and pauses until resolved.

---

## Cross-Reference

- For **what** to build, see `_project/APP_BRIEF.md`
- For **data shapes**, see `_project/DATA_CONTRACT.md`
- For **screens and behavior**, see `_project/UI_SPEC.md`
- For **methodology**, see `skills/stark-frontend-first/SKILL.md`
- For **verification criteria**, see `verification/PHASE_GATES.md` and `verification/BUILD_CHECKLIST.md`
- For **forbidden zones**, see `_project/CLAUDE.md`
