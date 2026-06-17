# CLAUDE.md — Cyber Pharma v1 / Phase 2 FFM

> Entry point. Navigation contract for any AI coding tool opening this module. Read this first.

## What This Module Is

The **Cyber Pharma v1 — Phase 2 Frontend-First Module**: build the OwedBook to production visual fidelity on **demo data through a service layer**, on the Phase-1-hardened foundation. Authored from a verified `stark-recon` Recon Report (Recon Mode, Stage 0 — FFM_PLAYBOOK v1.2).

**Owner:** Stark Industries. **Operator:** Tony Stark (Moose). **Engineer:** Claudy.

## What's Different About This FFM (vs Phase 1)

| Aspect | Phase 1 | Phase 2 (this) |
|---|---|---|
| Goal | Foundation skeleton | OwedBook visual fidelity |
| Source of truth | (greenfield) | **Recon Report** (post-Phase-1 ground truth) |
| New primitives | 0 | 3 KIPs (DataTable, MultiSelect, EmptyState) — built FIRST |
| Data | none/auth only | demo fixtures via `owedBookService` (first real domain service) |
| Tokens | installed | **inherited, not reinstalled** |
| Frank tables | none | still none (Phase 3) |

## Vendor Neutrality

Tool-agnostic. Claude Code reads this `CLAUDE.md`; Codex via `AGENTS.md`; Gemini via `GEMINI.md` (both redirect here).

## Reading Order (MANDATORY)

1. This file
2. `_project/CLAUDE.md` — Phase 2 spine (recon-locked facts, forbidden zones)
3. `_project/APP_BRIEF.md` — scope, 15 hard gates
4. `_project/DATA_CONTRACT.md` — OwedBook types + `owedBookService` + Phase-3 swap notes
5. `_project/UI_SPEC.md` — 3 KIPs + OwedBook screen, responsive transforms
6. `playbook/00-OVERVIEW.md` — the cluster plan, then each playbook file on demand
7. Skills under `skills/` auto-activate
8. `_design/` — OwedBook visual targets (now BUILD targets) + inherited tokens
9. `_extraction/` — minimal (recon report reference)

Conflict resolution: DATA_CONTRACT (shapes) > UI_SPEC (behavior) > `_design` tokens (values) > `_project/CLAUDE.md` (scope) > this file (structure). Recon-locked facts override stale docs. Else STOP, surface.

## Activation Contract

Operator stages this at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/` on the `phase-2` branch and boots Claudy:

> "Read `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/CLAUDE.md` and follow its Reading Order. Produce a Cluster-0 discovery summary and STOP for my approval. Recon already ran — the report at `agent_docs/recon/` authored this FFM; do not re-recon unless something changed."

## Forbidden Zones (Hard Stops)

See `_project/CLAUDE.md` for the full list. Headlines: no Frank tables (Phase 3); KIPs before the screen; components call the service not mocks; no auth wrapper; no numbered colors; tokens inherited not reinstalled; no kit-infra fixes; no deploy.

## Skill Inventory

Ships: `skills/stark-frontend-first/`. Operator installs to `.claude/skills/`: frontend-design, skill-creator, webapp-testing, stark-frontend-first. (`stark-recon` already ran upstream.)

## What Is Reusable vs Per-Project

Reusable (copied forward from Phase 1): root nav files, `skills/`, `playbook/`, `verification/`. Per-project (authored from recon): `_project/` (all 4), `_design/`, `_extraction/`. Accumulates: `playbook/RETROSPECTIVES/RUN_002_*`.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-09 | Initial Phase 2 FFM. Authored from `RECON_cyber-pharma-v1_phase2_2026-06-08.md` via FFM_PLAYBOOK v1.2 (Recon Mode Stage 0). KIPs-first; demo-via-service; tokens inherited. |

🛡️ End of navigation contract. Read `_project/CLAUDE.md` next.
