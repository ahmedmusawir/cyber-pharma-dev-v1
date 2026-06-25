# Recovery State

> **Updated 2026-06-25** — **Phase 2.2 "Admin Portal Demo Shell" FFM — COMPLETE.** All clusters C0–C6 closed; all gates green incl. Gate M; **Gate 6 retrospective SIGNED OFF.** Phase 2 (OwedBook) done; this FFM lived on branch `phase2.2-admin-portal-1`. Two post-sign-off tasks remain (not gates): commit the final navbar-fix + C6 docs to the feature branch, and promote 2 structural lessons to the central FFM playbook (operator confirming exact file). Parked: DockBloxx linting.

**Last action:** **Phase 2.2 FFM CLOSED — Gate 6 (retrospective) SIGNED OFF.** `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` authored (verdict SUCCESS_WITH_NOTES) + 2 operator edits landed: (1) the commit-to-`main` drift reframed as a **RECURRENCE** of the Phase-2.1 commit-discipline lesson (VM-crash / uncommitted-bundling family) → promoted to a **hard gate** (feature-branch cluster checkpoints, never a bundled sweep to `main`); (2) the Phase-7 harvest checklist rewritten as **specific, decision-tied Coach/Frank prompts** (add-store fields, one-admin model, pricing, jobTitle source, billing surface, excluded platform view). Also fixed a post-C5 regression in the C4-fix navbar dismiss: the theme dropdown portals OUTSIDE the header, so the outside-tap close fired on theme picks (page-nav bug) → added a **Radix-popper guard** + a `ThemeToggler` `onSelect` so a deliberate theme pick closes the menu cleanly. Triad: **tsc 0 / jest 117·25 / build 0**.

**Pending:** NONE — Phase 2.2 fully closed + pushed. All close-out work landed: navbar-fix (`cc388e1`, operator hand-commit), docs-close (`9f74c36`), doctrine promotion (`41f9ba2`), and the `FRONTEND_BUILD_PHASE_PLAYBOOK_v1.1 → _v1.2` rename + 2 live-pointer ref updates (operator committed + pushed — "i pushed the code"). NOTE: final branch topology not re-verified by Claudy (inspection cut off; observed `main` checked out at one point) — operator owns final git state. Only parked item: DockBloxx linting (separate housekeeping, not a gate; memory `post-c6-linting`).

**Next step:** Nothing for Phase 2.2 (closed). When ready: DockBloxx linting pass (Plan Mode first). Session log for this close-out: `agent_docs/SESSIONS/session_2026-06-25.md`.

**Files in flight:** none — working tree clean after the operator's final push (this RECOVERY edit + `session_2026-06-25.md` are the only docs touched after; operator to commit).

## C4b surfaced decisions (K7 — resolved in favor of contract/rulings; Phase-7 revisit)
- **Invite field = "Job title"** (Pharmacist/Technician/Staff → `jobTitle`), NOT the mockup's "Role"; `role` hardcoded `'member'`. NO password, NO permission dropdown.
- **Billing shows SEED amounts/plans** ($49 standard / $199 concierge), not the mockup's uniform "$79/Standard". V1 pricing = a Coach business decision, NOT locked by this demo.
- **Audit Result = Done/Failed** from the enum (mockup's "Sent" is cosmetic).
- **Settings is one page showing `stores[0]`'s settings** (nav is singular but data is per-store) — V1 simplification; Phase 7 = store picker or settings-from-detail.
- **No search box in V1 screens** — services keep `search` params (Phase-7 ready); mockups show no search UI.
- **Add store on Billing** adds a store card but no billing line (service adds store only) — consistent with "no real charge".

---

## Phase 2.2 cluster ledger (branch `phase2.2-admin-portal-1`, no upstream)
- **C0** recon ✅ · **C1** types ✅ `455e6fd` · **C2** store+services ✅ `6710acb` · **C3** seed ✅ `69afcc7` · **C4a** chrome+takeover ✅ `677d51b` · **C4b** 6 screens+Gate M+tests ✅ `fd816a1` · **C4-fix** gutter + add-store harvest form + form-centering + nav dismiss ✅ `7cd9b02` (docs) · **C5** verification + gating greps + operator smoke walk ✅ **Gate 5 signed off** · **C6** retrospective + Phase-7 harvest ✅ **Gate 6 signed off — FFM COMPLETE** (navbar regression fix + retro draft uncommitted, commit teed up). Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).
- Last triad @ C6: **tsc 0 / jest 117·25 / build 0**.

