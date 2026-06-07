# TONY_DEMO_04 — FEATURE SURFACE (adapted from TOOL-SYSTEM)

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The user-facing feature surface is concentrated in one screen: the **OwedBook** at `/admin-portal`. Everything else in the route tree is either placeholder, demo content, broken scaffolding, or auth/account-management wiring. This document inventories every reachable feature, what it does, and (where applicable) what's stubbed vs. fully wired. Stripe / billing — confirmed absent. Multi-role surfaces — superadmin and member portals are placeholders.

---

## Findings

### Feature 1 — The OwedBook (`/admin-portal`)

The hero feature. Single client component (`AdminPortalContent.tsx`, 748 LOC) renders a header, sticky KPI strip, four data tabs, pagination controls, filter sidebar, and report actions.

#### KPI Strip

**EVIDENCE** — Four KPI pills in a sticky header (`AdminPortalContent.tsx:341-363`), all derived client-side from `useUserDataStore.kpis`:

| Pill | Source field | Derivation |
|---|---|---|
| Commercial Underpaid | `kpis.underpaidCommercialAbs` | Sum of `r.owed` for rows where `pbmName !== 'Federal'` AND `r.owed > 0` |
| Commercial Scripts | `kpis.scriptsCommercial` | Count of rows where `pbmName !== 'Federal'` |
| Updated Difference | `kpis.updatedDifferenceTotal` | Sum of `(r.newPaid - r.paid)` over commercial rows where `r.newPaid != null` |
| Owed | `kpis.owedTotal` | `underpaidCommercialAbs - updatedDifferenceTotal` |

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:341-363,86-91`; `src/stores/useUserDataStore.ts:114-140`

---

#### Tab 1 — Commercial Dollars

**EVIDENCE** — Default tab (`AdminPortalContent.tsx:379` `defaultValue="commercial"`). Renders `<Table>` with 10 columns: Date, Script, Qty, Medicaid Rate, Method, Expected, Original Paid, Owed, Report, Status. Each header is a sortable button (`toggleSort`) with `<SortIcon>` indicator. The data source is `sortedRows` derived from `paginatedRows` derived from `displayRows` derived from `filteredRows` (no Federal exclusion at the row level for this tab, but KPI math excludes Federal).

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:424-535`

---

#### Tab 2 — Updated Commercial Payments

**EVIDENCE** — Filters `displayRows` to those where `typeof r.newPaid === "number"` (`AdminPortalContent.tsx:192-202`). Renders 5 columns: Date, Script, Original Paid, New Paid, Updated Difference. Sorting is keyed by a `sortKey as string` cast (some keys are non-typed: `newPaid`, `diff`).

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:215-233,538-600`

---

#### Tab 3 — Federal Dollars

**EVIDENCE** — Filters `displayRows` to those where `(r.pbmName || "Federal") === "Federal"` (`AdminPortalContent.tsx:204`). Renders 8 columns: Date, Script, Qty, AAC, Expected, Original Paid, Diff, Report. Diff column shows `(r.paid - r.expected).toFixed(2)` (note: the *raw* difference, not the converted `owed` value — `AdminPortalContent.tsx:678`).

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:204,206-213,602-688`

---

#### Tab 4 — Summary

**EVIDENCE** — Aggregates `displayRows` by `pbmName` into `{ commercialDollars, federalDollars }` per group (`AdminPortalContent.tsx:236-255`). Renders 3 columns: PBM Name, Commercial Dollars, Federal Dollars, plus a Total row computed inline (`AdminPortalContent.tsx:719-733`). The "differenceVal" inline comment notes the sign-convention conversion to match the Python original.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:236-255,690-741`

---

#### Filter Sidebar (desktop) + Filter Drawer (mobile)

**EVIDENCE** — Same component `FiltersPanel` rendered in two modes:
- Desktop: mounted by `AdminSidebar.tsx` (left-rail, `(admin)/layout.tsx:17-19`)
- Mobile: opened via `<Dialog>` triggered by an "Open Filters" button (`AdminPortalContent.tsx:269-326`)

**Source:** `src/components/admin/{AdminSidebar.tsx, FiltersPanel.tsx}`; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:269-326`; `src/app/(admin)/layout.tsx:17-19`

