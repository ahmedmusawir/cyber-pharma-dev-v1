# TONY_DEMO_05 — DATA LAYER (adapted from CONTEXT-AND-MEMORY)

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The data layer is Supabase Postgres + Storage, accessed entirely through inline `from('table')` and `from(bucket)` calls — there are no migrations, no generated types, no schema documentation, and no service-layer abstractions on the live OwedBook hot path. Six `pharma_*` tables and one orphan `posts` table are referenced. State is held in two places: server-authoritative Supabase session cookies, and client-side Zustand stores. **Operator call-out (priority): the `frank@example.com` hardcode at `AdminPortalContent.tsx:30` is a declared-but-unread variable** — it does not influence any data path. Demo data scoping is enforced exclusively at the Supabase RLS layer (assumed; not visible from this repo).

---

## Findings

### Schema Source of Truth

**GAP** — No `supabase/migrations/*.sql` files exist anywhere in the repo. Searched root and `src/`.

**GAP** — No `database.types.ts` or `types/supabase.ts` generated type files. Searched root and `src/types/`.

**GAP** — No `Database` type imported from `@supabase/supabase-js` anywhere. Verified via grep — there are no typed `SupabaseClient<Database>` instantiations. Every `supabase.from(...)` call is implicitly typed as `any`.

**INFERENCE** — The schema lives outside this repo (in the operator's Supabase project console or in a separate migrations repository). For this extraction, the schema must be reconstructed from the columns referenced in inline queries.

*Built on:* the three GAPs above, plus the EVIDENCE blocks below

---

### Reconstructed Schema (from inline `from(...).select(...)` calls)

#### Table: `pharma_user_data`

The OwedBook fact table.

**EVIDENCE** — Columns referenced in code:
- `script` (`api/user-data/route.ts:18`)
- `pharmacy_id` (`api/user-data/route.ts:19`; written by `api/reports/email/route.ts:101` `.eq('pharmacy_id', pharmacyId)`)
- `date_dispensed` — type: date (`api/user-data/route.ts:20`; queried via `gte`/`lte`)
- `drug_ndc` — string (`api/user-data/route.ts:21`)
- `drug_name` — string (`api/user-data/route.ts:22`)
- `qty` — numeric (`api/user-data/route.ts:23`)
- `total_paid` — numeric (`api/user-data/route.ts:24`)
- `new_paid` — numeric, nullable (`api/user-data/route.ts:25`)
- `bin` — string, nullable (`api/user-data/route.ts:26`; Federal rows have `bin IS NULL`, see below)
- `pdf_file` — string (`api/user-data/route.ts:27`; written by `api/reports/email/route.ts:100` as report storage path)
- `status` — string, nullable (`api/user-data/route.ts:28`; written as `'emailed'` by `api/reports/email/route.ts:100`)

**Source:** `src/app/api/user-data/route.ts:17-29` (column type comments derived from inline TypeScript `Row` shape)

**EVIDENCE** — Federal classification convention: `pbmName === "Federal"` if and only if there is no `pharma_pbm_info` row for the user_data row's `bin` (or the bin is null). Confirmed by `/api/user-data/route.ts:222-223`: `const pbmName = r.bin ? pbmMap.get(r.bin)?.pbm_name || "Federal" : "Federal"; const isFederal = pbmName === "Federal"; // Python fills missing PBM as 'Federal'`.

**Source:** `src/app/api/user-data/route.ts:222-223`

---

#### Table: `pharma_baseline`

AAC (Actual Acquisition Cost) lookup by NDC.

**EVIDENCE** — Columns referenced:
- `ndc` (PK or unique, used in `.in('ndc', ndcs)`)
- `aac` — numeric, parsed via `parseFloat` if string (`api/user-data/route.ts:150`)
- `drug_name` — string, nullable (used as fallback when `pharma_user_data.drug_name` is empty)

**Source:** `src/app/api/user-data/route.ts:144-152`; `src/app/api/kpis/route.ts:91-99`

---

#### Table: `pharma_alt_rates`

WAC (Wholesale Acquisition Cost) lookup by NDC.

**EVIDENCE** — Columns referenced:
- `ndc` (used in `.in('ndc', ndcs)`)
- `wac` — numeric
- `pkg_size` — numeric
- `pkg_size_mult` — numeric
- `generic_indicator` — string ('N' = Brand, others = Generic per the conditional at `api/user-data/route.ts:206-212`)

**Source:** `src/app/api/user-data/route.ts:156-170`; `src/app/api/kpis/route.ts:103-117`

**EVIDENCE** — WAC-derived AAC formula:
- Brand (`generic_indicator === 'N'`): `aac = (wac * 0.96) / (pkg_size * pkg_size_mult)`
- Generic: `aac = wac / (pkg_size * pkg_size_mult)`

**Source:** `src/app/api/user-data/route.ts:206-212`

**EVIDENCE** — Per-row pricing method preference: AAC first; fallback to computed WAC; otherwise `Other`.

**Source:** `src/app/api/user-data/route.ts:198-213`

---

#### Table: `pharma_pbm_info`

PBM directory keyed by BIN.

**EVIDENCE** — Columns referenced:
- `bin` (used in `.in('bin', bins)` and `.eq('bin', ...)`)
- `pbm_name` — string
- `email` — string (used by `api/pbm-email` and `api/reports/email`)

**Source:** `src/app/api/user-data/route.ts:174-180`; `src/app/api/kpis/route.ts:120-128`; `src/app/api/pbm-email/route.ts:14-19`; `src/app/api/reports/email/route.ts:25-32,87-94`

---

#### Table: `pharma_pharmacy_members`

User → Pharmacy membership join.

**EVIDENCE** — Columns referenced:
- `user_id` (FK to `auth.users.id`, used in `.eq('user_id', userId)`)
- `pharmacy_id` (FK to `pharma_pharmacy_profile.pharmacy_id`)

**Source:** `src/app/api/reports/save/route.ts:127-132`

---

#### Table: `pharma_pharmacy_profile`

Pharmacy directory.

**EVIDENCE** — Columns referenced:
- `pharmacy_id` (PK)
- `pharmacy_slug` — string (used as Storage folder path component)

**Source:** `src/app/api/reports/save/route.ts:138-145`; `src/app/api/reports/email/route.ts:78-82`

---

#### Table: `posts` (orphan)

**EVIDENCE** — Referenced ONLY in `src/app/api/auth/login/route.ts:12`: `await supabase.from("posts").select("*")` — inside the GET handler annotated with `// Testing the route` (line 9). The actual login flow uses POST and does not touch `posts`.

**Source:** `src/app/api/auth/login/route.ts:9-12`

**EVIDENCE** — Additional vestigial reference: `src/services/postServices.ts:1` configures `BASE_URL = ${NEXT_PUBLIC_API_BASE_URL}/api/posts` and exports CRUD functions. `usePostStore` (in both `src/store/` and `src/stores/`) imports from this service. `InsertForm.tsx:39` calls `addPost`. There is no `/api/posts` route in this Next app to serve those CRUD requests.

**Source:** `src/services/postServices.ts:1`; `src/stores/usePostStore.ts:8`; `src/app/(members)/booking/InsertForm.tsx:39`; absence verified via directory listing of `src/app/api/`

**Per operator call-out, this is escalated to a `QUESTION` in Doc 10.**

---

### Storage Buckets

**EVIDENCE** — One Supabase Storage bucket: `pharma_reports`. Referenced as a string literal in:
- `src/app/api/reports/save/route.ts:62` — `const bucket = "pharma_reports";`
- `src/app/api/reports/email/route.ts:40` — `const bucket = "pharma_reports";`

**EVIDENCE** — Folder convention inside the bucket (per `folderForTab` in `reports/save`):
- `report_commercialdollars/` — Commercial Dollars tab
- `report_updatedcommercialdollars/` — Updated Commercial Payments tab
- `report_federaldollars/` — Federal Dollars tab
- `report_summary/` — Summary tab
- `reports/` — fallback (default in switch)

**Source:** `src/app/api/reports/save/route.ts:84-97`

**EVIDENCE** — Storage path layout: `{pharmacy_slug}/{folderForTab(tab)}/{buildReportFilename(...)}.pdf`. Built from `pharmacy_slug` resolved via `pharma_pharmacy_members → pharma_pharmacy_profile`.

**Source:** `src/app/api/reports/save/route.ts:64`; `src/utils/slug.ts:12-39`

---

### State Management

#### Authoritative state (server)

**EVIDENCE** — Supabase Auth cookies (`sb-access-token`, `sb-refresh-token`) are the authoritative session state. Refreshed by middleware on every request via `supabase.auth.getUser()` (`src/utils/supabase/middleware.ts:37`). Cookie options set in `src/utils/supabase/server.ts:18-43`: `httpOnly: false` (required for client-side Supabase), `sameSite: 'lax'`, `secure` decided by `NEXT_PUBLIC_SITE_URL` protocol.

**Source:** `src/utils/supabase/server.ts:18-43`; `src/utils/supabase/middleware.ts:37`

---

#### Client state (Zustand stores)

**EVIDENCE** — Four Zustand stores, all in `src/stores/` (the canonical directory; `src/store/` is a duplicate — see Doc 10):

**1. `useUserDataStore`** — the OwedBook state container.
- `allRows: Row[]` — full dataset from `/api/user-data`
- `filteredRows: Row[]` — derived
- `filters: { dateFrom?, dateTo?, owedType?, pbm? }` — current filter UI state
- `page: number`, `rowsPerPage: number = 50` — pagination
- `loading: boolean`, `error: string | null` — async UI state
- `kpis: KPIData` — derived KPIs (4 fields)
- `lastSavedPdfByContext: Record<string, string[]>` — keyed by `${tab}|${pbm}|${dateFrom}|${dateTo}`
- Methods: `setFilters`, `applyFilters`, `setPage`, `fetchUserData`, `clearFilters`, `setLastSavedPdfForContext`, `getLastSavedPdfForContext`, `hasSavedPdfForContext`
- **Not persisted** (no `persist` middleware) — full re-fetch on every page load
**Source:** `src/stores/useUserDataStore.ts:1-245`

**2. `useAuthStore`** — auth state, persisted.
- `user: any | null`, `roles: { is_qr_superadmin: number, is_qr_admin: number, is_qr_member: number }`, `isAuthenticated: boolean`, `isLoading: boolean`
- Methods: `login(email, password)`, `logout()`
- **Persisted** to `localStorage` with `name: "auth-store"` (`useAuthStore.ts:81-83`)
- Login triggers `window.location.reload()` (line 62)
**Source:** `src/stores/useAuthStore.ts:1-86`

**3. `usePostStore`** — broken posts CRUD store. Calls `postServices` which targets non-existent `/api/posts`.
**Source:** `src/stores/usePostStore.ts:1-90`

**4. `useJsonsrvPostStore`** — alternate posts store hitting `jsonplaceholder.typicode.com`. Unreferenced.
**Source:** `src/stores/useJsonsrvPostStore.ts:1-63`

---

**EVIDENCE** — `useAuthStore` is the ONLY store using `persist`. All others reset on page reload. Combined with the OwedBook `fetchUserData` always pulling `limit=10000`, this means the OwedBook re-downloads the full dataset every time the user navigates back to `/admin-portal` from another route.

**Source:** `src/stores/useAuthStore.ts:17-18,81-83`; `src/stores/useUserDataStore.ts:142-245` (no `persist` wrapper)

---

#### React-local state

**EVIDENCE** — `AdminPortalContent.tsx` uses `React.useState` for ephemeral UI flags only:
- `uiBusyMobile` — mobile filter "Apply" button spinner (line 49)
- `activeTab` — currently visible tab (line 123, defaults to `"commercial"`)
- `tabBusy` — transient tab-switch indicator (line 125)
- `sort: { key, dir }` — table sort state (line 133, defaults to `{ key: "date", dir: "desc" }`)
- `dragging` — drag-to-scroll flag (line 169)

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:49,123,125,133,169`

---

### Operator Call-Out 1 — The `frank@example.com` Hardcode

**EVIDENCE** — `src/app/(admin)/admin-portal/AdminPortalContent.tsx:30`: `const email = "frank@example.com";`

**EVIDENCE** — The variable `email` is declared on line 30 and **never read** in the rest of the 748-line component. Verified by reading the full file end-to-end. Specifically:
- It is not passed to `fetchUserData` (which takes no arguments)
- It is not passed to `useUserDataStore.setFilters` (which only accepts `Filters` — `{ dateFrom?, dateTo?, owedType?, pbm? }`)
- It is not used in any `useMemo`, `useEffect`, or `useCallback` body
- It is not rendered into JSX (no `{email}` in the return statement)
- It is not passed as a prop to any child component (`FiltersPanel`, `ReportActions`, `Spinner`, `Page`, `Tabs`, `Table`, `Dialog`, `DialogContent`, `Button`)

**Source:** Full read of `src/app/(admin)/admin-portal/AdminPortalContent.tsx:1-748`

---

**EVIDENCE** — The actual email-related rendering happens elsewhere: `Navbar.tsx:99` displays `{user.email}` from `supabase.auth.getUser()`, which returns the *currently logged-in user's* email. So the avatar/email shown in the screenshot for `fbtant@gmail.com` is real Supabase Auth output, not the hardcoded value.

**Source:** `src/components/global/Navbar.tsx:51-69,99`

---

**EVIDENCE** — Where the email filter would matter (the data fetch): `useUserDataStore.fetchUserData()` calls `fetch('/api/user-data?limit=10000&skipFilters=true', ...)` with NO email filter (`useUserDataStore.ts:196-198`). The `/api/user-data` route accepts `dateFrom`, `dateTo`, `script`, `ndc`, `drug`, `bin`, `status`, `owedType`, `method`, `pbm`, `sortKey`, `sortDir`, `page`, `limit` query params — but **no email or user-id parameter** (`api/user-data/route.ts:33-58`).

**Source:** `src/stores/useUserDataStore.ts:196-198`; `src/app/api/user-data/route.ts:33-58`

---

**EVIDENCE** — Row scoping in `/api/user-data/route.ts` happens at exactly one place: line 63, `supabase.auth.getUser()`. If no user, return 401 (lines 65-70). If user, the subsequent `from('pharma_user_data').select('*')` runs under that user's session — **row scoping is delegated entirely to Supabase RLS**.

**Source:** `src/app/api/user-data/route.ts:62-92`

---

**INFERENCE** — Behavior matrix for the `email` variable across users:

| Scenario | What the code does | What the user sees |
|---|---|---|
| Frank logs in as `fbtant@gmail.com` | Hardcoded `email = "frank@example.com"` is set, never read; `/api/user-data` returns rows scoped by RLS to Frank's session | Navbar shows `fbtant@gmail.com` (from Supabase Auth); OwedBook shows whatever rows RLS permits |
| Different admin logs in (e.g., a future Coach demo user) | Same: variable set, never read; data scoped by RLS to the new user's session | Navbar shows new user's email; OwedBook shows new user's RLS-permitted rows |
| Anonymous request | `protectPage(["admin"])` redirects to `/auth` before `AdminPortalContent` mounts | Login page |

*Built on:*
- EVIDENCE: `AdminPortalContent.tsx:30` (declaration only)
- EVIDENCE: full re-read of `AdminPortalContent.tsx` showing zero subsequent references
- EVIDENCE: `api/user-data/route.ts:63` (the only data-scoping primitive)
- EVIDENCE: `Navbar.tsx:99` (separate email render path)

---

**INFERENCE** — `email = "frank@example.com"` is a vestige of an earlier version of the component where the email was likely passed to a query (e.g., `from('pharma_user_data').eq('user_email', email)`). The line was left when that approach was replaced with auth-session + RLS. Cannot be confirmed without git blame inspection.

*Built on:*
- EVIDENCE: the variable exists, is set, and is never read
- EVIDENCE: the comment immediately below at line 32 begins `// Zustand store for user data and filtering` — describing what *replaced* the email-based approach
- EVIDENCE: line 12 carries another such fossil: `// Removed ClaimsServices - using Zustand store only`

---

### Operator Call-Out 2 — The Hardcoded Demo Date Window

**EVIDENCE** — `src/components/admin/ReportActions.tsx:34-35`:
```ts
const dateFrom = filters.dateFrom || "2025-07-01";
const dateTo = filters.dateTo || "2025-08-29";
```
These fallback dates are passed to:
- The PDF save payload (`reports/save` route uses them in the storage filename and for "subtitle" text)
- The PDF download fallback
- The email subject line
- The email preview UI ("Subject: ... Report 2025-07-01 to 2025-08-29")
- The `lastSavedPdfByContext` keying (`${tab}|${pbm}|2025-07-01|2025-08-29`)

**Source:** `src/components/admin/ReportActions.tsx:34-35,103-108,158-162,200-208,333,343-345`

**EVIDENCE** — These dates are NOT used by the OwedBook data fetch itself (`useUserDataStore.fetchUserData` doesn't pass dateFrom/dateTo). They only affect the PDF/email artifact metadata — the actual rows displayed are unfiltered until the user enters a date in the FiltersPanel.

**Source:** `src/stores/useUserDataStore.ts:191-236`; `src/components/admin/FiltersPanel.tsx:42-43,47-56`

---

### Demo Data Story

**INFERENCE** — Demo data lives in a real Supabase project with seeded production-shape rows (not in committed fixtures).

*Built on:*
- EVIDENCE: GAP for any committed `*.csv`, `*.json` fixture files (verified — `Glob **/*.json` returns only config files; no fixture or seed files in `src/`)
- EVIDENCE: `/api/user-data` queries `pharma_user_data` directly with no fixture branch
- EVIDENCE: `next.config.js:5` whitelists `res.cloudinary.com` for image hosting — implies live external assets, consistent with a deployed environment
- EVIDENCE: `src/utils/supabase/server.ts:11-12` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at runtime — implies environment-bound to a live Supabase project

**GAP** — No row counts, no representative sample shapes, no seed scripts visible in this repo. Anyone wishing to know "how many rows are in `pharma_user_data` in the demo Supabase project" must query the Supabase project directly.

---

### RLS Policies

**GAP** — No RLS policy definitions exist in this repo. RLS would be defined in the Supabase project (SQL migrations or the dashboard UI), not in application code. The application code RELIES on RLS to scope multi-tenant rows: `api/user-data/route.ts:62-70` only checks "is there a user", and trusts RLS to filter rows. If RLS were misconfigured (open or missing), all authenticated users would see all rows.

---

### Indexes

**GAP** — Cannot determine from application code. No CREATE INDEX statements anywhere in `src/`. Inferred index *needs* (not actual indexes):
- `pharma_user_data` — likely needs `(date_dispensed, script)` for the `order` clauses; `(pharmacy_id, date_dispensed)` for the email-update path
- `pharma_baseline.ndc` — primary or unique
- `pharma_alt_rates.ndc` — primary or unique
- `pharma_pbm_info.bin` — primary or unique
- `pharma_pbm_info.pbm_name` — for the PBM email lookup
- `pharma_pharmacy_members.user_id` — for the slug resolution path
- `pharma_pharmacy_profile.pharmacy_id` — for the slug resolution path

These are inferences only; actual indexes live in the Supabase project.

---

### Business-Logic Constants Embedded in Code

**EVIDENCE** — `FIXED_FEE = 10.64` (Alabama Medicaid dispensing fee, INFERENCE based on pharmacy domain) is duplicated in two places:
- `src/app/api/user-data/route.ts:216`
- `src/app/api/kpis/route.ts:159`

If this fee changes, both files must be updated.

**Source:** Both cited lines

---

**EVIDENCE** — Brand-vs-Generic discount factor `0.96` (used in `(wac * 0.96) / (pkg_size * pkg_size_mult)`) duplicated in:
- `src/app/api/user-data/route.ts:208`
- `src/app/api/kpis/route.ts:151`

**Source:** Both cited lines

---

## Open Questions

1. (Operator call-out, escalated) Confirmed: the `frank@example.com` hardcode at `AdminPortalContent.tsx:30` is dead. Should it be removed in cleanup, or does any future planned feature require user-email-bound queries?
2. RLS posture: are policies on `pharma_user_data` correctly scoping by `pharmacy_id ∈ (pharma_pharmacy_members.pharmacy_id WHERE user_id = auth.uid())`? Cannot verify from this repo.
3. Are `pharma_baseline` and `pharma_alt_rates` shared across all pharmacies (single AAC/WAC reference data), or per-pharmacy? Their lack of any tenant column in queries suggests shared, but RLS could still scope.
4. Is `pharma_user_data.pdf_file` write at `api/reports/email/route.ts:100` the only writer of this column, or do other paths also write it? Searched code — only that one writer.
5. The hardcoded fallback date window `2025-07-01` to `2025-08-29` — is this the intended permanent demo window, and if so, what happens when 2026 data is uploaded?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
