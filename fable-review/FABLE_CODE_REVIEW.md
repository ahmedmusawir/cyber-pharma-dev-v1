# FABLE CODE REVIEW
## Cyber Pharma Dev

Reviewer: Fable independent review · Date: 2026-09-13 · Branch: `fable-code-review-13sep2026` · Pinned SHA: `f1113177a5250e46136671ae4845659bda58f359`

---

### 1. Executive Assessment

**Review depth:** *source + controlled execution* (E2). I read the full application source, ran the existing gates (typecheck, lint, Jest, production build), and executed the mock service layer's arithmetic invariants in isolation. I did **not** exercise a real backend, a browser, or a deployment — no such environment exists in this snapshot and the boundary forbids creating one.

**What this repository actually is:** a **frontend-first, mock-backed** Next.js 16 application. Two authenticated product surfaces — **OwedBook** (`/owedbook`, the reimbursement ledger) and the **Admin Portal Demo Shell** (`/admin-portal`, owner-scoped stores/staff/billing/audit) — are fully built to visual fidelity and are functional end-to-end against mocks. There is exactly one place where real infrastructure is live: **authentication and role resolution** (Supabase auth + a `user_roles` table). All *domain* data (claims, KPIs, stores, members, billing, audit) is mock, served through a service layer that is the declared single swap point for Phase 7. A third route, **`/moose-portal`**, is a deliberately temporary, env-gated operator tool that performs **real, service-role Supabase user CRUD** — the one place besides auth where real, privileged infrastructure is wired.

**Overall verdict:** The frontend is well-architected and unusually disciplined for a demo. The service→store→mock seam is clean, contracts are centralized, the mock fixtures are internally arithmetically consistent, error/loading/empty states are handled on nearly every screen, and the test suite meaningfully protects the two hardest invariants (invite-never-takes-a-password; navbar-never-empty-while-authed). Typecheck, lint, Jest, and the production build all pass. There is **no current P0**. The most consequential issue is a **defense-in-depth gap in the real, privileged `/moose-portal` server actions** (they rely on a layout guard that does not protect Server Actions), which is currently contained by an env flag but is a genuine security-hardening item. The remaining findings are a small display-contract defect in the KPI tiles, a partial/misleading client-side sort, a global `no-store` cache header that likely defeats static-asset caching, and a set of clearly-labeled future-integration seams (tenant scoping, upload/report handling, billing) that are correctly deferred but must be gated before a real backend is attached.

---

### 2. Snapshot and Review Boundary

- Repo `cyber-pharma-dev-v1`, branch `fable-code-review-13sep2026`, HEAD = pinned SHA `f111317…` (verified equal). Working tree clean at start; only `fable-review/` was created.
- No application source, tests, fixtures, config, dependencies, env, database, or git state were modified. `npm ci` populated gitignored `node_modules/` only.
- Evidence ceiling: **E2**. Auth/RLS/tenant/billing/file behavior against live services is **E3/E4 and was not reached**. See §16.

---

### 3. Architecture / Data / State Map

**Stack:** Next.js 16.2 (App Router only; middleware entry is `src/proxy.ts`), React 19, TypeScript strict, Tailwind 3.4 + shadcn/ui, Zustand, Supabase (`@supabase/ssr`), Jest + Testing Library.

**Route groups (`src/app`):**
- `(public)` — marketing home (`/`), `/access-denied`; `NavbarHome` chrome. `/` redirects authenticated users to `/owedbook`.
- `(auth)` — `/auth` (login/register tabs).
- `(admin)` — `/admin-portal/*`; layout runs `protectPage([ADMIN], { unauthorizedRedirect: "/owedbook" })` and wraps `AuthedShell`.
- `owedbook/` — `/owedbook`; layout runs `protectPage([ADMIN, MEMBER])`, wraps `OwedBookProvider` + `AuthedShell`.
- `profile/` — `/profile`; `protectPage([ADMIN, MEMBER])`, Navbar-only shell.
- `moose-portal/` — env-gated (`NEXT_PUBLIC_ENABLE_MOOSE_PORTAL`) real user CRUD; layout 404s when the flag is off, else `protectPage([ADMIN])`.
- `api/auth/*` — real Supabase login/logout/signup/confirm route handlers.

**Server/client split:** Route guards and identity resolution are server-side (`protectPage` in `utils/supabase/actions.ts`, a `"use server"` module). Layouts pass `{user, role}` as props into the client `Navbar` — an explicit fix for a prior "empty navbar while authed" bug. Interactive screens are client islands that call services in `useEffect`.