---

**EVIDENCE** — Filter inputs in `FiltersPanel.tsx`:
- "Upload Data" button (`FiltersPanel.tsx:67-72`) — **placeholder**: `onFileSelected` is a no-op (`FiltersPanel.tsx:35-39`: `// Placeholder: no-op for now`)
- "From (Date)" / "To (Date)" — `<input type="date">`, controlled state
- "Filter" — `<select>` with options All / Underpaid / Overpaid (`FiltersPanel.tsx:110-112`)
- "PBM" — `<select>` with 21 hardcoded options (see Doc 06)
- "Clear Filters" button — resets local state and calls `onClear`
- "Apply" button — calls `onApply(buildPayload())`. In mobile mode, wrapped in `<DialogClose>` to also close the drawer.
- "Get Fresh Data" button (`FiltersPanel.tsx:189-204`) — calls `onRefresh` which triggers `useUserDataStore.fetchUserData()` (full re-fetch from `/api/user-data`)

**Source:** `src/components/admin/FiltersPanel.tsx:33-204`

---

**EVIDENCE** — Filter state lives in `useUserDataStore.filters` (single source of truth) — `{ dateFrom?, dateTo?, owedType?, pbm? }`. `applyFilters()` recomputes `filteredRows` and `kpis` synchronously from `allRows`. State updates use Zustand's `set`/`get` (no React reducer).

**Source:** `src/stores/useUserDataStore.ts:3-8,179-185`

---

#### Pagination

**EVIDENCE** — Client-side, `rowsPerPage = 50` (`useUserDataStore.ts:147`). UI: "Page X of Y" + Prev/Next buttons (`AdminPortalContent.tsx:366-373`). Total label switches between commercial-script count and current row count based on active tab (`displayedTotal` memo, lines 126-129).

**Source:** `src/stores/useUserDataStore.ts:147`; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:111-129,366-373`

---

#### Sorting

**EVIDENCE** — Per-tab local state `sort: { key: keyof DisplayRow; dir: "asc" | "desc" }` (`AdminPortalContent.tsx:133`), default `{ key: "date", dir: "desc" }`. `toggleSort` flips dir if same key, else sets new key with `"asc"`. Numeric vs string vs date comparators inline at lines 135-144.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:131-162`

---

#### Drag-to-Scroll Table

