# Phase 2 — Master Reference (Cyber Pharma v1)

> **Purpose:** the single "get-up-to-speed" doc for Phase 2. Read **`RECOVERY.md` + this file + the latest `agent_docs/SESSIONS/session_*.md`** and you have the full picture — "I'm up to date, Tony."
> **Last updated:** 2026-06-26
> **Status:** Phase 2.1 (OwedBook) ✅ · Phase 2.2 (Admin Portal Demo Shell FFM) ✅ COMPLETE · post-FFM housekeeping (ESLint + navigation spinner) ✅ done (uncommitted on `linting-1`).

---

## 0. What Phase 2 Is

Phase 2 builds the **authed application** on top of the Phase-1 foundation skeleton, **frontend-first / mock-data**: every screen is real UI wired to a **service layer** backed by in-memory Zustand + `/mocks`. The service layer is the **sole Phase-7 swap point** — components call services only, never the store or `/mocks` directly. Auth is real (Supabase); all domain data is mock.

Two surfaces, one shared shell:
- **2.1 — OwedBook** (`/owedbook`): the pharmacy revenue-recovery workbook (the member/owner's day-to-day).
- **2.2 — Admin Portal Demo Shell** (`/admin-portal`): owner-scoped mock preview of the future StoreLens admin.

Both render inside the shared **`AuthedShell`** (navbar + surface-aware sidebar + mobile slide-over).

### Stack (recon-locked)
- Next **16.2.x** (App Router only; `proxy.ts`, not `middleware.ts`) · React **19** · TypeScript strict (no `any`) · Tailwind **3.4** (HSL tokens + config) · **Jest** (not Vitest) · Zustand (no persist on demo stores → refresh resets) · Supabase auth.
- Auth: `useAuthStore` (client) + `supabase.auth.getUser()` (server); `protectPage([AppRole.X], { unauthorizedRedirect })` from `@/utils/supabase/actions`; `AppRole` from `@/utils/app-role`.

---

## 1. Phase 2.1 — OwedBook ✅

The revenue-recovery surface at `/owedbook`. Client-island page (`<OwedBookScreen/>`) under `owedbook/layout.tsx` (which runs `protectPage` + renders `AuthedShell`).

- **Chrome:** `AuthedShell` (shared) — desktop fixed sidebar at `xl+` (wide filter rail), hamburger + left slide-over below; navbar coral.
- **Pieces:** `OwedBookScreen` (client island: tabs/filters/sort/pager via services), `FilterRail`, `DataTable` (desktop table → mobile cards), `KpiTiles`, `StatusChip`, `EmptyState`, `OwedBookContext`.
- **Service layer:** `src/services/owedbook.ts` (mock-backed; ~600ms simulated latency on upload mutations). Mock data in `src/mocks/`.
- **Done:** end of Phase 2.1 at commit `bbdb5d7` ("small fixes done and tested … end of phase 2.1"). Branches: `phase2-mock-data`, `-2`, `-3`.

---

## 2. Phase 2.2 — Admin Portal Demo Shell FFM ✅

Mock-functional, owner-scoped admin portal that **replaces** `/admin-portal`'s old real user-CRUD with an in-memory preview of the future **StoreLens** (it is **NOT** StoreLens). Real user management now lives ONLY in the env-gated `/moose-portal` (operator's throwaway tool — **DO NOT TOUCH**). Branch: `phase2.2-admin-portal-1`. FFM specs live at `agent_docs/CURRENT_APP/cyber_pharma_v1_phase2.2_admin_portal_ffm/`.

### 2a. Locked rulings (do not re-litigate)
- **The one hard rule:** member creation is **invite-based, NEVER password-based.** No password/credential field anywhere. Enforced in **three layers**: service signature, a compile-time `@ts-expect-error` (a `password` key fails the build), and a hard DOM test in `InviteMemberForm.test.tsx`.
- **Single-admin model (V1):** one admin = the owner (onboarding); 2nd admins only via MissionControl. Invite form = **Email + Job title + Send invite** only — no password, no permission/role dropdown. `role` hardcoded `'member'` at the call site. (Confirmed w/ the client + the domain expert.)
- **`jobTitle` is demo-only** (Pharmacist/Technician/Staff) — the domain expert's schema has no such column; flagged as a Phase-7 source decision, never treated as real.
- **Billing is visual-only** — `managePayment` / `cancelSubscription` never charge; "Add store" drops a mock card; no audit entry for billing (no AuditAction vocab covers it). Seed amounts ($49 standard / $199 concierge) are placeholders — real V1 pricing is a client business decision.
- **Navbar = coral in BOTH light + dark.** `globals.css` navbar token untouched.
- **Owner-scoped only** — no platform/cross-tenant/"all owners" views; no PHI/claims; no super-admin powers. These must **not render at all** (not merely be disabled).

