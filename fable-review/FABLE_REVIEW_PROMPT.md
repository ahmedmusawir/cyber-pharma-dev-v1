# FABLE 5.1 — CYBER PHARMA DEV INDEPENDENT CODE REVIEW (preserved instruction set)

> This file preserves the complete instruction set that governed this review,
> for audit and reproducibility. Verbatim as received.

# FABLE 5.1 — CYBER PHARMA DEV INDEPENDENT CODE REVIEW
# Review date: 2026-09-13

You are performing a deep independent senior/principal engineering review of this repository.

REPOSITORY: cyber-pharma-dev-v1
REVIEW BRANCH: fable-code-review-13sep2026
PINNED SOURCE SNAPSHOT: f1113177a5250e46136671ae4845659bda58f359

This SHA represents the clean main snapshot before review artifacts are added.
This branch exists only to preserve review evidence.
THIS BRANCH WILL NOT BE MERGED INTO MAIN.
Application source is READ ONLY.
Tony Stark retains all git authority.

## 1. FIRST ACTION — VERIFY REVIEW STATE
Confirm repository name; confirm branch is `fable-code-review-13sep2026`; confirm pinned SHA
`f1113177a5250e46136671ae4845659bda58f359` exists; inspect git status read-only; record any
unexpected/pre-existing changes. Do NOT switch/reset/stash/stage/commit/push or modify source.
If source state materially differs from the pinned snapshot, STOP and report it.

## 2. CREATE REVIEW WORKSPACE
Create ONLY `fable-review/` containing `FABLE_REVIEW_PROMPT.md` (preserve the complete
instruction set), `FABLE_CODE_REVIEW.md` (final authoritative report), and `RUN_NOTES.md`
(repo, branch, pinned SHA, start time, versions, architecture, commands, gate results,
environment limitations, unavailable services, interruptions, source-not-modified confirmation).
Do not create files outside `fable-review/` unless explicitly authorized.

## 3. CHANGE BOUNDARY — STRICT
Review only. MAY read/search/inspect source, config, components, routes/actions, state,
mocks/fixtures, types, tests, dependency metadata, docs, git history (read-only); run existing
safe verification (typecheck, lint, tests, production build, non-destructive `npm audit`); write
ONLY under `fable-review/`. MAY NOT modify source/tests/fixtures/deps/config/env/database/
Supabase, contact or mutate production services, or perform any git mutation. If stronger
verification would require mutation, report what evidence would be needed instead.

## 4. IMPORTANT REVIEW CONTEXT
Do NOT assume a production backend. First determine from the repository whether it is
frontend-first, whether data is mock/fixture/local, whether real backend integration exists,
whether Supabase is wired but inactive, which behaviors are placeholders vs authoritative.
Do not invent backend vulnerabilities against systems absent from this snapshot. For mock-backed
interfaces review frontend correctness, contract coherence, mock-to-real seam safety, and
embedded assumptions. Separate CURRENT DEFECT from FUTURE INTEGRATION RISK (mandatory).

## 5. WHY THIS APPLICATION MATTERS
Treat it as intended to evolve into a real operational Cyber Pharma system (pharmacy/claims/
users/roles/tenant data/financials/uploaded reports/pricing/subscription state). Do NOT claim
any are live unless the repository proves it. Identify frontend/contract problems that could
become expensive or unsafe once real services are connected.

## 6. FIRST MAP THE ACTUAL SYSTEM
Establish Next.js version, App Router structure, route groups, component/server-client
boundaries, state management, forms, data-access abstraction, mock architecture, service/API
abstraction, auth/RBAC, user/tenant concepts, key types, report/file handling, calculations,
filtering/search, responsive structure, test infra, build/deploy assumptions. Document a concise
system map before deep findings.

## 7. PRIMARY REVIEW PRIORITIES
A. Mock-to-real service seams (highest priority). B. Data contracts/types. C. State management/
ownership. D. User/role/tenant assumptions. E. Forms/input/validation. F. Calculations/business
logic. G. Tables/filters/search/sort. H. Report/file UX. I. Frontend architecture. J. Next.js/
React correctness. K. Error/loading/empty states. L. Responsive/mobile UX. M. Accessibility
basics. N. Test quality (what tests protect, not counts). O. Dependencies/build/tooling
(installed-vuln vs demonstrated exposure). P. Performance (only with algorithmic evidence or
measurement).