**State ownership:**
- **Server-truth:** authenticated identity + role (from `protectPage`), forwarded as props. This is the authoritative path.
- **Client Zustand `useAuthStore`** (persisted to `localStorage`): holds `user`/`role`/`isAdmin` written **only** by `login()`. Consumed by `MobileNav`/`UserMenu` (public navbar) and by the logout action. This is the legacy client-identity path (see F5 / KIP-2).
- **Client Zustand `useAdminDemoStore`** (NOT persisted → refresh resets): the in-memory "database" for the Admin Portal, mutated only by `services/adminDemo.ts`.
- **React context `OwedBookContext`:** OwedBook filter state, surface-scoped (not global), with an `appliedTick` counter used to auto-dismiss the mobile filter drawer.
- **URL:** `/moose-portal/users?page=` pagination; `/auth?tab=register`. OwedBook tab/page/sort are component state, not URL.

**Domain types:** centralized in `src/types/OwedBook.ts` and `src/types/adminDemo.ts`; the moose-portal has its own `UserWithRole` type local to its actions.

---

### 4. Mock vs Real Integration Map

| Data path | Classification | Notes |
| --- | --- | --- |
| Login / logout / signup / email confirm | **REAL SERVICE** | Supabase auth via `api/auth/*` + `utils/supabase/*`. |
| Role resolution (`getUserRole`, `protectPage`) | **REAL SERVICE** | Reads `user_roles` table; RLS "read own role" policy in `supabase/setup.sql`. |
| OwedBook KPIs / rows / summary / PBM options | **MOCK** | `owedBookService` over 150-row `mocks/owedbook.ts`; filter+paginate in-memory. |
| OwedBook Upload Data / Get Fresh Data | **MOCK (UI-functional)** | `setTimeout` 600 ms; file never read/parsed/sent. Explicitly labeled Phase 5. |
| OwedBook "Report" links | **MOCK (inert)** | Button renders when `report_file` present; no handler. |
| Admin Portal stores/members/billing/settings/audit | **LOCAL** | In-memory Zustand seeded from `mocks/adminDemo.ts`; refresh resets. |
| Admin Portal Add store / manage payment / cancel | **MOCK (visual)** | No charge, no Stripe; add-store drops a generic card. |
| `/moose-portal` user list/create/edit/delete | **REAL SERVICE (privileged)** | Service-role admin client, bypasses RLS. Env-gated. See F1. |
| Tenant / pharmacy scoping of claims | **UNKNOWN → FUTURE** | No tenant concept in OwedBook today; documented as Phase-3 RLS scope. |

---

### 5. Verification Baseline

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | **pass** (0 errors) |
| `eslint .` | **pass** (0 errors, 34 warnings) |
| `jest --ci` | **pass** (26 suites, 120 tests) |
| `next build` (no env) | **fail** — `/access-denied` prerender constructs a Supabase client without env (documented; see F7) |
| `next build` (placeholder env) | **pass** (16 routes) |
| `npm audit` | 8 advisories (1 critical, 5 high, 1 moderate, 1 low), all transitive; see §14 / F9 |

Lint warnings are dominated by `react-hooks/set-state-in-effect` (deliberately downgraded from error in `eslint.config.mjs`) and `no-explicit-any` inside test files. README badge ("118 tests / 25 suites") is stale versus the actual 120/26 — documentation drift, not a defect.

---

### 6. Primary User Journey Assessment

- **Guest → marketing → sign up / log in:** works; `/` redirects authenticated users to `/owedbook`; register posts to `api/auth/signup`. One rough edge: signup unconditionally routes to `/owedbook` even when Supabase requires email confirmation (no session yet) — the guard then bounces to `/auth`. Minor UX (F11).
- **Member → OwedBook:** log in → land on `/owedbook` → KPI tiles + 4 tabs + paginated table + filter rail. Filters (date/PBM/status), pagination, tab dataset switching, mobile drawer, and empty state all function against the mock. Two defects surface here: KPI "Owed" always equals "Commercial Underpaid" (F3), and column sort only reorders the visible 25-row page (F4).
- **Admin → Admin Portal:** My Stores → Store detail → invite/suspend/unsuspend/recovery, Billing (visual), Settings (in-memory save), Audit log. Every mutation reflects immediately and appends an audit entry; refresh resets to seed by design. Journey is coherent and well-guarded.
- **Operator → /moose-portal:** real user CRUD; functions, but see F1 for the authorization gap.

All primary journeys are navigable and internally consistent under mocks.

---

### 7. Findings Summary