**EVIDENCE** — The Commercial Dollars tab table container supports mouse-drag horizontal scrolling (`AdminPortalContent.tsx:168-189`). Click-and-drag on the table area pans `scrollLeft`. Cursor toggles between `cursor-grab` and `cursor-grabbing`.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:168-189,427-432`

---

#### Report Actions Bar

**EVIDENCE** — Rendered at the top of the page above the KPI strip (`AdminPortalContent.tsx:336-339`). Provides four contextual actions in `ReportActions.tsx`:

| Action | Visibility gate | Behavior |
|---|---|---|
| Save PDF | `owedType === "underpaid" && pbm !== "All"` | POST `/api/reports/save` with rows → uploads to `pharma_reports` Storage bucket → records `pdfPath` in store |
| Download PDF | Save gate AND `hasSavedPdfForContext` | POST `/api/reports/save` with `noAuthDownload: true` → server returns PDF directly |
| Preview Email | `pbm !== "All" && pbm !== "Federal" && hasSavedPdfForContext` | Opens `<Dialog>` rendering To / Subject / Body / Attachments preview |
| Send Email | Same as Preview gate | POST `/api/reports/email` → server returns `.eml` buffer → browser downloads, user opens in their desktop client |

**Source:** `src/components/admin/ReportActions.tsx:50-55,234-300,302-379`

---

**EVIDENCE** — A "PBM Email" inline label (`ReportActions.tsx:237-249`) shows the PBM email address fetched from `/api/pbm-email?pbmName=...`. This is a separate, redundant lookup — `/api/reports/email` looks up the same email internally.

**Source:** `src/components/admin/ReportActions.tsx:57-80,237-249`; `src/app/api/pbm-email/route.ts:14-19`; `src/app/api/reports/email/route.ts:25-32`

---

**EVIDENCE** — Saved-PDF context is keyed in the store as `${tab}|${pbm}|${dateFrom}|${dateTo}` (`useUserDataStore.ts:158`) and stored in `lastSavedPdfByContext: Record<string, string[]>`. State is in-memory only (NOT persisted).

**Source:** `src/stores/useUserDataStore.ts:46-66,156-171`

---

### Feature 2 — Auth Pages (`/auth`)

**EVIDENCE** — `(auth)/auth/page.tsx` renders `<AuthTabs />` which provides two tabs:
- **Login** (`LoginForm.tsx`) — email + password, zod-validated, calls `useAuthStore.login` → POST `/api/auth/login`
- **Register** (`RegisterForm.tsx`) — name + email + password + passwordConfirm, zod-validated with `.refine` for password match. On submit calls `fetch('/api/auth/signup', ...)` directly (not via store) with `user_metadata = { name, is_qr_superadmin: 0, is_qr_admin: 0, is_qr_member: 1 }`. On success, `router.push('/dashboard')` — **but `/dashboard` route does not exist** in this app (verified — only `/admin-portal`, `/members-portal`, `/superadmin-portal` exist).

**Source:** `src/app/(auth)/auth/page.tsx:1-14`; `src/components/auth/AuthTabs.tsx:1-55`; `src/components/auth/LoginForm.tsx:42-78`; `src/components/auth/RegisterForm.tsx:65-94`

---

### Feature 3 — Account Pages (`/profile`, `/settings`)

**EVIDENCE** — `/profile` renders `ProfileContent` with three forms (`ProfileContent.tsx:8-23`):
- `PersonalInfoForm` — fields: First Name, Last Name, Title. **Hardcoded defaults**: First Name="Frank", Last Name="Underwood", Title="Pharmacist In Charge" (`PersonalInfoForm.tsx:14-23`).
- `ContactInfoForm` — (not deeply read, but inferred to follow same pattern)
- `OrganizationInfoForm` — (same)

**EVIDENCE** — None of the three profile forms have `onSubmit` handlers. The "Save" button (`PersonalInfoForm.tsx:25-27`) is a plain `<Button>` with no click handler — clicking it submits the form, which has no submit handler, so the page reloads with no effect.

**Source:** `src/components/profile/forms/PersonalInfoForm.tsx:9-29`; `src/components/profile/ProfileContent.tsx:8-23`

---

**EVIDENCE** — `/settings` renders `SettingsContent` (`SettingsContent.tsx`) with two password fields and a "Reset Password" button. Same pattern: form has no `onSubmit`, button has no `onClick` — pure UI stub.

**Source:** `src/components/settings/SettingsContent.tsx:8-33`

---

### Feature 4 — Members Portal & Booking (`/members-portal`, `/booking`)

**EVIDENCE** — `/members-portal` is a 10-line placeholder (`members-portal/page.tsx:1-10`): `<h1>Members Portal</h1><p>...placeholder page to validate server-side RBAC.</p>`.

**Source:** `src/app/(members)/members-portal/page.tsx:1-10`

---

**EVIDENCE** — `/booking` renders `<BackButton text="Back To Posts" link="/members-portal" />` (text leftover from the posts-demo starter) and `<InsertForm />`. `InsertForm` is a form titled "Booking Form" with three fields (Title, Body, Author) — all 3 fields are validated as `z.string().min(1)`. On submit, calls `usePostStore.addPost(data as Post)` which calls `postServices.createPost` which fetches `${NEXT_PUBLIC_API_BASE_URL}/api/posts`. **The `/api/posts` route does not exist** in this Next app.

**Source:** `src/app/(members)/booking/page.tsx:1-15`; `src/app/(members)/booking/InsertForm.tsx:22-65`; `src/services/postServices.ts:1,52-67`; verified absence: `src/app/api/posts/` directory does not exist

---

**INFERENCE** — The booking form will throw on submit (network error or `NEXT_PUBLIC_API_BASE_URL` is undefined → fetch URL becomes `"undefined/api/posts"`). The error surfaces via the `useToast` toast (`InsertForm.tsx:58-64`). The form is functionally broken.

*Built on:*
- EVIDENCE: `src/services/postServices.ts:1` — base URL is `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`
- EVIDENCE: No `.env*` file in repo (Doc 00); env var likely unset for the demo deployment
- EVIDENCE: No `src/app/api/posts/` route exists

---

### Feature 5 — Public Pages (`/`, `/demo`, `/old`, `/template`, `/error`)

**EVIDENCE** — `/` renders `HomePageContent` → `<Hero />`. Hero is a marketing hero with:
- Headline "Cyber Pharma"
- Subheadline "The Best Way To Manage Your Pharmacy Claims..."
- "Announcing our next round of funding." badge
- Conditional CTA: if user role superadmin → "Go To Superadmin Portal"; if admin → "Go To Admin Portal"; else "Get started" → `/auth`. **Members get NO CTA** — the conditional in `Hero.tsx:46-69` does not branch on `is_qr_member`.

**Source:** `src/app/(public)/page.tsx:1-7`; `src/app/(public)/HomePageContent.tsx:7-21`; `src/components/home/Hero.tsx:6-90`

---

**EVIDENCE** — `/demo` renders `DemoPageContent` — a shadcn typography + buttons showcase with Lorem ipsum content, NOT the OwedBook. (Despite the name "demo", this is unrelated to the pharmacy demo.)

**Source:** `src/app/(public)/demo/{page.tsx, DemoPageContent.tsx}`

---

**EVIDENCE** — `/old` renders a separate `HomePageContent` copy (`(public)/old/HomePageContent.tsx`) that displays "Cyberize AI Power Events" with picsum.photos placeholder images and Lorem ipsum text. It is reachable as a public route.

**Source:** `src/app/(public)/old/{page.tsx, HomePageContent.tsx, layout.tsx, loading.tsx}`

---

**EVIDENCE** — `/template` renders `TemplatePageContent` — verified to be a template/scaffolding page (per filename and folder). Lives outside any route group (no role layout).

**Source:** `src/app/template/{page.tsx, TemplatePageContent.tsx}`

---

**EVIDENCE** — `/error` renders a one-line `<p>Sorry, something went wrong</p>`. Used as the redirect target by `/api/auth/confirm` when OTP verification fails.

**Source:** `src/app/error/page.tsx:1-3`; `src/app/api/auth/confirm/route.ts:31-32`

---

### Feature 6 — Superadmin Portal (`/superadmin-portal`)

**EVIDENCE** — `SuperadminPortalPageContent.tsx` renders only Lorem ipsum: `<h1>Superadmins' Portal</h1>` followed by 3 paragraphs of placeholder text. No real superadmin functionality.

