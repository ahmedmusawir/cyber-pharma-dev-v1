# Recovery State

> **Updated 2026-06-26** — **Phase 2 COMPLETE (2.1 OwedBook + 2.2 Admin Portal Demo Shell)**, plus post-FFM housekeeping done: **ESLint setup + safe fixes** and a **moose-style navigation spinner**. 📒 **Master reference: `phase2.md` at repo root — read RECOVERY + `phase2.md` + the latest session log and you're fully up to date.** Current working branch: `linting-1` (linting + spinner changesets uncommitted there — operator owns git).

**Last action:** Two post-FFM housekeeping passes on branch `linting-1` (both **tsc 0 / jest 117·25 / build 0**, lint **0 errors**): (1) **ESLint from zero** — Next 16 / ESLint 9 flat config (`eslint.config.mjs`, DockBloxx rules byte-faithful: no-unused-vars + no-explicit-any as warn, `^_` ignore added for frozen Phase-7 params), `"lint": "eslint ."` (next lint is gone in Next 16), fixed the 17 preset errors (no-require-imports→ESM imports + a `grid-auto-fit` type shim; empty-interface→type alias) and downgraded `react-hooks/set-state-in-effect`→warn (review-later, incl. known Navbar fetchUser); cleaned the safe unused-vars (incl. Logout now logs the real error), deleted dead dup `logout/route-1.ts`, added `scripts/lint-check.sh` (grouped manual lint summary), ignored `agent_docs/**`. (2) **Navigation spinner** — root-layout overlay (`NavigationSpinner`) shows `SpinnerLarge` on every primary-nav request across owedbook/admin/profile/moose, driven by `useLinkStatus` probes (desktop/sidebar) + direct `setPending` on mobile-menu + logo clicks (probe unmounts with the closing panel), min-display ~400ms (mock data is instant), cleared on `usePathname` change; `(public)/loading.tsx` upgraded to `SpinnerLarge` for redirect consistency.

**Pending:** Operator git only — two clean changesets uncommitted on `linting-1` (see Files in flight). NOT a gate. Also flagged: an unstaged deletion of `agent_docs/APP_FACTORY/STARTER_KIT_HANDBOOK_v1.0.md` that is **not Claudy's** — operator to restore or keep.

**Next step:** Nothing functional outstanding. Operator to commit the two changesets (linting / spinner) on `linting-1`. Reference docs: `phase2.md` (master) + `agent_docs/SESSIONS/session_2026-06-26.md`.

**Files in flight (uncommitted on `linting-1`):** Linting — `eslint.config.mjs`, `package.json`, `package-lock.json`, `tailwind.config.ts`, `types/tailwind-grid-auto-fit.d.ts`, `src/components/ui/{input,textarea}.tsx`, `src/components/auth/Logout.tsx`, `src/utils/supabase/{server,middleware,actions}.ts`, `src/app/api/auth/login/route.ts`, `logout/route.ts`, deleted `logout/route-1.ts`, `scripts/lint-check.sh`. Spinner — `src/store/useNavSpinner.ts`, `src/components/layout/{LinkPendingProbe,NavigationSpinner}.tsx`, `src/components/layout/AuthedShell.tsx`, `src/components/global/Navbar.tsx`, `src/app/layout.tsx`, `src/app/(public)/loading.tsx`. Plus docs: `RECOVERY.md`, `phase2.md`, `agent_docs/SESSIONS/session_2026-06-26.md`. (Stray, not Claudy's: deletion of `STARTER_KIT_HANDBOOK_v1.0.md`.)

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