| ID | Title | Classification | Severity/Risk | Confidence | Evidence | Root cause | Current vs Future |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | `/moose-portal` privileged Server Actions have no in-action authorization | Conditional risk / Future integration risk | HIGH (as risk) | HIGH (source) / MODERATE (current exploitability) | E1 | Guard-the-page-not-the-action | Both |
| F2 | Login route `GET` handler queries a non-existent `posts` table (leftover kit debug) | Defect | LOW | HIGH | E1/E2 | Kit residue | Current |
| F3 | KPI "Owed" tile always equals "Commercial Underpaid" | Defect | MEDIUM | HIGH | E2 | Service collapses two contract fields | Current |
| F4 | Column sort reorders only the current 25-row page, not the dataset | Defect / Tradeoff | MEDIUM | HIGH | E1 | Client sort over server-paginated slice | Current (worse at scale) |
| F5 | Persisted `useAuthStore.role` can be stale/null while authenticated | Conditional risk | LOW→MEDIUM | MODERATE | E1 | Role only written by `login()`, read from persist | Current (bounded) |
| F6 | Global `Cache-Control: no-store` header applied to all paths incl. static assets | Conditional risk / Perf | MEDIUM | MODERATE | E1 | Broad `source:"/(.*)"` header | Current |
| F7 | Production build requires env because a static page builds a Supabase client during prerender | Verification/Tooling defect | LOW | HIGH | E2 | Client navbar creates browser client at SSG | Current |
| F8 | Federal-dollars sign convention diverges from commercial "owed"; Summary federal column ≈ 0 | Contract / Future integration risk | LOW / UNRATED | MODERATE | E2 | `federal_diff` sign vs `owed` sign | Both |
| F9 | Dependency advisories (Next.js critical, others) — installed, exposure unproven here | Verification/Tooling | MEDIUM (as hygiene) | HIGH (present) / LOW (demonstrated exposure) | E1 | Un-upgraded transitive deps | Both |
| F10 | Sortable table headers are mouse-only (no keyboard/`role`); inert "Report" button | Defect (a11y) | LOW | HIGH | E1 | `<th onClick>` without a11y affordance | Current |
| F11 | Signup redirects to `/owedbook` even when email confirmation leaves no session | Defect (UX) | LOW | MODERATE | E1 | Success path assumes active session | Current |
| F12 | Duplicate service-role admin client (`utils/supabase/admin.ts` vs moose `_lib/admin.ts`) | Optional improvement | LOW | HIGH | E1 | Copy to survive FFM | Current |
| F13 | User-facing debug strings in `not-found.tsx` / stray `console.log` in RegisterForm | Optional improvement | LOW | HIGH | E1 | Kit residue | Current |

---

### 8. Detailed Findings

#### F1 — `/moose-portal` privileged Server Actions rely on a layout guard, not in-action authorization
- **Classification:** Conditional risk (current) + Future integration risk. **Severity as risk:** HIGH. **Confidence:** HIGH that the code performs no in-action check; MODERATE on current exploitability (contained by the env flag). **Evidence:** E1 (source).
- **Location:** `src/app/moose-portal/users/actions.ts` (`getUsers`, `getUserById`, `editUser`, `deleteUser`, `addMember` — all `"use server"`); `src/app/moose-portal/_lib/admin.ts` (`createAdminClient`, service-role); guard in `src/app/moose-portal/layout.tsx`.
- **Expected invariant:** A privileged, RLS-bypassing operation (delete any user, create users, list all users with email/PII) must authorize the caller *inside the action*. In Next.js App Router, Server Actions are independently-addressable POST endpoints; **layouts and page guards do not run for a direct action invocation**. Authorization must therefore live in the action, not only in the layout.
- **Data/execution path:** `layout.tsx` does `if (NEXT_PUBLIC_ENABLE_MOOSE_PORTAL !== "true") notFound()` then `protectPage([ADMIN])`. The five actions do neither — each immediately calls `createAdminClient()` (service-role) and performs the operation. `deleteUser` calls `supabase.auth.admin.deleteUser`; `addMember` calls `auth.admin.createUser`.
- **Directly observed:** No `protectPage`, role check, or flag check appears in `actions.ts`.
- **Source inference:** With the flag ON, an authenticated non-admin (MEMBER) who obtains an action ID could invoke these actions and bypass the ADMIN-only UI gate, acting with service-role privilege. With the flag OFF (production per `deploy.sh`/`cloudbuild.yaml` set it to `false`), the pages are not served, so the action IDs are not handed to any client, which is the primary thing containing this today.
- **Future-integration assumptions:** As the app grows a real member population and if the flag is ever enabled in a shared environment (e.g. staging with test members), this becomes a live privilege-escalation and cross-user data-exposure path.
- **Deployment assumptions:** Contained in production only as long as the flag stays `false`.
- **Impact:** Latent privilege escalation over real user records (list PII, create, edit, delete). Even unexploited, it violates the "authorize the action, not the page" rule for the one real privileged surface.
- **Falsifier / downgrade:** Show that (a) each action calls `protectPage`/an equivalent admin+flag check internally, or (b) Next's build provably never emits these action IDs to any client when the flag is off AND the flag is guaranteed off in every environment with non-admin users. Either narrows this substantially.
- **What is safe today / what changes / guardrail:** Safe today because the flag is off in the built cloud config and the surface is operator-only. What changes: enabling the flag, or a member obtaining an action reference, removes the only barrier. Guardrail before relying on it: add an `protectPage([ADMIN])` + flag re-check as the first lines of every action in this file. (Reporting only — not prescribing implementation per the boundary.)

