# TONY_DEMO_10 — RAW FINDINGS AND QUESTIONS

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

This catch-all surfaces every smell, contradiction, and open question found across the extraction that didn't fit elsewhere. Two findings are escalated per operator directive: (1) the `posts` table query in `/api/auth/login/route.ts:12` is flagged as an explicit `QUESTION` requiring resolution (dead code vs. vestigial dependency), and (2) the `frank@example.com` hardcode at `AdminPortalContent.tsx:30` is fully traced (origin, scope, behavior under different users) — the variable is declared but never read. Beyond those, the repo carries a substantial amount of starter-template residue (5 navbar variants, parallel `store/`+`stores/` folders, `*-org.ts` and `route-1.ts` duplicates), several functional gaps (broken booking form, no-op upload button, abandoned filter sidebar refactor), and a handful of UX inconsistencies. None of these findings constitute a recommendation — they are surfaces for the IGNITION phase to decide on.

---

## Operator-Escalated Findings

### Operator Call-Out 1 — `posts` table in `/api/auth/login/route.ts`

**QUESTION** — `src/app/api/auth/login/route.ts:10-26` defines a GET handler annotated `// Testing the route` (line 9) that calls `await supabase.from("posts").select("*")` (line 12) and returns `{ message: "Auth login Route Accessed Successfully!" }` on success. The actual login flow is the POST handler (lines 28-61) which uses `signInWithPassword` and never touches `posts`.

**Source:** `src/app/api/auth/login/route.ts:6-26,28-61`

The QUESTION for the operator (per directive — flagged as explicit QUESTION, not just smell):

> **Is the `posts` table real in the demo Supabase project, or does the GET handler 400-error on every call?**
>
> If `posts` exists with rows: this is a debug shim that leaks data on every GET hit (response is just a status message — but the SELECT runs against the live DB).
>
> If `posts` exists but is empty: this is dead-but-functional debug scaffolding.
>
> If `posts` does NOT exist in the Supabase project: every GET to `/api/auth/login` returns a 400 with the error message from Supabase. The endpoint is partially broken but the production POST path is unaffected.
>
> Determining this requires console access to the operator's Supabase project — not visible from this repo.

**Related EVIDENCE** — The same `posts` table is referenced indirectly through `src/services/postServices.ts` (which targets `${NEXT_PUBLIC_API_BASE_URL}/api/posts` — a Next route that does NOT exist in this app). `usePostStore` imports from `postServices`. `InsertForm.tsx:39` calls `usePostStore.addPost`. So the `posts` table footprint reaches three layers of dead/broken code.

**Source:** `src/services/postServices.ts:1`; `src/stores/usePostStore.ts:8`; `src/app/(members)/booking/InsertForm.tsx:39`; absence verified: no `src/app/api/posts/` directory

---

### Operator Call-Out 2 — `frank@example.com` Hardcode at `AdminPortalContent.tsx:30`

Full trace per operator directive: where the value comes from, where the email filter is applied (query vs render), and what happens for other authenticated users.

**EVIDENCE** — Origin: `src/app/(admin)/admin-portal/AdminPortalContent.tsx:30`:
```ts
export default function AdminPortalContent() {
  const email = "frank@example.com";
  // Zustand store for user data and filtering
  ...
}
```

