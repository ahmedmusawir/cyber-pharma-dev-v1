# Recovery State

> **Updated 2026-06-24** — Phase 2.2 "Admin Portal Demo Shell" FFM, mid-build. Phase 2 (OwedBook) is DONE + committed; this is the follow-on admin-portal FFM on branch `phase2.2-admin-portal-1`.

**Last action:** Phase 2.2 **C4 fully built** — C4a (chrome) + **C4b (6 screens + Gate M + tests) built + green, checkpoint-committed.** C4b: 11 new `src/components/admin-portal/` components (StatusPill, Breadcrumb, StoreCard, MemberRow, MemberRoster, BillingRow, AddStoreButton, InviteMemberForm, SettingsForm + `statusPresentation.ts`/`format.ts` helpers) + 6 screen components (MyStores/StoreDetail/Invite/Billing/Settings/Audit) wired via services (useEffect → skeleton → data; toasts on mutation); 6 route pages repointed to render screens (`[id]` routes await `params`). 4 screen tests incl. the HARD no-password-in-invite-DOM assertion. member-5 seed fix applied. Triad green: **tsc 0 / jest 108·24 / build 0**.

**Pending:** **Operator Gate-M eyes-on** — 375 / tablet / desktop, both themes, all 6 screens (auth-gated; runner can't verify pixels). Then **C5** (next cluster — NOT started; STOP gate).

**Next step:** Await operator Gate-M visual sign-off, then plan **C5**. Operator verify items still open: (1) pending-invites populates from `member-2` on store-1's invite screen; (2) the no-password DOM test is in place + green (`__tests__/admin-portal/InviteMemberForm.test.tsx`).

**Files in flight:** none uncommitted after the C4b checkpoint commit (working tree clean except untracked FFM docs).

## C4b surfaced decisions (K7 — resolved in favor of contract/rulings; Phase-7 revisit)
- **Invite field = "Job title"** (Pharmacist/Technician/Staff → `jobTitle`), NOT the mockup's "Role"; `role` hardcoded `'member'`. NO password, NO permission dropdown.
- **Billing shows SEED amounts/plans** ($49 standard / $199 concierge), not the mockup's uniform "$79/Standard". V1 pricing = a Coach business decision, NOT locked by this demo.
- **Audit Result = Done/Failed** from the enum (mockup's "Sent" is cosmetic).
- **Settings is one page showing `stores[0]`'s settings** (nav is singular but data is per-store) — V1 simplification; Phase 7 = store picker or settings-from-detail.
- **No search box in V1 screens** — services keep `search` params (Phase-7 ready); mockups show no search UI.
- **Add store on Billing** adds a store card but no billing line (service adds store only) — consistent with "no real charge".

---

## Phase 2.2 cluster ledger (branch `phase2.2-admin-portal-1`, no upstream)
- **C0** recon ✅ · **C1** types ✅ `455e6fd` · **C2** store+services ✅ `6710acb` · **C3** seed ✅ `69afcc7` · **C4a** chrome+takeover ✅ `677d51b` · **C4b** 6 screens+Gate M+tests ✅ (checkpoint). **C5** = NEXT (after operator Gate-M eyes-on). Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).
- Last triad @ C4b: **tsc 0 / jest 108·24 / build 0**.

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