#### F2 — Login route `GET` handler probes a non-existent `posts` table
- **Classification:** Defect (kit residue). **Severity:** LOW. **Confidence:** HIGH. **Evidence:** E1/E2.
- **Location:** `src/app/api/auth/login/route.ts` lines 11–27 (`GET`).
- **Observed:** `GET /api/auth/login` runs `supabase.from("posts").select("*")` and returns 400 on error, else a success message. `posts` is not defined in `supabase/setup.sql`.
- **Impact:** An unauthenticated GET that hits the database against a table the schema never creates; always errors on a correctly-provisioned project. Dead debug endpoint on a security-relevant route.
- **Falsifier:** Show a `posts` table exists in the real project and this endpoint is intentionally a health probe.
- **Root cause:** Starter-kit residue. **Current defect.**

#### F3 — KPI "Owed" always equals "Commercial Underpaid"
- **Classification:** Defect (display/contract). **Severity:** MEDIUM. **Confidence:** HIGH. **Evidence:** E2 (executed the service).
- **Location:** `src/services/owedbook.ts` `getKpis` — `commercial_underpaid: underpaid` and `owed: underpaid` are the same value; tiles in `src/components/owedbook/KpiTiles.tsx`.
- **Expected contract:** `OwedBookKpis` declares `commercial_underpaid` and `owed` as distinct fields, and both `DATA_CONTRACT.md` and the README cite different target numbers ("Commercial Underpaid $12,669.63, Owed $12,627.77"). The `KpiTiles` unit test itself passes two different values. The design intends two different headline numbers.
- **Observed:** The mock service sets both to the same sum-of-positive-`owed`. In the running demo the first and fourth KPI tiles always render the identical figure.
- **Impact:** The headline dashboard shows a duplicated number under two different labels — visible in the client demo and misleading about what "Owed" means versus "Commercial Underpaid."
- **Falsifier:** A product ruling that "Owed" is defined as identical to "Commercial Underpaid" in V1 (in which case the second tile is redundant, not wrong).
- **Root cause:** Service collapses two contract fields into one. **Current defect** (mock-data, but user-visible).

#### F4 — Column sort reorders only the current page, not the full result set
- **Classification:** Defect / Tradeoff. **Severity:** MEDIUM. **Confidence:** HIGH. **Evidence:** E1.
- **Location:** `src/components/owedbook/OwedBookScreen.tsx` — `sortedRows` sorts `pageData.rows` (the 25-row slice) client-side; the service (`getRows`) paginates *before* sorting and takes no sort param.
- **Observed:** Clicking "Owed ↓" sorts only the 25 rows already on the page. The true top-owed claim across 150 rows may sit on page 4 and never surface at the top.
- **Impact:** On a ledger whose entire purpose is "find the biggest dollars owed," sort is misleading — it looks global but is page-local. Gets strictly worse as row count grows past one page.
- **Directly observed / source inference:** The code comment concedes server-side sort is "a Phase-3 concern," so this is a knowing tradeoff — but the UI presents a global-looking sort affordance over paginated data, which is the defect.
- **Falsifier:** If product accepts page-local sort for V1 and the data set is expected to stay ≤1 page, downgrade to Tradeoff.
- **Root cause:** Client sort applied over a server-paginated slice. **Current defect, amplified at scale.**