A hardcoded string literal. Not from environment, not from props, not from session.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:29-32`

---

**EVIDENCE** — The variable is **never read** in the rest of the 748-line component. Verified by full end-to-end read of the file. Confirmed:
- Not passed to any function call (the only fetch is `useUserDataStore.fetchUserData()` which takes no args)
- Not passed to any child component (`FiltersPanel`, `ReportActions`, `Spinner`, `Page`, `Tabs`, `Table`, `Dialog`, `DialogContent`, `Button`)
- Not interpolated into JSX (no `{email}` in the return statement)
- Not used in any `useMemo`, `useEffect`, `useCallback`, or `useState` body
- Not exported

**Source:** Full read of `src/app/(admin)/admin-portal/AdminPortalContent.tsx:1-748`

---

**EVIDENCE** — Where row scoping actually happens (the place an email filter SHOULD be if it were used):
- The store calls `fetch('/api/user-data?limit=10000&skipFilters=true', { cache: 'no-store' })` with no email parameter (`useUserDataStore.ts:196-198`)
- `/api/user-data` accepts query params `dateFrom, dateTo, script, ndc, drug, bin, status, owedType, method, pbm, sortKey, sortDir, page, limit` — no email or user-id parameter (`api/user-data/route.ts:36-50`)
- `/api/user-data` calls `supabase.auth.getUser()` at line 63 and uses the resulting authenticated session for the subsequent `from('pharma_user_data').select('*')` at line 78
- Row scoping is performed by Supabase RLS based on the authenticated user, NOT by an email filter

**Source:** `src/stores/useUserDataStore.ts:196-198`; `src/app/api/user-data/route.ts:36-92`

---

**EVIDENCE** — Where email IS rendered (separate path): `src/components/global/Navbar.tsx:99` displays `{user.email}` from a fresh `supabase.auth.getUser()` call at line 53. So the email shown next to the avatar is always the *currently logged-in* user's email — not the hardcoded value.

**Source:** `src/components/global/Navbar.tsx:51-69,99`

---

**INFERENCE** — Behavior under different authenticated users:

| User | Hardcoded `email` value (line 30) | Navbar display | OwedBook rows |
|---|---|---|---|
| `fbtant@gmail.com` (Frank, current screenshot subject) | `"frank@example.com"` (set, never read) | `fbtant@gmail.com` (real Supabase Auth output) | Whatever rows RLS permits for `fbtant@gmail.com`'s session |
| Future Coach test user | `"frank@example.com"` (same — same hardcoded value) | Coach's email from Supabase Auth | Whatever rows RLS permits for Coach's session |
| Different admin (any other `is_qr_admin` user) | `"frank@example.com"` (same) | That user's email | That user's RLS-scoped rows |
| Anonymous request | n/a (gate redirects before render) | n/a | n/a |

The hardcoded value is **inert under all scenarios**. Removing the line would change nothing.

*Built on:*
- EVIDENCE: line 30 declaration only
- EVIDENCE: full file read showing no subsequent reads
- EVIDENCE: navbar's separate render path
- EVIDENCE: API route's auth-based row scoping

---

**INFERENCE** — Most likely origin: this is fossil from an earlier iteration where the OwedBook query took an explicit email filter (e.g., `from('pharma_user_data').eq('user_email', email)`), and the filter was replaced with auth-session + RLS during a refactor. The line at 30 was forgotten. The neighboring fossils support this:
- Line 12: `// Removed ClaimsServices - using Zustand store only` — explicit fossil-marker for a different removed piece
- Lines 32: `// Zustand store for user data and filtering` — describes the *replacement* approach

This is INFERENCE — definitive confirmation requires `git log -p src/app/(admin)/admin-portal/AdminPortalContent.tsx` history, which was not consulted in this extraction.

*Built on:*
- EVIDENCE: lines 12, 30, 32 form a fossil neighborhood
- EVIDENCE: removing line 30 has no behavioral effect (per the trace above)

---

## Smell Catalogue

### S1 — Duplicate Zustand store directories

**EVIDENCE** — `src/store/` (3 files) and `src/stores/` (4 files + tests) coexist with overlapping content. `useAuthStore.ts` is byte-identical between the two (verified by reading both files at 86 lines each). All active production imports use `@/stores/` (plural); `@/store/` (singular) has zero importers.

**Source:** Directory listings of both paths; full Read of `src/store/useAuthStore.ts` and `src/stores/useAuthStore.ts`; grep `from "@/store/` returns 0 hits in active code

---

### S2 — `*-org.ts` legacy file pattern