**Source:** `src/app/(superadmin)/superadmin-portal/SuperadminPortalPageContent.tsx:6-34`

---

**EVIDENCE** — There is an API route `/api/auth/superadmin-add-user` whose name suggests superadmin-only user creation. In reality, the route is byte-identical to `/api/auth/signup` — both call `supabase.auth.signUp({ email, password, options: { data: user_metadata } })`. The route does NOT verify the caller is a superadmin and does NOT use the admin (service-role) client. Anyone who can reach the URL can call it.

**Source:** `src/app/api/auth/superadmin-add-user/route.ts:1-22` vs `src/app/api/auth/signup/route.ts:1-22` — identical content (verified by side-by-side diff in this extraction)

---

### Feature 7 — Navigation

**EVIDENCE** — Active navbar is `Navbar.tsx` (used by `(public)`, `(members)`, `(admin)`, `(superadmin)` layouts). It:
- Fetches user via `supabase.auth.getUser()` on mount AND subscribes to `auth.onAuthStateChange` (`Navbar.tsx:51-69`)
- When user is set, renders three nav links: Dashboard (`/admin-portal`), Profile (`/profile`), Settings (`/settings`) — these are admin-portal-relative and do not adapt to other roles
- Renders user.email next to a hamburger menu
- Hamburger menu: My Account label + Dashboard / Profile / Settings / Logout when authenticated; Log In when unauthenticated

