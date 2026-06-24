# Recovery State

> **Updated 2026-06-24** — Phase 2.2 "Admin Portal Demo Shell" FFM, mid-build. Phase 2 (OwedBook) is DONE + committed; this is the follow-on admin-portal FFM on branch `phase2.2-admin-portal-1`.

**Last action:** Phase 2.2 **C4 APPROVED**; **C4a (chrome + route takeover) built + green, checkpoint-committed.** AdminSidebar nav swapped to My Stores · Billing · Settings · Audit (active-state predicates); deleted `/admin-portal/users/` (8 files) + its 2 orphaned CRUD test suites (`AddMemberForm.test.tsx`, `actions.test.ts`); repointed `/admin-portal` off the dead redirect to the My Stores placeholder; scaffolded all 6 routes as `ScreenHeader`+`DemoMarker` header placeholders; new `DemoMarker` + `ScreenHeader` in `src/components/admin-portal/`. Triad green: **tsc 0 / jest 100·20 / build 0** (jest 116→100 = the 2 deleted CRUD suites, no regressions). AuthedShell test pathnames repointed off dead `/users` routes.

**Pending:** **C4b** — the 6 real screens + shared components + Gate M reflow + screen-level Jest (incl. the HARD no-password-in-invite-DOM assertion). NOT started.

**Next step:** Build **C4b** to the `_design/HTML` mockups: shared components (`StatusPill`, `StoreCard`, `MemberRoster`/`MemberRow`, `BillingRow`, `AddStoreButton`, `InviteMemberForm`, `SettingsForm`, `Breadcrumb`) + the 6 screens wired via services (`useEffect` → skeleton → data; toasts on mutation); Gate M per-screen reflow at 375 built in; then triad + operator eyes-on. **STOP before C5.** Operator verify items: (1) pending-invites list populates from `member-2` (invite_pending) on store-1's invite screen — not silently empty; (2) keep the no-password DOM assertion hard.

**Files in flight:** none uncommitted after the C4a checkpoint commit (working tree clean except untracked FFM docs). Billing price ruling: keep SEED numbers ($49/$199) as demo placeholders — actual V1 pricing is a Coach business decision, NOT locked here; don't chase the mockup's $79.

---

## Phase 2.2 cluster ledger (branch `phase2.2-admin-portal-1`, no upstream)
- **C0** recon ✅ · **C1** types ✅ `455e6fd` · **C2** store+services ✅ `6710acb` · **C3** seed ✅ `69afcc7` · **C4a** chrome+takeover ✅ (checkpoint). **C4b** = NEXT. Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).
- Last triad @ C4a: **tsc 0 / jest 100·20 / build 0** (was 116·22 @ C3; −2 suites = deleted CRUD tests).

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
- **Seed fix due in C4b** (NOT yet done — C4a was chrome-only): flip `member-5` `role:'admin'`→`'member'` in `src/mocks/adminDemo.ts` (V1: no non-owner admin; invisible since role isn't rendered).

## DO NOT TOUCH
`AuthedShell`, `Navbar`, `globals.css`, `/owedbook`, `/profile`, **`/moose-portal`**, `(members)`; C1–C3 files frozen except the one member-5 seed fix.

## Recon-locked facts (authoritative)
- Stack: Next 16.2.1 / React 19.2.4 / TS strict / Tailwind 3.4.1 (HSL+config) / **Jest**. `proxy.ts` not `middleware.ts`.
- Auth: `useAuthStore` (client) + `supabase.auth.getUser()` (server); `protectPage([AppRole.X], { unauthorizedRedirect })` from `@/utils/supabase/actions`; `(admin)/layout.tsx` already gates `[AppRole.ADMIN]` → bounce `/owedbook`. AppRole from `@/utils/app-role`.
- Reusables for C4: `AuthedShell`/`AdminSidebar`(surface-aware)/`Navbar` verbatim; `DataTable` (desktop→mobile cards → use for Audit), `EmptyState`, `StatusChip` (pill pattern), shadcn ui present, `useToast`, skeleton = `bg-muted animate-pulse`.
- `.env.local` at repo root — DO NOT read or commit.

## Spec authority (Phase 2.2)
FFM at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_admin_portal_ffm/`. Order: `_project/CLAUDE.md` (rulings) > `_project/APP_BRIEF.md` (gates + one hard rule) > `_project/DATA_CONTRACT.md` (shapes) > `_project/UI_SPEC.md` > `_design/HTML/` mockups > `_design/PNG-S/`. Gates: `verification/PHASE_GATES.md` (Gate 0–6 + Gate M). Cluster map: `playbook/00-OVERVIEW.md`.