### 2b. Data spine (the Phase-7 swap point — frozen)
- `src/types/adminDemo.ts` — 7 view-models + 6 status vocabs + `AdminDemoState`.
- `src/store/useAdminDemoStore.ts` — plain Zustand (NO persist → refresh resets), service-only mutators + `reset()`.
- `src/services/adminDemo.ts` — 5 services (OwnerStores / StoreMember / Billing / Settings / Audit) via vanilla `getState()`, each with `BACKEND_SWAP_NOTES (Phase 7)` JSDoc. Signatures **frozen** (unused params underscore-prefixed, e.g. `_storeId`).
- `src/mocks/adminDemo.ts` — `makeAdminDemoSeed({empty?})` (DELETABLE); 4 Chicago stores covering every state; `const ADMIN_DEMO_NO_STORES` toggle for the "No stores yet" demo.

### 2c. The 6 screens (`src/components/admin-portal/`)
My Stores (`/admin-portal`) · Store detail (`/admin-portal/stores/[id]`) · Invite (`/admin-portal/stores/[id]/invite`) · Billing (`/admin-portal/billing`) · Settings (`/admin-portal/settings`) · Audit (`/admin-portal/audit`). Client islands following the OwedBook pattern (useEffect → skeleton → data/error; toasts on mutation via services only). Audit reuses `DataTable`. **Gate M** (mobile, 375px holds — grids→1-col, rows→stacked, table→cards, forms full-width) built into the same cluster, never deferred.

### 2d. Cluster ledger (C0–C6)
| Cluster | What | Commit |
|---|---|---|
| C0 | Recon + cluster plan | — |
| C1 | Types + contract | `455e6fd` |
| C2 | Store + 5 services + hard-invariant tests | `6710acb` |
| C3 | Mock seed (full state coverage) | `69afcc7` |
| C4a | Chrome + route takeover (delete `users/*`) | `677d51b` |
| C4b | 6 screens + shared components + Gate M + tests | `fd816a1` |
| C4-fix | Eyes-on fixes (2 rounds — see §3) | `7cd9b02` (docs) + `cc388e1` |
| C5 | Verification + gating greps + smoke walk | Gate 5 signed off |
| C6 | Retrospective + Phase-7 harvest | `9f74c36`, `41f9ba2` |

Prior: `66ded93` = `/moose-portal` (env-gated real-CRUD escape hatch — DO NOT TOUCH).

---

## 3. Post-build fixes & verification

### C4-fix — operator eyes-on, 2 rounds
- **Round 1:** content-column **gutter** added once in `src/app/(admin)/layout.tsx` (designer `.main` values; all 6 screens inherit) · **Add Store → shadcn-Dialog mock harvest form** (name/NCPDP/NPI/address + "Demo only — Phase 7" caption; facade — fields are local-state only, the frozen no-arg `addStore()` drops the generic card; proposed fields recorded for the domain expert).
- **Round 2:** Invite + Settings **centered** at `mx-auto max-w-[560px]` (designer width; data screens stay full-width) · shared **Navbar mobile menu dismiss** on outside-tap + Escape (fixes `/owedbook` too). Later regression fixed: the theme dropdown portals outside the header → added a **Radix-popper guard** + `ThemeToggler onSelect` so a theme pick closes the menu cleanly.

