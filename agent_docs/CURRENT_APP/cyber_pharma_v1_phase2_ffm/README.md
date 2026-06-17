# README — Cyber Pharma v1 / Phase 2 FFM

> For the operator (Tony). AI tools start with `CLAUDE.md`.

## What This Is
The Phase 2 FFM — OwedBook at production visual fidelity on demo data via a service layer, on the Phase-1-hardened repo. Authored from a verified recon report (Recon Mode, Stage 0).

## Quick Start
1. `git checkout -b phase-2` (Phase 1 is safe on main + GitHub).
2. Stage this folder at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2_ffm/`.
3. Confirm `_design/phase2-reference/` has the OwedBook PNGs (Mist, Slate, Federal, mobile Mist/Slate) — they're now BUILD targets.
4. Confirm `.claude/skills/` has the 4 skills (frontend-design, skill-creator, webapp-testing, stark-frontend-first). Launch Claude Code from `agent_docs/` (recon-documented CWD).
5. Update `PROJECT_POINTER.md` (or root pointer) to name this FFM.
6. Boot Claudy with the activation prompt in `CLAUDE.md`.

## The Run (clusters)
0. Orphan cleanup (delete SuperadminSidebar, DashboardCard, empty dirs)
1. The 3 KIPs (DataTable, MultiSelect, EmptyState) — built + tested FIRST
2. OwedBook screen (KPI tiles, 4 tabs, filter rail, pager, status chips)
3. `owedBookService` + demo fixtures (the swap-stable spine)
4. Responsive (rail→drawer, table→cards) + full verification

Claudy STOPS at each cluster for your approval.

## Recon-Locked (don't let Claudy contradict)
Next 16.2.1 / React 19.2.4 / Tailwind 3.4.1 / **Jest** · tokens inherited (don't reinstall) · auth direct (no wrapper) · env names: URL/PUBLISHABLE_KEY/SECRET_KEY/SITE_URL · no Frank tables (Phase 3) · KIPs before the screen.

## Sequencing Note
This FFM is Phase 2 ONLY. Phase 3 (schema + RLS + swap service mock → real) gets its own FFM, authored after the Phase 2 retrospective and a fresh recon.

## Version
v1.0 — authored 2026-06-09 from the Phase-2 recon report.
