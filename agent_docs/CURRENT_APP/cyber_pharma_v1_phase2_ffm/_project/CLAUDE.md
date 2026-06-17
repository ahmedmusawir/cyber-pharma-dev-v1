# _project/CLAUDE.md — Cyber Pharma v1 / Phase 2 / Project Spine

> Project-specific direction. Read AFTER the module root `CLAUDE.md`. Authority on scope, forbidden zones, tech stack, operating rules for Phase 2.

---

## Project Identity

**Project:** Cyber Pharma v1 · **Phase:** 2 of 8 — Visual Fidelity (OwedBook, demo data)
**Repo:** `cyber-pharma-dev-v1` (single app; Phase-1-hardened; build on a `phase-2` branch)
**Predecessor:** Phase 1 closed 15/15. **Mission:** bring the OwedBook to production visual fidelity on demo data through a service layer.

## Hero Outcome

> Open `/admin-portal` → OwedBook with live-looking demo data across 4 tabs, PBM/date filtering, mobile card-reflow + filter drawer, Mist↔Slate holding — all flowing through `owedBookService`, swap-ready for Phase 3's real backend with zero component changes.

## Recon-Locked Facts (authoritative — do NOT re-derive, do NOT contradict)

- **Stack:** Next 16.2.1 / React 19.2.4 / TS strict / Tailwind 3.4.1 (HSL+config) / **Jest** (NOT Vitest). `proxy.ts`, not `middleware.ts`.
- **Tokens:** inherited from Phase 1 `src/app/globals.css` (v1.1 dark patch). **Do NOT reinstall or re-theme.** Semantic utilities only.
- **Auth:** `useAuthStore` (client) + `supabase.auth.getUser()` (server); role via `getUserRole()` → `user_roles`; `protectPage([AppRole.ADMIN])`. **No auth-service wrapper — ever.**
- **AppRole:** import from `src/utils/app-role.ts` (canonical), not `get-user-role.ts`.
- **Env var names (verbatim):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`. NEVER the legacy `ANON_KEY`/`SERVICE_ROLE_KEY`.
- **Test baseline:** 42/42 across 6 suites — preserve, add on top.
- **DB:** 2 kit tables (`user_roles`, `profiles`); 13 Frank tables do NOT exist (Phase 3).

## Forbidden Zones (Hard Stops — Phase 2)

- ❌ Creating ANY Frank-domain table or migration (Phase 3). Demo data = fixtures in `src/mocks/owedbook.ts`.
- ❌ Building the OwedBook screen before the 3 KIPs exist + pass tests (G4).
- ❌ Components importing `src/mocks/` directly — they call `owedBookService` only (G7).
- ❌ An auth-service wrapper (kit auth is complete; consume directly).
- ❌ Numbered Tailwind colors anywhere in `src/components/` or `src/app/` (G10). `--chart-*` for KPI tiles.
- ❌ Reinstalling/re-theming tokens (inherited from Phase 1).
- ❌ Real upload / fetch / math wiring (Phase 5), reports/PDF/email/GHL (Phase 6), Stripe (Phase 7).
- ❌ Touching kit infra: `command.tsx` `as any`, `server.ts` cookies cast, sass dep (v3 harvest).
- ❌ Superadmin anything. ❌ ANY deploy work (separate dept).
- ❌ `dangerouslySetInnerHTML`, `any` types, Pages Router, roles in `user_metadata`.

## What Phase 2 Ships

Cluster 0 orphan cleanup (delete `SuperadminSidebar.tsx`, `DashboardCard.tsx`, empty `admin/`+`members/` dirs) → Cluster 1 the 3 KIPs (DataTable, MultiSelect, EmptyState, each tested) → Cluster 2 OwedBook screen (4 KPI tiles, 4 tabs, filter rail, pager, status chips) → Cluster 3 `owedBookService` + demo fixtures → Cluster 4 responsive + verification.

## Lessons Carried From Phase 1 (RUN_001)

- Server shell + client island for nav/interactive surfaces.
- Real-screen dark-mode check before declaring any visual done (style tile insufficient).
- Complex layouts transform at `lg:`, not `md:`.
- Grep-at-close on every verifiable gate (no sample-then-trust).
- `rm -rf .next` before tsc smoke between deletion batches.
- Continuous seam-walk in every auth state catches what isolated gates miss.
- Tests for deleted code die with the source — baseline re-counted fresh.

## Skills Loaded

`stark-frontend-first` (mandatory — declares this phase), `frontend-design`, `skill-creator`, `webapp-testing`. (`stark-recon` already ran — its report authored this FFM.)

## Operating Rules (inherited Stark global)

Plan Mode mandatory · Karpathy Protocol (you're the hands) · eyesight-aware (explanations before code) · surgical changes · surface conflicts don't average · fail loud · grep-at-close.

## TDD Flow

Build → Unit/Component Test → Integrate → Block Test → System (seam-walk) → Finalize. Runner is **Jest** (recon-verified). Each KIP tested before consumed; full triad (tsc + Jest + build) + seam-walk at verification.

## Approval Gates

Cluster 0 (cleanup) · Cluster 1 (3 KIPs) · Cluster 2 (OwedBook screen) · Cluster 3 (service + mocks) · Cluster 4 (responsive + verification) · Retrospective. Claudy STOPS at each; operator approves.

## Conflict Resolution

`DATA_CONTRACT` wins on shapes · `UI_SPEC` on UI behavior · `_design/` tokens on values · this file on scope/forbidden zones · root `CLAUDE.md` on module structure · Stark global on universal doctrine. Recon-locked facts override any stale doc. Persisting conflict → STOP, surface.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-09 | Initial Phase 2 spine. Recon-locked facts, KIPs-first, demo-via-service, Frank tables Phase 3, auth direct, tokens inherited. |
