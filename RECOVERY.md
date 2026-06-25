# Recovery State

> **Updated 2026-06-25** — Phase 2.2 "Admin Portal Demo Shell" FFM. **C5 Verification CLOSED (Gate 5 signed off).** Phase 2 (OwedBook) is DONE + committed; this is the follow-on admin-portal FFM on branch `phase2.2-admin-portal-1`. Only **C6 (retrospective + Phase-7 harvest)** remains to close the FFM.

**Last action:** **C5 Verification complete — Gate 5 SIGNED OFF by operator.** Automated half (runner): `rm -rf .next && tsc` → 0 · `jest` → **115·25** (incl. invite-no-password / no-charge / owner-scoped invariants) · `build` → 0 · `dev` → clean boot, role gate holds (`/admin-portal` unauth → 307). Gating greps all confirmed absent: no password input (only the Invite callout copy), no `@/mocks` import in components, no direct store import (services only), no numbered Tailwind colors, no `any`, no `dangerouslySetInnerHTML`, no real charge/checkout/platform/super-admin/PHI path. Operator half (eyes-on, his :3000): walked all 6 screens × both themes × 375/tablet/desktop — mock-functional behaviors confirmed (suspend flips pill+toast+audit, invite drops pending row, add-store form drops card, settings save + refresh-resets), empty states good (zero-store via temp `ADMIN_DEMO_NO_STORES` toggle — flipped + reverted, tree clean; "rav" no-match at service/test level since V1 has no search UI; no-pending on store-2/3/4), both round-2 fixes confirmed (form-centering + nav outside-tap dismiss). Note: "no-match search" empty state is NOT UI-reachable in V1 (no search box ruling) — covered by `adminDemo.seed.test.ts`; Gate-5 checklist line marked N/A-for-UI, not failed.

**Pending:** NONE blocking. **C6 — retrospective + Phase-7 requirements harvest** is the last cluster (STOP gate).

**Next step:** **C6** — draft `playbook/RETROSPECTIVES/RUN_001_LESSONS.md` (full retro + Coach/Frank requirements harvest + reconfirm Phase-7 flags), operator review → FFM complete. **AFTER C6 (separate housekeeping, NOT part of any gate):** add code linting — port the setup + run script from DockBloxx.

**Files in flight:** none (working tree clean except untracked FFM docs, intentionally uncommitted).

## C4b surfaced decisions (K7 — resolved in favor of contract/rulings; Phase-7 revisit)
- **Invite field = "Job title"** (Pharmacist/Technician/Staff → `jobTitle`), NOT the mockup's "Role"; `role` hardcoded `'member'`. NO password, NO permission dropdown.
- **Billing shows SEED amounts/plans** ($49 standard / $199 concierge), not the mockup's uniform "$79/Standard". V1 pricing = a Coach business decision, NOT locked by this demo.
- **Audit Result = Done/Failed** from the enum (mockup's "Sent" is cosmetic).
- **Settings is one page showing `stores[0]`'s settings** (nav is singular but data is per-store) — V1 simplification; Phase 7 = store picker or settings-from-detail.
- **No search box in V1 screens** — services keep `search` params (Phase-7 ready); mockups show no search UI.
- **Add store on Billing** adds a store card but no billing line (service adds store only) — consistent with "no real charge".

---

## Phase 2.2 cluster ledger (branch `phase2.2-admin-portal-1`, no upstream)
- **C0** recon ✅ · **C1** types ✅ `455e6fd` · **C2** store+services ✅ `6710acb` · **C3** seed ✅ `69afcc7` · **C4a** chrome+takeover ✅ `677d51b` · **C4b** 6 screens+Gate M+tests ✅ `fd816a1` · **C4-fix** gutter + add-store harvest form + form-centering + nav dismiss ✅ `7cd9b02` (docs) · **C5** verification + gating greps + operator smoke walk ✅ **Gate 5 signed off** (no code; verification-only). **C6** = NEXT (retro + Phase-7 harvest). Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).
- Last triad @ C5: **tsc 0 (fresh .next) / jest 115·25 / build 0 / dev clean**.

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