**EVIDENCE** — Five files use the `.org.ts` / `-org.tsx` suffix as a "leave the original behind during edit" pattern:
- `src/app/layout-org.tsx` — bare Next.js starter layout (`metadata.title = "Create Next App"`, no theme provider)
- `src/utils/supabase/server.org.ts` — older variant using sync `cookies()` (current uses `await cookies()`)
- `src/utils/supabase/middleware.org.ts` — older middleware that REDIRECTS to `/login` (a route that doesn't exist) on no-user

**Source:** Cited files

---

### S3 — `route-1.ts` byte-identical duplicate

**EVIDENCE** — `src/app/api/auth/logout/route.ts` and `src/app/api/auth/logout/route-1.ts` are byte-identical. Next.js App Router only registers `route.ts`, so `route-1.ts` is inert.

**Source:** Both files (16 lines each, identical content)

---

### S4 — Five navbar variants in `src/components/global/`

**EVIDENCE** — Five components with "Navbar" in the name:
- `Navbar.tsx` — active (used by `(public)`, `(members)`, `(admin)`, `(superadmin)` layouts)
- `NavbarLoginReg.tsx` — active (used by `(auth)` layout)
- `Navbar-1.tsx` — unused
- `NavbarHome.tsx` — unused
- `NavbarSuperadmin.tsx` — unused

**Source:** Grep for component import; only `Navbar` and `NavbarLoginReg` have importers

---

### S5 — `Hero-1.tsx` alternate hero variant

**EVIDENCE** — `src/components/home/Hero-1.tsx` is an unused alternate. The active Hero is imported only by `(public)/HomePageContent.tsx`.

**Source:** Grep `Hero-1` in `src/` returns 0 importers

---

### S6 — `better-sqlite3` declared, unused

**EVIDENCE** — `package.json:27` lists `"better-sqlite3": "^11.10.0"` as a runtime dependency. Grep `better-sqlite3|sqlite` in `src/` returns zero hits. Unused dependency.

**Source:** `package.json:27`; grep result

---

### S7 — `AdminBookingList.tsx` mock-data component, never imported

**EVIDENCE** — `src/components/admin/AdminBookingList.tsx` defines a component rendering 6 hardcoded "Leslie Alexander" entries with Unsplash placeholder photos. Exported as default. Grep `AdminBookingList` in `src/` returns hits only inside the file itself.

**Source:** `src/components/admin/AdminBookingList.tsx:48-82`; grep verification

---

### S8 — `DashboardCard.tsx` defined, never imported

**EVIDENCE** — `src/components/dashboard/DashboardCard.tsx` defines a card component. Grep returns no importers.

**Source:** Grep `DashboardCard` in `src/` returns hits only inside the file

---

### S9 — `FiltersDrawerContext.tsx` defined, never imported

**EVIDENCE** — `src/components/admin/FiltersDrawerContext.tsx` exports a `FiltersDrawerProvider` and `useFiltersDrawer` hook. Grep returns no importers. The admin portal uses raw `<Dialog>` for the mobile filter drawer instead.

**Source:** Grep `FiltersDrawerContext|FiltersDrawerProvider|useFiltersDrawer` in `src/` returns hits only inside the file; `AdminPortalContent.tsx:5,270-326` uses `Dialog` directly

---

### S10 — Two stylesheet files

**EVIDENCE** — `src/app/globals.scss` (referenced by `src/app/layout.tsx:3` as `import "./globals.scss"`) and `src/styles/global.scss` both exist. The `styles/global.scss` is not imported anywhere — verified via grep.

**Source:** `src/app/layout.tsx:3`; grep `from "@/styles/global"` returns 0 hits

---

### S11 — Vestigial root metadata

**EVIDENCE** — `src/app/layout.tsx:9-12`: `metadata.title = "Moose Next Framework v3"` and `description = "This is just ui/ux framework with Shadcn"`. Vestigial labels visible on every page that doesn't override `<title>` (which is most pages — only AdminPortal, Demo, Hero, Superadmin set their own).

**Source:** `src/app/layout.tsx:9-12`

---

### S12 — Vestigial package name

**EVIDENCE** — `package.json:2`: `"name": "qr-next13-supabase-v1"`. Project is on Next 15 and has no QR functionality.

**Source:** `package.json:2`

---

### S13 — `(public)/old/` legacy route still routable

**EVIDENCE** — `src/app/(public)/old/{page.tsx, HomePageContent.tsx, layout.tsx, loading.tsx}` defines a fully working `/old` route showing "Cyberize AI Power Events" with picsum.photos placeholders. Reachable by anyone.

**Source:** Cited files

---

### S14 — `/template` route outside any route group

**EVIDENCE** — `src/app/template/page.tsx` and `src/app/template/TemplatePageContent.tsx` define a `/template` route that lives outside any `(group)/` folder, bypassing all role layouts.

**Source:** Cited files; absence of `src/app/(group)/template/` for any group

---

### S15 — Hardcoded "Frank Underwood / Pharmacist In Charge" defaults

**EVIDENCE** — `src/components/profile/forms/PersonalInfoForm.tsx:14,18,22` sets `defaultValue="Frank"`, `defaultValue="Underwood"`, `defaultValue="Pharmacist In Charge"`. All users see these defaults on `/profile` until they edit. The Save button has no submit handler (see Doc 04), so edits don't persist.

**Source:** `src/components/profile/forms/PersonalInfoForm.tsx:14,18,22`

---

### S16 — `metadata.title = "Next Starter Home"` on `/demo`

**EVIDENCE** — `src/app/(public)/demo/DemoPageContent.tsx:12` sets `<title>Next Starter Home</title>` (vestigial starter title for a page that's now a shadcn demo).

**Source:** `src/app/(public)/demo/DemoPageContent.tsx:12`

---

### S17 — Component-name-as-title

**EVIDENCE** — `src/app/(public)/HomePageContent.tsx:11` sets `<title>HomePageContent</title>` — the literal component name. Same pattern in `src/app/(superadmin)/superadmin-portal/SuperadminPortalPageContent.tsx:10`.

**Source:** Cited lines

---

### S18 — `"Back To Posts"` button on booking page

**EVIDENCE** — `src/app/(members)/booking/page.tsx:8`: `<BackButton text="Back To Posts" link="/members-portal" />`. "Posts" terminology leftover from the upstream posts-demo starter.

**Source:** `src/app/(members)/booking/page.tsx:8`

---

### S19 — Booking form uses Post types, calls broken endpoint

**EVIDENCE** — `src/app/(members)/booking/InsertForm.tsx`:
- Heading: "Booking Form" (line 69)
- Field labels: Title / Body / Author (post-shaped)
- Field descriptions: "This is title of the Post", "This is the content of the Post", "This is the author of the Post" (lines 87, 109, 131)
- Submit button: "Book Now" (line 138)
- Uses `usePostStore.addPost` which calls `postServices.createPost` → `${NEXT_PUBLIC_API_BASE_URL}/api/posts` (a route that does not exist in this app)
- Toast on success: "Post created successfully" — the toast still says "Post"

**Source:** `src/app/(members)/booking/InsertForm.tsx:55-56,69,87,109,131,138`

---

### S20 — "Upload Data" button is a no-op placeholder

**EVIDENCE** — `src/components/admin/FiltersPanel.tsx:35-39`:
```ts
const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Placeholder: no-op for now
  // You can wire actual upload logic later.
  e.target.value = ""; // reset selection
};
```
The button looks functional but selecting a file does nothing.

**Source:** `src/components/admin/FiltersPanel.tsx:35-39,67-72`

---

### S21 — Profile and Settings forms have no submit handlers

**EVIDENCE** — `src/components/profile/forms/PersonalInfoForm.tsx`, `ContactInfoForm.tsx`, `OrganizationInfoForm.tsx`, and `src/components/settings/SettingsContent.tsx` define `<form>` elements with no `onSubmit` handler and Save/Reset buttons with no `onClick`. Clicking the buttons reloads the page.

**Source:** Cited files (PersonalInfoForm verified by full read; others by structural similarity)

---

### S22 — PBM dropdown likely typo duplicate

**EVIDENCE** — `FiltersPanel.tsx:124-145` lists `"Script Care"` (line 136) AND `"Scriptcare"` (line 141) as separate options.

**Source:** `src/components/admin/FiltersPanel.tsx:136,141`

---

### S23 — Federal tab "Diff" label vs "owed" sort key mismatch

**EVIDENCE** — Federal Dollars tab displays `(r.paid - r.expected).toFixed(2)` as the "Diff" column (`AdminPortalContent.tsx:678`) but uses `toggleSort("owed")` for the sort handler (`AdminPortalContent.tsx:656`). `r.owed` is the negation of `(r.paid - r.expected)`. Sort direction visually inverts.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:656,678`

---

### S24 — Hardcoded fallback dates for PDF/email

**EVIDENCE** — `src/components/admin/ReportActions.tsx:34-35`:
```ts
const dateFrom = filters.dateFrom || "2025-07-01";
const dateTo = filters.dateTo || "2025-08-29";
```
These dates anchor demo PDF filenames and email subjects whenever a user does not enter a date filter.

**Source:** `src/components/admin/ReportActions.tsx:34-35`

---

### S25 — `/api/auth/superadmin-add-user` byte-identical to public signup

**EVIDENCE** — Both routes are 22 lines, both call `supabase.auth.signUp({ email, password, options: { data: user_metadata } })` with no auth check. Verified by side-by-side comparison.

**Source:** `src/app/api/auth/superadmin-add-user/route.ts:1-22`; `src/app/api/auth/signup/route.ts:1-22`

---

### S26 — `/api/auth/login` GET handler debug shim

**EVIDENCE** — Annotated `// Testing the route` (line 9). Queries `posts` table and returns a status message. Always-on debug shim. Escalated above as Operator Call-Out 1.

**Source:** `src/app/api/auth/login/route.ts:6-26`

---

### S27 — `RegisterForm` redirects to `/dashboard` (route doesn't exist)

**EVIDENCE** — `src/components/auth/RegisterForm.tsx:88`: `router.push("/dashboard")` on signup success. The actual member entry route is `/members-portal`. `/dashboard` is not in the route tree.

**Source:** `src/components/auth/RegisterForm.tsx:88`; absence of `src/app/.../dashboard/` directory

---

### S28 — `middleware.org.ts` redirects to `/login` (route doesn't exist)

**EVIDENCE** — `src/utils/supabase/middleware.org.ts:40`: `return NextResponse.redirect("/login")`. The actual login route is `/auth`. Vestigial — only relevant if the `.org.ts` file is reactivated.

**Source:** `src/utils/supabase/middleware.org.ts:40`

---

### S29 — `dashboard/sidebar/README.md` "Phase 1" stub

**EVIDENCE** — `src/components/dashboard/sidebar/README.md` claims "filters UI for the Owedbook dashboard. Phase 1: placeholder only." The folder contains only this README. Active filter UI is in `src/components/admin/FiltersPanel.tsx` — implies an abandoned/never-completed restructuring effort.

**Source:** `src/components/dashboard/sidebar/README.md:1-5`; verified empty folder

---

### S30 — Two AdminSidebar components in different folders

**EVIDENCE** — `src/components/admin/AdminSidebar.tsx` (active, mounted by `(admin)/layout.tsx:3`) and `src/components/layout/AdminSidebar.tsx` (separate file, no importers).

**Source:** Both cited files; grep `AdminSidebar` import paths

---

### S31 — `Sidebar.tsx` in `components/layout/` has hardcoded shortcuts

**EVIDENCE** — `src/components/layout/Sidebar.tsx` (used by `(members)/layout.tsx:3`) includes hardcoded items "Profile" (cmd+P), "Billing" (cmd+B), "Settings" (cmd+S) as `CommandShortcut` labels — but these are display-only, not actual keybindings. None of those items are real links (only Dashboard and "New Booking" have hrefs).

**Source:** `src/components/layout/Sidebar.tsx:30-56`

---

### S32 — `FIXED_FEE = 10.64` duplicated in two routes

**EVIDENCE** — Same constant appears in `src/app/api/user-data/route.ts:216` and `src/app/api/kpis/route.ts:159`. Same domain — Alabama Medicaid dispensing fee.

**Source:** Both cited lines

---

### S33 — Brand multiplier `0.96` duplicated

**EVIDENCE** — `(wac * 0.96) / (pkg_size * pkg_size_mult)` appears in both `api/user-data/route.ts:208` and `api/kpis/route.ts:151`.

**Source:** Both cited lines

---

### S34 — `skipFilters=true` query param sent but not honored

**EVIDENCE** — `useUserDataStore.ts:196` calls `fetch('/api/user-data?limit=10000&skipFilters=true', ...)`. The route at `src/app/api/user-data/route.ts:33-58` parses many params but never reads `skipFilters`. The flag is sent in vain.

**Source:** `src/stores/useUserDataStore.ts:196`; `src/app/api/user-data/route.ts:33-58`

---

### S35 — `ALLOWED_SORT_KEYS` defined but never enforced

**EVIDENCE** — `src/app/api/user-data/route.ts:6-15` defines a `Set<...>` of allowed sort keys but never consults it; `params.get("sortKey")` is cast `as any` at line 49 and used directly at lines 81-82.

**Source:** `src/app/api/user-data/route.ts:6-15,49,81-82`

---

### S36 — `ClaimsServices` is dead production code

**EVIDENCE** — `src/services/ClaimsServices.ts` defines `getClaims` and `getKpis`. Only importer is `ClaimsServices.test.ts`. Production code (`AdminPortalContent`) was migrated to direct Zustand fetch and the comment at `AdminPortalContent.tsx:12` documents the removal.

**Source:** `src/services/ClaimsServices.ts`; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:12`; grep verification

---

### S37 — `/api/kpis` is dead transitively

**EVIDENCE** — `/api/kpis` (~233 LOC) is referenced only by `ClaimsServices.getKpis` (`ClaimsServices.ts:132`). Since `ClaimsServices` is dead, so is `/api/kpis`.

**Source:** `src/services/ClaimsServices.ts:132`; grep `/api/kpis` returns hits only in the route file and `ClaimsServices.ts`

---

### S38 — Hero CTA omits members

**EVIDENCE** — `src/components/home/Hero.tsx:46-69` branches on `is_qr_superadmin` and `is_qr_admin` for the CTA but has no branch for `is_qr_member`. A logged-in member sees no portal CTA on the public homepage.

**Source:** `src/components/home/Hero.tsx:46-69`

---

### S39 — Footer copyright "© 2020 Your Company, Inc."

**EVIDENCE** — `src/components/home/Footer.tsx:198-200` displays this literal copyright on every public page. Date is 2020; company name is the placeholder string.

**Source:** `src/components/home/Footer.tsx:198-200`

---

### S40 — Footer placeholder navigation columns

**EVIDENCE** — Solutions / Support / Company / Legal columns in `src/components/home/Footer.tsx:1-25` are all generic SaaS placeholder labels with `href="#"`. No pharmacy-relevant content.

**Source:** `src/components/home/Footer.tsx:1-25,128-191`

---

### S41 — Two stores (`store/`+`stores/`) AND two `*-1` files for same concept

**EVIDENCE** — Pattern of "leave the working version, create a new one alongside" is repeated:
- `route-1.ts` (api/auth/logout)
- `Navbar-1.tsx`
- `Hero-1.tsx`
- `*.org.ts` for layout, server, middleware
- `src/store/` vs `src/stores/`

This is consistent enough to suggest a deliberate convention used during development. None of the `-1` or `.org` variants are referenced from active code.

**Source:** Multiple files; grep verification per S1, S2, S3, S4, S5

---

### S42 — Login response leaks well-known cookie names

**EVIDENCE** — `src/app/api/auth/login/route.ts:54-58` sets debug headers `x-login-cookies-set: 2` and `x-login-cookie-names: sb-access-token,sb-refresh-token`. Comment at line 51 acknowledges it's "best-effort visibility for debugging".

**Source:** `src/app/api/auth/login/route.ts:50-58`

---

### S43 — `console.debug` in slug helper produces noisy logs

**EVIDENCE** — `src/utils/slug.ts:19,29,37` emit `console.debug` lines on every PDF filename build. Acceptable for dev; produces log volume in production.

**Source:** `src/utils/slug.ts:19,29,37`

---

### S44 — Mailcomposer envelope from `noreply@cyberpharma.local`

**EVIDENCE** — `src/app/api/reports/email/route.ts:57` uses `from: "noreply@cyberpharma.local"`. The `.local` TLD will fail SPF/DMARC if any client tries to send the EML through a real mail server.

**Source:** `src/app/api/reports/email/route.ts:57`

---

### S45 — `/api/pbm-email` exposed without auth (admin-client backed)

**EVIDENCE** — Cross-cut from Doc 07: `src/app/api/pbm-email/route.ts:13` uses `createAdminClient()` and exposes `pharma_pbm_info.email` for any pbm name to any anonymous caller.

**Source:** `src/app/api/pbm-email/route.ts:5-32`

---

### S46 — `/api/reports/email` callable without auth (admin-client backed)

**EVIDENCE** — Cross-cut from Doc 07: this route does not call `auth.getUser()` and uses the admin client throughout. Path-traversal of `pdfPaths` could expose other tenants' reports.

**Source:** `src/app/api/reports/email/route.ts:15-114`

---

### S47 — `/api/reports/save` `noAuthDownload` escape hatch bypasses auth

**EVIDENCE** — Cross-cut from Doc 07: `src/app/api/reports/save/route.ts:38-49` returns the PDF before reaching the auth check at line 53.

**Source:** `src/app/api/reports/save/route.ts:38-49`

---

### S48 — Cyberize doctrine vs. actual pattern divergence

**EVIDENCE** — Per the operator's mission briefing: "Cyberize doctrine says `/services` for API logic." The repo HAS a `src/services/` folder following doctrine, but the live OwedBook flow bypasses it (see Doc 02 — service layer Architecture section). The doctrine layer was constructed and disconnected.

**Source:** `src/services/ClaimsServices.ts` exists and follows doctrine shape; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:12-13` bypasses it

---

### S49 — `src/utils/jsonSrv/jsonsrvUtils.ts` exists, role unclear

**EVIDENCE** — File exists at `src/utils/jsonSrv/jsonsrvUtils.ts`. (Not deeply read in this extraction — flagged for awareness; appears related to the unused `jsonsrvPostServices.ts` / `jsonplaceholder.typicode.com` mock-API path.)

**Source:** Directory listing

---

### S50 — `not-found.tsx` debug residue

**EVIDENCE** — `src/app/not-found.tsx:14`: `<p>This is coming from /app</p>` — a debug line presumably added to verify Next App Router not-found behavior, never removed.

**Source:** `src/app/not-found.tsx:14`

---

## Open Questions for Architect Review

1. **Operator-escalated Q1**: Is the `posts` table real in the demo Supabase project? See Operator Call-Out 1 above.
2. **Operator-escalated Q2**: Confirmed: the `frank@example.com` line is dead. Should it (and the surrounding "fossil" pattern at `AdminPortalContent.tsx:12,30,32`) be removed in cleanup, or preserved as documentation of the migration path?
3. The Cyberize doctrine `/services` layer is constructed but bypassed. For the new build's IGNITION phase: should `/services` be the canonical fetch boundary (forcing the OwedBook re-architecture) or is the "Zustand-fetches-directly" pattern acceptable?
4. KPI math is duplicated between client (`useUserDataStore.calculateKPIs`) and server (`/api/kpis`) with subtly different semantics. Which is the canonical specification?
5. PBM dropdown is hardcoded with 21 options; one is a likely typo duplicate (`Script Care` vs `Scriptcare`). Source-of-truth question: should this be loaded dynamically from `pharma_pbm_info`?
6. Hardcoded date window `2025-07-01` to `2025-08-29` in `ReportActions` — is this the intended permanent demo window?
7. The "Upload Data" button is a no-op placeholder. What is the intended upload mechanism in the new build (CSV upload, file picker → server-side ingest, ETL trigger)?
8. RBAC: roles live in `user_metadata` (client-mutable in default Supabase setups) and the signup flow accepts client-supplied `user_metadata`. Is the new build expected to migrate to `app_metadata` + service-role-only role assignment?
9. `/api/auth/superadmin-add-user` is byte-identical to public signup. Was an admin-only user-provisioning flow planned but never implemented?
10. Should `_EXTRACTIONS/` and `EXTRACTION_SKILLS/` (this skill family folder) be added to `.gitignore`, or are they intentionally tracked? They're currently ignored only by being absent from prior commits.
11. The members portal and superadmin portal are both placeholder pages. Is there an expected implementation for the new build, or are these abandoned?
12. The `(public)/old/` route still works publicly. Intended as a "version history" / snapshot, or forgotten?
13. The `/template` route lives outside any role group. Is this dev-only scaffolding, or a feature surface?
14. Footer placeholder content (Marketing/Analytics/etc, "© 2020 Your Company, Inc.") — should it be removed, replaced with pharmacy-specific links, or treated as out-of-scope-for-demo?
15. `AdminPortalContent.tsx` is 748 LOC of single-component logic. Acceptable for the demo, but is the new build expected to decompose this into smaller pieces?
16. The OwedBook fetches `limit=10000` on every mount with no progress UI. Acceptable for demo dataset sizes; may not scale.
17. No `error.tsx` boundaries anywhere in the App Router tree. Render-time exceptions in `AdminPortalContent` will white-screen the admin shell. Acceptable for demo?
18. (Out-of-scope) `EXTRACTION_SKILLS/MIGRATION_NOTES.md` says "Read once. Delete after." — that's a directive to the operator, not the extraction agent; flagging for operator awareness.

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