#### F5 — Persisted `useAuthStore.role` can be stale or null while the user is authenticated
- **Classification:** Conditional risk. **Severity:** LOW→MEDIUM. **Confidence:** MODERATE. **Evidence:** E1. (This is the project's own **KIP-2**.)
- **Location:** `src/store/useAuthStore.ts` (persisted `auth-store`; `role` written only in `login()`), consumed by `src/components/global/MobileNav.tsx:22` and `UserMenu.tsx:23`.
- **Observed:** `role` lives in `localStorage`-persisted state, written only by the login flow. A valid Supabase cookie session with cleared/absent `localStorage` (new device, cleared site data) leaves `role: null` while `user` is present.
- **Mitigating fact:** The primary product navbar was already migrated to server-resolved props (Navbar takes `{user, role}`), so the previously-reported "Admin Portal link vanishes" bug is fixed there. The remaining consumers are the **public** marketing navbar; and `(public)/page.tsx` redirects authenticated users away from `/`, so the authed branch of `UserMenu`/`MobileNav` is rarely reached. That bounds the blast radius.
- **Impact:** Role-gated public-nav affordances can render for the wrong role/state in the stale-persist scenario; also, `MobileNav`/`UserMenu` still perform a client `supabase.auth.getUser()` — the same client-identity-fetch anti-pattern the Navbar deliberately removed.
- **Falsifier:** Prove `MobileNav`/`UserMenu` are never mounted on a route an authenticated user can see (given the `/` redirect, close to true) → downgrade to LOW/optional.
- **Root cause:** Client-persisted role as a source of truth. **Current, bounded.**

#### F6 — Global `no-store` cache header covers static assets
- **Classification:** Conditional risk / performance. **Severity:** MEDIUM. **Confidence:** MODERATE. **Evidence:** E1.
- **Location:** `next.config.js` `headers()` — `source: "/(.*)"` sets `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` plus `Pragma`/`Expires` on **every** path, including `/_next/static/*` (content-hashed, immutable) and `/icon.png`.
- **Observed:** The header pattern matches all routes; Next's default `immutable, max-age=31536000` for hashed static chunks is at risk of being overridden, forcing re-download of JS/CSS on every navigation/reload.
- **Impact:** Likely defeats browser caching of immutable bundles → slower repeat loads and more bandwidth. Plausibly a deliberate anti-stale-auth measure, but it is too broad — the no-store intent belongs on dynamic/HTML responses, not fingerprinted assets.
- **Falsifier:** A network capture showing `/_next/static/*` still served with `immutable`/`max-age` (i.e. Next wins the merge) would downgrade this to LOW. I could not measure headers without a running server.
- **Root cause:** Over-broad header source. **Current.**

#### F7 — Build fails without env because a static page constructs a Supabase client at prerender
- **Classification:** Verification/Tooling defect. **Severity:** LOW. **Confidence:** HIGH. **Evidence:** E2.
- **Location:** `next build` prerender of `/access-denied` (in `(public)` group → `NavbarHome` → client `UserMenu`/`MobileNav` call `createClient()` in the component body, which runs during SSG). Fails with "Your project's URL and API key are required."
- **Observed:** No-env build exits 1; placeholder-env build passes. README documents the caveat.
- **Impact:** CI/build fragility and a hard dependency on env at build time for an otherwise-static page. Same root as F5 (client identity components).
- **Falsifier:** N/A — reproduced both ways.
- **Root cause:** Client component builds a browser client during static generation. **Current, documented.**

#### F8 — Federal sign convention diverges from commercial "owed"; Summary federal column ≈ 0
- **Classification:** Contract / Future integration risk. **Severity:** LOW / UNRATED. **Confidence:** MODERATE. **Evidence:** E2.
- **Location:** `mocks/owedbook.ts` (`federal_diff = federal_expected − original_paid`, negative on ~143/150 rows); `services/owedbook.ts` `getSummary` counts only `federal_diff > 0` into `federal_dollars`.
- **Observed:** For commercial, `owed > 0` means "owed to the pharmacy." For federal, `federal_diff` is almost always **negative** (only 7 rows positive, summing $19.74). So the Summary tab's "Federal Dollars" column is ~$0 for nearly every PBM, and the Federal tab's "Diff" hero renders mostly red. The two "money owed" concepts use opposite sign semantics.
- **Impact today:** Confusing but harmless (mock display). **Impact at integration:** if a real backend feeds `federal_diff` with the documented formula, the Summary's federal aggregate will still read ~0 unless the sign/definition is reconciled — a contract question that will look like a bug later.
- **Falsifier:** A product definition confirming federal underpayment is `original_paid − federal_expected` (opposite sign) or that near-zero federal summary is expected.
- **Root cause:** Unreconciled sign convention between commercial and federal money fields. **Both.**

#### F9 — Dependency advisories (installed) vs demonstrated exposure
- **Classification:** Verification/Tooling. **Severity:** MEDIUM (hygiene). **Confidence:** HIGH (present) / LOW (exposure demonstrated). **Evidence:** E1.
- **Location:** `npm audit`. Notably `next 16.2.12` carries a **critical** advisory (image-optimization AVIF RCE; Windows-host RCE) fixed in a later 16.x patch; plus high advisories in transitive `sharp`, `nanoid`, `brace-expansion`, `js-yaml`, `browserslist`, and moderate `baseline-browser-mapping`.
- **Observed:** All are transitive; `npm audit fix` reports a fix path. The Next.js image-optimization advisory is only reachable if the image optimizer is used with remote/AVIF inputs — this app configures one remote pattern (`res.cloudinary.com`) for README screenshots but ships no user-facing image optimization on the product surfaces I reviewed.
- **Impact:** An installed critical advisory is a real hygiene item and a deploy blocker for a HIPAA target; demonstrated in-app exposure is unproven here.
- **Falsifier:** Confirm the image optimizer is disabled/unused in the deployed config → the critical drops to "installed, not exposed."
- **Root cause:** Un-upgraded transitive dependencies. **Both.**

#### F10 — Sortable headers are mouse-only; inert "Report" button
- **Classification:** Defect (accessibility). **Severity:** LOW. **Confidence:** HIGH. **Evidence:** E1.
- **Location:** `src/components/common/DataTable.tsx` — sortable `<th onClick=…>` sets `aria-sort` but has no `tabindex`/`role="button"`/keyboard handler; `src/components/owedbook/columns.tsx` "Report" `<button>` has no `onClick`.
- **Impact:** Keyboard-only users cannot sort; a visible "Report" button does nothing (correct for the mock phase, but reads as broken and is a focusable no-op).
- **Falsifier:** N/A for the header; the Report button is knowingly deferred to Phase 5/6.
- **Root cause:** Interactive affordance without a11y wiring. **Current.**

#### F11 — Signup redirects to `/owedbook` even when confirmation leaves no session
- **Classification:** Defect (UX). **Severity:** LOW. **Confidence:** MODERATE. **Evidence:** E1.
- **Location:** `src/components/auth/RegisterForm.tsx` — on `response.ok`, unconditionally `router.push("/owedbook")`.
- **Impact:** If the Supabase project requires email confirmation, `signUp` returns a user with no active session; the push to `/owedbook` is then bounced to `/auth` by `protectPage`, with no "check your email" message. Depends on the project's confirmation setting (not verifiable here).
- **Falsifier:** Confirmation disabled on the project → sign-in is immediate and this is moot.
- **Root cause:** Success path assumes an active session. **Current, config-dependent.**

#### F12 — Duplicate service-role admin client
- **Classification:** Optional improvement. **Severity:** LOW. **Confidence:** HIGH.
- **Location:** `src/utils/supabase/admin.ts` (blessed, currently unconsumed) and `src/app/moose-portal/_lib/admin.ts` (identical copy, consumed). The KEEP_MANIFEST/KIP notes already flag reconciliation for Phase 3.
- **Impact:** Two copies of the most security-sensitive client; risk of divergent edits. **Current, acknowledged.**

#### F13 — User-facing debug strings / stray console log
- **Classification:** Optional improvement. **Severity:** LOW. **Confidence:** HIGH.
- **Location:** `src/app/not-found.tsx` ("This is coming from /app") and `src/app/(admin)/not-found.tsx` ("This is coming from /main") render to end users; `RegisterForm.tsx` logs `"Signup Response:", response` to the console. **Current polish.**

---

### 9. Root-Cause Themes

1. **Guard-the-page-not-the-action / client-identity residue (F1, F5, F7).** The app has clearly migrated its main navbar to server-resolved identity, but two legacy client-identity components remain (`MobileNav`/`UserMenu`), and the one real privileged surface (`/moose-portal`) authorizes at the layout rather than in the action. Same underlying theme: authority must live where the request actually lands.
2. **Mock/contract collapse (F3, F8).** Where the mock service simplifies (Owed = Commercial Underpaid; federal sign) it silently narrows the contract the types promise, producing display incoherence now and integration surprises later.
3. **Server-pagination vs client presentation (F4).** Presentation-layer operations (sort) applied to a server-paginated slice look global but are not.
4. **Starter-kit residue (F2, F13, and the README/badge drift).** Debug endpoints, debug strings, and stale counts left over from the RBAC starter kit.
5. **Deferred real seams, correctly labeled (F8, F9, upload/report/billing/tenant).** A large share of "risk" is future-integration work the code already flags with `BACKEND_SWAP_NOTES` — the discipline is good; the gate is what matters (see §10).

---

### 10. Mock-to-Real Integration Risks (FUTURE GATE)

These are **not current defects**; they are seams that must be closed before a real backend is attached.

- **Tenant/pharmacy scoping of OwedBook (UNKNOWN → must gate).** Today `owedBookService` returns a global 150-row fixture with no tenant filter. `BACKEND_SWAP_NOTES` says the real impl is "RLS-scoped by business_id." *Safe today* because there is one mock dataset and no real tenants. *Changes at swap:* every read must be tenant-scoped server-side (RLS), not just filtered in the client/service. *Guardrail:* the service signatures take no tenant/owner id (owner-scoped by session) — preserve that and enforce scope in RLS, never as a client-supplied parameter.
- **Upload / Get Fresh Data (Phase 5).** Currently fake success. The signature `uploadData(file)` is stable, but nothing validates file type/size/content, and success is unconditional. *Guardrail before swap:* server-side type/size/virus/schema validation and real error surfacing; the UI currently has no failure path for upload.
- **Report view/download (Phase 5/6).** `report_file` is a bare path string (e.g. `demo_pharmacy/reports/…pdf`) with an inert button. *Guardrail:* signed, access-controlled URLs; never expose raw storage paths cross-tenant.
- **Billing (Phase 7).** `managePayment`/`cancelSubscription` never charge; amounts are display strings. *Guardrail:* real Stripe portal + server-verified subscription state; the audit vocab currently has no billing verb (deliberate) — that must be revisited when billing becomes real.
- **`/moose-portal` (F1).** Before this real surface is ever exposed beyond an operator, add in-action authorization.

---

### 11. State / Contract / Calculation Assessment

- **Calculations (mock) are internally consistent.** I re-derived the four OwedBook row invariants across all 150 fixture rows: `owed = expected − original_paid`, `updated_difference = new_paid − original_paid`, `federal_expected = aac × qty`, `federal_diff = federal_expected − original_paid` — **all consistent** to 2 decimals; IDs unique; dates well-formed ISO; all 5 statuses + nulls represented. This is a genuine positive.
- **KPI arithmetic** is coherent except the Owed/Commercial-Underpaid duplication (F3). `getKpis` correctly reflects the active filter set; `commercial_scripts` is the filtered row count.
- **Contract centralization** is strong: `OwedBookRow`, status/tab/filter/KPI types in one file; Admin Portal's 7 view-models + 6 status vocabularies + state in one file; presentation mappings (`statusPresentation.ts`) are deterministic table lookups, not ad-hoc.
- **State ownership** is mostly clean: server-truth identity via props; OwedBook filters in a surface-scoped context (not global); admin store mutated only through services. The one blemish is the persisted client `role` (F5).
- **Concurrency:** async effects consistently use a `cancelled` flag to avoid stale-response writes — a good pattern applied uniformly across screens.

---

### 12. Frontend UX / Responsive / Accessibility Assessment

- **Responsive:** `DataTable` renders both a desktop table and mobile stacked cards; `AuthedShell` collapses the sidebar to a slide-over (drawer at `xl` for OwedBook's wide rail, `lg` for the narrow admin rail) with body-scroll lock and Escape-to-close; KPI tiles reflow 2×2. This is thoughtfully done and tested for the drawer/close paths. (Not visually verified — no browser run.)
- **Loading/empty/error:** nearly every screen has a skeleton, an `EmptyState`, and an error branch with a Retry. This is above the bar for a demo and directly counters the "mock hides failure states" risk — though the mock services never reject, so the error branches are largely **untested against real failure** (see §14).
- **Accessibility:** decent baseline — labels wrap inputs, dialogs use `role="dialog"`/`aria-modal`, pills carry text (not color-only), `aria-current` on active nav. Gaps: mouse-only sort headers and the inert Report button (F10); the desktop sidebar box uses a raw `border-4` utility that looks like leftover scaffolding.

---

### 13. Positive Protections to Preserve

- **Server-resolved nav identity** (`protectPage` → props → `Navbar`) with a dedicated `Navbar.invariant.test.tsx` proving the authed navbar is never empty. This is the correct fix to a real prior bug — keep it, and finish migrating `MobileNav`/`UserMenu` to the same pattern.
- **The "invite never takes a password" rule enforced in three layers** — service signature, a compile-time `@ts-expect-error` guard, and a DOM test (`InviteMemberForm.test.tsx`) asserting no password input and no role selector exist. Exemplary defense-in-depth for a product invariant.
- **Owner-scoped admin services with no `ownerId` parameter** (scope derives from session), with a compile-time guard that passing an owner id fails to typecheck. This is exactly the shape that makes the Phase-7 RLS swap safe.
- **Single, clearly-labeled swap point** with `BACKEND_SWAP_NOTES` JSDoc on every service method; components never import mocks or the store directly.
- **Non-persisted admin demo store** (refresh resets) — the right call for a demo and explicitly contrasted with the persisted auth store.
- **Internally consistent, richly-stated fixtures** covering every status, null, empty, and failure permutation, guarded by a seed test that fails loud on regression.
- **Real RLS scaffolding** in `supabase/setup.sql` (read-own-role/profile policies, a `SECURITY DEFINER` trigger for new-user rows) — the authorization foundation is real, not hand-waved.

---

### 14. Test and Verification Quality

- **What the suite genuinely protects:** the two hardest invariants (no-password invite; never-empty authed navbar), role-gate behavior in `protectPage` (incl. explicit deny cases for admin/member → superadmin), the OwedBook service's filter/paginate/tab/summary behavior over the real fixture, seed state-coverage, mobile drawer open/close/apply, and the member password form. The service tests assert **deltas and behaviors**, not brittle absolute counts — resilient to seed growth. This is good, intentful testing.
- **What green does NOT prove:**
  - **No failure-path coverage.** Mock services never reject, so the error/Retry branches on every screen are rendered-but-unexercised against actual failure. The single riskiest untested area.
  - **F1 is untested.** No test asserts the moose-portal actions authorize the caller — because they don't.
  - **F3/F4 pass because the tests encode the current (arguably wrong) behavior** — the KPI test uses distinct values but never asserts Owed ≠ Commercial Underpaid at the service level; no test asserts sort is global.
  - **No real integration or browser test runs here** (Playwright is configured but not exercised in this review).
- **Verification defects:** the no-env build failure (F7) and the stale README test badge.

---

### 15. Concerns / Tradeoffs / Optional Improvements

- **Tradeoffs (acceptable, noted):** page-local sort (F4, if data stays ≤1 page); visual-only billing; in-memory admin store; `no-store` intent (F6, but scope it).
- **Optional improvements:** remove the `posts` debug GET (F2); reconcile the duplicate admin client (F12); strip debug strings and the signup `console.log` (F13); finish migrating `MobileNav`/`UserMenu` off persisted role (F5); keyboard-enable sort headers (F10); upgrade dependencies to clear the critical advisory (F9).

---

### 16. Under-Reviewed Areas and Limitations

- **No real backend was exercised** — auth session lifecycle, RLS enforcement, role-lookup under real data, and cookie handling are **E1/E2 only**. RLS *policy text* was read (`setup.sql`) but not run.
- **No browser** — all responsive/visual/keyboard/focus findings are source-level (E1); I did not render any screen.
- **No deployment-representative run** — Cloud Run, GCS, domain, Stripe, and file ingest do not exist in this snapshot; the Dockerfile/cloudbuild/deploy scripts were read, not executed.
- **`.env.local` deliberately not opened** (gitignored; boundary rule). The real Supabase project's confirmation setting, table set, and whether `/moose-portal`'s flag is ever on in a member-bearing environment are unknown — F1/F11 exploitability turns on these.
- **`agent_docs/` and `docs/`** were sampled for contract/spec ground truth, not exhaustively reviewed.
- These gaps mean: absence of backend evidence is treated as "unverified," never as "safe" or "vulnerable."

---

### 17. Reviewer Self-Critique

1. **Three strongest findings:** F1 (privileged actions without in-action auth — the correct top concern; the Next.js Server-Action security model makes the guard-the-page pattern genuinely insufficient), F3 (Owed = Commercial Underpaid — directly observed by running the service; contradicts the written contract and the design targets), F4 (page-local sort — plainly visible in source and materially misleading on a money-ranking ledger).
2. **Why they survive challenge:** F1 rests on a documented framework behavior plus observed absence of any in-action check; F3 and F4 are re-derivable from source and executed behavior, not inference.
3. **Three weakest findings:** F6 (I could not measure whether Next's asset headers actually lose the merge — MODERATE at best), F11 (turns entirely on a project setting I can't see), F8 (may be an intentional product definition of federal underpayment).
4. **Assumptions that make them vulnerable:** F6 assumes the broad header wins over Next's per-asset defaults; F11 assumes email confirmation is on; F8 assumes commercial and federal "owed" should share a sign convention.
5. **Possibly overstated:** F1's *current* exploitability — the env flag plus action-ID opacity is a real containment, so I rated current exploitability only MODERATE while keeping the risk level HIGH. F6 severity could be LOW if measurement disproves it.
6. **Possibly understated:** the absence of any failure-path test coverage (§14) — arguably a MEDIUM finding in its own right, since it hides exactly the states a real backend will introduce.
7. **Shared root causes:** authority-at-the-wrong-layer (F1/F5/F7); mock/contract collapse (F3/F8).
8. **Under-reviewed:** everything requiring a live backend or browser (§16).
9. **Wording watch:** I have avoided calling F1 an exploit — it is a defense-in-depth gap and latent escalation path, contained today.
10. **What another reviewer should challenge first:** whether Next.js actually emits the moose action IDs to any client when the flag is off (this is the crux of F1's current severity), and whether the global `no-store` header truly overrides `/_next/static` immutability (F6).

---

### 18. Prioritized Handoff

**P0 — current immediate risk:** none identified.

**P1 — address before real backend / next release:**
- **F1** — add in-action authorization (admin + flag re-check) to every `/moose-portal/users/actions.ts` action; do not rely on the layout guard for Server Actions.
- **F3** — decide and implement the true "Owed" definition so the two KPI tiles differ (or drop one tile).
- **F9** — clear the critical Next.js advisory before any deploy toward the HIPAA target.
- **F6** — scope the `no-store` header to dynamic responses; leave `/_next/static` cacheable (verify with a header capture).

**P2 — normal backlog:**
- F4 (global sort or explicit "sorts this page" affordance), F2 (remove `posts` debug GET), F5 (finish server-identity migration of public navbar), F10 (keyboard-sortable headers; resolve inert Report button), F12 (reconcile duplicate admin client), F13 (remove debug strings / console.log), F7 (make `/access-denied` prerender env-independent), README badge/count drift.

**FUTURE GATE — must resolve before mock-to-real swap:** tenant/RLS scoping of OwedBook reads; real upload validation + failure UI; signed/scoped report URLs; real billing + audit vocab for billing; F8 federal sign/definition reconciliation. (See §10.)

**QUESTION — needs product/architecture/environment clarification:**
- Is `NEXT_PUBLIC_ENABLE_MOOSE_PORTAL` guaranteed off in every environment that has non-admin users? (Bounds F1.)
- Is email confirmation enabled on the Supabase project? (Bounds F11.)
- Is "Owed" intended to differ from "Commercial Underpaid," and what is its formula? (Resolves F3.)
- Is federal underpayment defined with the opposite sign of commercial owed? (Resolves F8.)

No remediation was implemented.

---

### 19. Change Boundary Confirmation

**Files created (all under `fable-review/`):**
- `fable-review/FABLE_REVIEW_PROMPT.md`
- `fable-review/FABLE_CODE_REVIEW.md`
- `fable-review/RUN_NOTES.md`
- (plus transient gate logs `.gates.log`, `.build.log`, `.npm-ci.log` under `fable-review/`, produced by the read-only verification runs)

**Confirmation:** No application code, tests, fixtures, dependencies (`package.json`/`package-lock.json`), configuration, environment files, database, or Supabase state were modified. No git state was changed (no stage/commit/push/branch/stash/reset/checkout). `node_modules/` was populated by `npm ci` from the committed lockfile and is gitignored. All review output is confined to `fable-review/`.