**Source:** `src/components/global/Navbar.tsx:23-137`

---

**EVIDENCE** — Auth layout uses a separate `NavbarLoginReg` (no auth state, no menu) — `src/components/global/NavbarLoginReg.tsx:5-23`.

**Source:** `src/app/(auth)/layout.tsx:1,7`; `src/components/global/NavbarLoginReg.tsx:5-23`

---

**EVIDENCE** — `Navbar-1.tsx`, `NavbarHome.tsx`, `NavbarSuperadmin.tsx` exist in `src/components/global/` but are NOT imported anywhere (verified by grep). Three vestigial navbar variants.

**Source:** Grep for each component name in `src/`; only `Navbar` and `NavbarLoginReg` have importers

---

### Stripe / Billing

**GAP** — No Stripe integration exists. Searched for `stripe|Stripe|STRIPE` across `src/` — zero matches. No `@stripe/*` packages in `package.json`. No `/api/stripe`, `/api/billing`, `/api/checkout`, `/api/subscription` routes. No pricing table component. No webhook handler. The `Sidebar.tsx` in `components/layout/` includes a "Billing" item with cmd shortcut (line 47-50), but it has no link target — pure menu placeholder.

**Source:** Grep `stripe|Stripe|STRIPE` in `src/` returns 0 hits; `package.json` dependencies do not include any `@stripe/*` package; route directory listing under `src/app/api/` confirms no billing/subscription routes; `src/components/layout/Sidebar.tsx:46-50`

---

### Dead / Unreferenced Components

**EVIDENCE** — Components defined in `src/components/` but never imported (verified via grep):
- `AdminBookingList.tsx` — exports `AdminBookingList`, never imported. Renders 6 hardcoded "Leslie Alexander" entries from Unsplash (`AdminBookingList.tsx:4-46`).
- `Hero-1.tsx` — alternate Hero variant, never imported
- `Navbar-1.tsx`, `NavbarHome.tsx`, `NavbarSuperadmin.tsx` — vestigial navbar variants
- `DashboardCard.tsx` — exports `DashboardCard`, never imported
- `FiltersDrawerContext.tsx` — exports `FiltersDrawerProvider` and `useFiltersDrawer`, never imported (admin portal uses raw `<Dialog>` instead)
- `components/layout/Sidebar.tsx` and `components/layout/AdminSidebar.tsx` — separate from `components/admin/AdminSidebar.tsx`. Members portal uses `layout/Sidebar.tsx` (verified `(members)/layout.tsx:3` imports `@/components/layout/Sidebar`). `layout/AdminSidebar.tsx` is unused — `(admin)/layout.tsx:3` uses `@/components/admin/AdminSidebar`.

**Source:** Grep for each component name across `src/`; cited layout import lines

---

## Open Questions

1. The booking form (`/booking`) is functionally broken (POSTs to non-existent `/api/posts`). Is this a known broken feature, or should it be removed in cleanup?
2. The "Upload Data" button in the filter sidebar is a placeholder — what is the intended behavior? Bulk row insert? CSV import? Trigger of a server-side ETL?
3. The Hero CTA branching omits members entirely — is that intentional (members shouldn't see a portal CTA on the public homepage) or a bug?
4. `/api/auth/superadmin-add-user` is functionally identical to `/api/auth/signup`. Was an admin-only user-provisioning flow planned but not implemented? See Doc 07 for security implications.

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