### C5 — Verification (Gate 5 ✅)
Triad green; **gating greps all clean** — no password input, no `@/mocks` import in components, no direct store import (services only), no numbered Tailwind colors, no `any`, no `dangerouslySetInnerHTML`, no real charge/checkout/platform/super-admin/PHI path. Operator smoke walk passed across all 6 screens × both themes × 375/tablet/desktop. (Note: the "no-match search" empty state is NOT UI-reachable in V1 — no search box — it's covered by `adminDemo.seed.test.ts`.)

### C6 — Retrospective (Gate 6 ✅)
`playbook/RETROSPECTIVES/RUN_001_LESSONS.md` — verdict **SUCCESS_WITH_NOTES**. Two **structural lessons promoted to the central playbooks** (`41f9ba2`):
1. **Gate-M split** — the mobile gate must check the *desktop content frame* (gutter + centered form max-width, sourced from mockup CSS), not just 375 collapse → `FRONTEND_BUILD_PHASE_PLAYBOOK_v1.2.md` (Lesson 10 + §9 checklist). (File renamed `_v1.1 → _v1.2` for filename-carries-version.)
2. **Commit discipline = HARD GATE** (recurred Phase 2.1 → 2.2): feature-branch cluster checkpoints, never a bundled sweep to `main` → `stark-frontend-first/references/ANTI_PATTERNS.md` §Process.

---

## 4. Post-FFM housekeeping (branch `linting-1`, 2026-06-26)

### 4a. ESLint setup + safe fixes
ESLint was never installed; `next lint` is gone in Next 16. Added **flat config** (`eslint.config.mjs`, ESLint 9) consuming `eslint-config-next@16`'s native flat configs; DockBloxx rules byte-faithful (`no-unused-vars` + `no-explicit-any` as **warn**, plus `^_` ignore for frozen Phase-7 params). Script: `"lint": "eslint ."`. Fixed all 17 preset **errors** (require()→ESM imports + a `grid-auto-fit` type shim in `types/`; empty-interface→type alias) and downgraded `react-hooks/set-state-in-effect`→warn (review-later, incl. the known Navbar `fetchUser`). Cleaned the safe unused-vars (**Logout now logs the real error** — was a silent swallow), deleted dead dup `logout/route-1.ts`, ignored `agent_docs/**`. Manual checker: **`scripts/lint-check.sh`** (grouped errors/warnings by rule). Result: **0 errors**, remaining warnings are the intentional review-later set (any in tests/shadcn, set-state-in-effect, one shadcn unused-as-type).

### 4b. Navigation spinner (moose-style)
moose shows a spinner per page request because its pages `await` real server data (loading.tsx Suspense); owedbook/admin are instant client islands so it never fired. Added a **root-layout overlay** (`src/components/layout/NavigationSpinner.tsx` in `src/app/layout.tsx`) that shows `SpinnerLarge` on every primary-nav request across **owedbook / admin / profile / moose**:
- Driven by `useLinkStatus` probes (`LinkPendingProbe`) inside desktop + sidebar nav links, and **direct `setPending`** on mobile-menu + logo clicks (their links unmount with the closing panel, so the probe can't report).
- Shared state: `src/store/useNavSpinner.ts`. **Min-display ~400ms** (mock data is instant). Cleared on `usePathname` change. Hosted at root so a single persistent overlay survives layout swaps (incl. `/profile`, which has its own non-AuthedShell layout) — overlay is full-viewport with a translucent backdrop.
- `(public)/loading.tsx` upgraded `Spinner` → `SpinnerLarge` so the `/ → /owedbook` redirect matches.

---

## 5. Branches & commit landmarks
- `phase2-mock-data-3` → `bbdb5d7` (end of Phase 2.1).
- `phase2.2-admin-portal-1` → Phase 2.2 FFM (C1 `455e6fd` · C2 `6710acb` · C3 `69afcc7` · C4a `677d51b` · C4b `fd816a1` · C4-fix `cc388e1`/`7cd9b02` · C5/C6 `9f74c36`,`41f9ba2`).
- `phase2.2-moose-portal-1` → `66ded93` (env-gated operator tool — DO NOT TOUCH).
- **`linting-1`** → current working branch; ESLint + navigation-spinner changesets **uncommitted** here (operator owns git). Stray, not Claudy's: a working-tree deletion of `agent_docs/APP_FACTORY/STARTER_KIT_HANDBOOK_v1.0.md`.

## 6. Phase-7 carry-forward flags
`jobTitle` real source · real Supabase invite + RLS (still no password) · real Stripe billing (amounts/plans become real) · real add-store + subscription checkout (payment-creates-account) · proposed new-store field set (name/NCPDP/NPI/address — validate with the domain expert) · Settings is `stores[0]`-only in V1 (Phase 7: store picker). Full harvest prompts in `RUN_001_LESSONS.md`.

🥄 *Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.*