## Data spine (done, frozen — Phase-7 swap point)
- `src/types/adminDemo.ts` — 7 view-models + 6 status vocabs + `AdminDemoState` (DATA_CONTRACT §1–3).
- `src/store/useAdminDemoStore.ts` — plain Zustand (NO persist; refresh resets), service-only mutators + `reset()`.
- `src/services/adminDemo.ts` — 5 services (OwnerStores/StoreMember/Billing/Settings/Audit) via vanilla `getState()`, `BACKEND_SWAP_NOTES (Phase 7)` JSDoc.
- `src/mocks/adminDemo.ts` — `makeAdminDemoSeed({empty?})` (DELETABLE), 4 stores covering every state, const `ADMIN_DEMO_NO_STORES`.
- Tests: `__tests__/services/adminDemo.test.ts` (14, incl. compile-time `@ts-expect-error` no-password) · `__tests__/mocks/adminDemo.seed.test.ts` (9).
- **C2-test anchors — keep stable:** `store-1` + `member-1`(active)/`member-2`(invite_pending)/`member-3`(suspended) + store-1 settings/billing.

## LOCKED rulings (carry into C4)
- **Invite form (V1):** Email + Job title + Send invite. NO password field, NO access/permission dropdown. `inviteMember` role hardcoded `'member'` at the form call site (service signature frozen, keeps `role` param). Job title = Pharmacist/Technician/Staff (demo-only `jobTitle`, flagged). One admin = owner (onboarding); 2nd admins only via MissionControl. (Confirmed w/ Coach + Frank — see memory `admin-v1-single-admin-model`.)
- **Navbar:** identical `--navbar: 12 83% 47%` BOTH modes — **no change**; `globals.css` untouched. (FFM doc's "bump to 12 88% 58%" is stale.)
- **Billing:** visual-only, NO audit entry (K7 — no AuditAction vocab covers billing).
- **Seed fix DONE in C4b:** `member-5` `role:'admin'`→`'member'` in `src/mocks/adminDemo.ts` (V1: no non-owner admin; invisible since role isn't rendered).

## DO NOT TOUCH
`AuthedShell`, `Navbar`, `globals.css`, `/owedbook`, `/profile`, **`/moose-portal`**, `(members)`; C1–C3 files frozen except the one member-5 seed fix.

## Recon-locked facts (authoritative)
- Stack: Next 16.2.1 / React 19.2.4 / TS strict / Tailwind 3.4.1 (HSL+config) / **Jest**. `proxy.ts` not `middleware.ts`.
- Auth: `useAuthStore` (client) + `supabase.auth.getUser()` (server); `protectPage([AppRole.X], { unauthorizedRedirect })` from `@/utils/supabase/actions`; `(admin)/layout.tsx` already gates `[AppRole.ADMIN]` → bounce `/owedbook`. AppRole from `@/utils/app-role`.
- Reusables for C4: `AuthedShell`/`AdminSidebar`(surface-aware)/`Navbar` verbatim; `DataTable` (desktop→mobile cards → use for Audit), `EmptyState`, `StatusChip` (pill pattern), shadcn ui present, `useToast`, skeleton = `bg-muted animate-pulse`.
- `.env.local` at repo root — DO NOT read or commit.

## Spec authority (Phase 2.2)
FFM at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_admin_portal_ffm/`. Order: `_project/CLAUDE.md` (rulings) > `_project/APP_BRIEF.md` (gates + one hard rule) > `_project/DATA_CONTRACT.md` (shapes) > `_project/UI_SPEC.md` > `_design/HTML/` mockups > `_design/PNG-S/`. Gates: `verification/PHASE_GATES.md` (Gate 0–6 + Gate M). Cluster map: `playbook/00-OVERVIEW.md`.