## 8. REVIEW SEQUENCE
Map → baseline → trace primary journeys → trace domain data → trace mock-to-real seams →
state/concurrency → calculation/contract → UX/responsive/failure states → test fidelity →
breadth pass → challenge → compress → self-critique.

## 9. EVIDENCE MODEL
E0 hypothesis · E1 source/artifact · E2 controlled execution (declared mocks/fixtures) ·
E3 real boundary/integration · E4 deployment-representative. Do NOT upgrade mock behavior into
production claims. Separate DIRECTLY OBSERVED / SOURCE INFERENCE / FUTURE-INTEGRATION ASSUMPTIONS
/ DEPLOYMENT ASSUMPTIONS.

## 10. FINDING CLASSIFICATION
DEFECT · CONDITIONAL RISK/UNRESOLVED CONCERN · FUTURE INTEGRATION RISK · TRADEOFF · OPTIONAL
IMPROVEMENT · VERIFICATION/TOOLING DEFECT · POSITIVE PROTECTION. FUTURE INTEGRATION RISK is
especially important; do not count such risks as proven production defects.

## 11. SEVERITY AND CONFIDENCE
Severity: CRITICAL / HIGH / MEDIUM / LOW / UNRATED-FUTURE-RISK. Confidence: HIGH / MODERATE /
LOW. Separate confidence in a current frontend defect from confidence in a future system
consequence.

## 12. REQUIRED FINDING FORMAT
ID · bounded title · classification · severity/future-risk level · confidence · evidence level ·
exact location(s) · expected contract/invariant · data/state/execution path · directly observed ·
source inference · future-integration assumptions · deployment assumptions · user/engineering
impact · falsifier/downgrade evidence · root-cause group. For future-integration findings answer:
what is safe today because it is mock-only; what changes when a real backend replaces the mock;
what guardrail should exist before that swap. Do NOT prescribe a full implementation redesign.

## 13. FALSIFIABILITY
For every significant finding: smallest realistic evidence another engineer could show to
withdraw/narrow/downgrade it. Differentiate disproving today's defect / proving intentional mock
behavior / reducing future risk / a protection existing elsewhere.

## 14. ROOT-CAUSE COMPRESSION
Group symptoms sharing causes; do not force groups the evidence does not support.

## 15. POSITIVE PROTECTIONS
Record meaningful safeguards worth preserving; scope claims carefully.

## 16. UNDER-REVIEWED AREAS
Explicitly identify what could not be verified; distinguish "no real backend exists" from
"backend exists but unavailable" etc. Do not turn absent backend evidence into "safe" or
"vulnerable".

## 17. MANDATORY SELF-CRITIQUE
Three strongest and three weakest consequential findings; severities possibly over/understated;
shared root causes; under-reviewed areas; wording that outruns evidence; what another reviewer
should challenge first. Withdraw/narrow/downgrade/reclassify findings that fail the critique.

## 18. IMMEDIATE RISK RULE
On evidence of exposed real production credentials / live sensitive-data access / reachable
unauthenticated destructive ops / cross-tenant exposure / another plausible current P0: do NOT
exploit, do NOT fix, notify Tony as "POTENTIAL CURRENT P0" with finding/evidence/proven/assumed/
containment. Otherwise continue.

## 19. FINAL REPORT
Write `fable-review/FABLE_CODE_REVIEW.md` with sections 1–19 as specified (Executive Assessment;
Snapshot/Boundary; Architecture-Data-State Map; Mock vs Real Integration Map; Verification
Baseline; Primary User Journey Assessment; Findings Summary table; Detailed Findings; Root-Cause
Themes; Mock-to-Real Integration Risks; State/Contract/Calculation Assessment; Frontend UX/
Responsive/Accessibility; Positive Protections; Test/Verification Quality; Concerns/Tradeoffs/
Optional Improvements; Under-Reviewed Areas; Reviewer Self-Critique; Prioritized Handoff with
P0/P1/P2/FUTURE-GATE/QUESTION; Change Boundary Confirmation). Do NOT implement remediation.

## 20. FINAL STANDARD
The mission is to determine whether the frontend is technically sound; whether state and
calculations are correct; whether primary journeys work; whether contracts are coherent; whether
mocks hide dangerous assumptions; whether the architecture gives a clean path to real services;
whether tests provide meaningful confidence; which issues are real today; which matter before
backend integration. Evidence beats assertion. Root causes beat symptom counts. Reproducibility
beats confidence. Current defects and future integration risks must remain separate.
