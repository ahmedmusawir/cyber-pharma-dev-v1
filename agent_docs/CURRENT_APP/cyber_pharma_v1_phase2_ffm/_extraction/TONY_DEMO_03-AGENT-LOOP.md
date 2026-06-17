# TONY_DEMO_03 — REQUEST LIFECYCLE (adapted from AGENT-LOOP)

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

This is not an agent — it's a Next.js web app. This document traces the request/response lifecycle for the three highest-value paths: (1) the OwedBook page render at `/admin-portal`, (2) login at `/auth`, and (3) PDF report save + email at `/api/reports/{save,email}`. The OwedBook path is the canonical hot path — every request goes through middleware (cookie refresh) → role-gated layout (server-side `protectPage`) → client component mount → Zustand thunk → API route → batched Supabase queries → derived enrichment → client-side filter and KPI math.

---

## Findings

### Lifecycle 1 — OwedBook Page Render (`GET /admin-portal`)

The hero path. Approximately 11 sequential operations from URL to rendered table.

**EVIDENCE** — Step 1: Browser issues `GET /admin-portal`. Next.js middleware matcher in `src/middleware.ts:9-18` excludes only static assets, so this request reaches middleware.

**Source:** `src/middleware.ts:9-18`

---

**EVIDENCE** — Step 2: Middleware delegates to `updateSession(request)` (`src/utils/supabase/middleware.ts:4-53`). This:
- creates a server-side Supabase client with anon key, bound to request cookies
- calls `supabase.auth.getUser()` (line 37) which refreshes the session cookie if expired
- returns `supabaseResponse` with any updated cookies attached
- **does NOT redirect or gate** — the inline comment at line 36 explicitly says "let layouts handle auth"

**Source:** `src/utils/supabase/middleware.ts:4-53`

---

**EVIDENCE** — Step 3: Next.js routes `/admin-portal` → `src/app/(admin)/admin-portal/page.tsx`. Before rendering, it executes the `(admin)` route group's `layout.tsx`.

**Source:** `src/app/(admin)/admin-portal/page.tsx:1-7`; `src/app/(admin)/layout.tsx`

---

**EVIDENCE** — Step 4: `(admin)/layout.tsx:11` calls `await protectPage(["admin"])` (server action). This:
- creates an SSR Supabase client (`src/utils/supabase/server.ts`)
- `supabase.auth.getUser()` to fetch the user
- if no user → `redirect("/auth")` (terminates request)
- `getUserRole(user.user_metadata)` derives the role from `is_qr_*` flags (`src/utils/get-user-role.ts:9-27`)
- if role not in `["admin"]` → `redirect("/auth")` (terminates request)

**Source:** `src/utils/supabase/actions.ts:7-23`; `src/app/(admin)/layout.tsx:10-12`

---

**EVIDENCE** — Step 5: Layout renders chrome (Navbar + AdminSidebar at desktop widths) and slots `{children}`. `Navbar.tsx:51-69` mounts a separate browser-side `supabase.auth.getUser()` call to populate its avatar/email — this is a SECOND auth lookup for the same request, on the client side.

**Source:** `src/app/(admin)/layout.tsx:13-23`; `src/components/global/Navbar.tsx:51-69`

---

**EVIDENCE** — Step 6: `page.tsx` returns `<AdminPortalContent />` (a `"use client"` component, 748 LOC). `AdminPortalContent` declares `const email = "frank@example.com"` at line 30 — this value is never read in the rest of the component (verified by grep within file).

**Source:** `src/app/(admin)/admin-portal/page.tsx:1-7`; `src/app/(admin)/admin-portal/AdminPortalContent.tsx:29-30`

---

**EVIDENCE** — Step 7: On mount, `React.useEffect(() => { if (filteredRows.length === 0) fetchUserData() }, [])` fires (lines 74-79). This calls `useUserDataStore.fetchUserData()`.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:74-79`

---

**EVIDENCE** — Step 8: `fetchUserData` (`src/stores/useUserDataStore.ts:191-236`):
- sets `loading: true, error: null`
- `fetch('/api/user-data?limit=10000&skipFilters=true', { cache: 'no-store' })`
- on success: maps response rows to the store `Row` shape, stores in `allRows`, calls `applyFilters()`
- on failure: stores error message, sets `loading: false`

**Source:** `src/stores/useUserDataStore.ts:191-236`

---

**EVIDENCE** — Step 9: `/api/user-data/route.ts` GET handler (`src/app/api/user-data/route.ts:31-127`):
- Parses 12 query params (dateFrom, dateTo, script, ndc, drug, bin, status, owedType, method, pbm, sortKey, sortDir, page, limit). On the OwedBook initial fetch, only `limit=10000` is meaningful — `skipFilters=true` is parsed implicitly via `params.get` but never consulted.
- Creates SSR Supabase client.
- Calls `supabase.auth.getUser()` (line 63). If no user → `401 Unauthorized`. Inline comment at line 62: `// Ensure caller is authenticated; otherwise RLS will silently return 0 rows.`
- Enters batched read loop: `from('pharma_user_data').select('*').range(start, start+999)` ordered by `date_dispensed desc, script asc`.
- For each batch, calls `processBatch(...)` which:
   1. Collects unique `drug_ndc` and `bin` values
   2. Issues `from('pharma_baseline').select('ndc,aac,drug_name').in('ndc', ndcs)` — AAC lookup
   3. Issues `from('pharma_alt_rates').select('ndc,wac,pkg_size,pkg_size_mult,generic_indicator').in('ndc', ndcs)` — WAC lookup
   4. Issues `from('pharma_pbm_info').select('bin,pbm_name').in('bin', bins)` — PBM classification
   5. Computes per-row: method (AAC > WAC > Other), expected (`qty * aac + 10.64`), owed (`-(paid - expected)`), pbmName (Federal if no match)
   6. Filters by `owedType`, `method`, `pbm` if any of those query params are set
- Loops until a batch returns < 1000 rows
- Slices final result for pagination, returns `{ rows, total, totalAfterDerivedFilters, page, limit }`

**Source:** `src/app/api/user-data/route.ts:31-127,129-277`

---

**EVIDENCE** — Step 10: Back in `useUserDataStore.fetchUserData`, the response is mapped, stored, and `applyFilters()` runs (line 228). `applyFilters` calls `applyClientSideFilters(allRows, filters)` (which initially is a no-op since `filters: {}` at boot) and then `calculateKPIs(filteredRows)` (`src/stores/useUserDataStore.ts:114-140`):
- `commercialRows = rows.filter(r => r.pbmName !== 'Federal')`
- `scriptsCommercial = commercialRows.length`
- `underpaidCommercialAbs = sum(commercialRows.filter(r => r.owed > 0).map(r => r.owed))`
- `updatedDifferenceTotal = sum(commercialRows.filter(r => r.newPaid != null).map(r => r.newPaid - r.paid))`
- `owedTotal = underpaidCommercialAbs - updatedDifferenceTotal`

**Source:** `src/stores/useUserDataStore.ts:114-140,179-185`

---

**EVIDENCE** — Step 11: React re-renders. The KPI strip at `AdminPortalContent.tsx:341-363` displays the four pills (Commercial Underpaid, Commercial Scripts, Updated Difference, Owed). The active tab (default `"commercial"` per line 379) renders its table from `sortedRows` (lines 446-532) which derives from `paginatedRows` → `displayRows` → `filteredRows`.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:341-363,378-422,424-535`

---

**INFERENCE** — The OwedBook hot path involves THREE separate `supabase.auth.getUser()` calls per page load (middleware, server-side `protectPage`, client-side Navbar). It also does ONE bulk fetch that pulls up to 10,000 rows from `pharma_user_data` plus N+M+P enrichment lookups against the three reference tables.

*Built on:*
- EVIDENCE: `src/utils/supabase/middleware.ts:37` (call 1)
- EVIDENCE: `src/utils/supabase/actions.ts:10` (call 2 in `protectPage`)
- EVIDENCE: `src/components/global/Navbar.tsx:53` (call 3 in client)
- EVIDENCE: `src/app/api/user-data/route.ts:63,77-92,143-148,156-170,174-180`

---

### Lifecycle 2 — Login (`POST /api/auth/login`)

**EVIDENCE** — Step 1: User submits `LoginForm` (`src/components/auth/LoginForm.tsx:67-78`). It calls `login(email, password)` from `useAuthStore`.

**Source:** `src/components/auth/LoginForm.tsx:67-78`

---

**EVIDENCE** — Step 2: `useAuthStore.login` (`src/stores/useAuthStore.ts:28-63`):
- `fetch('/api/auth/login', { method: 'POST', body: { email, password } })`
- on success: `set({ user, roles: user.user_metadata, isAuthenticated: true })`
- decides redirect target by reading `user.user_metadata.is_qr_*`:
  - `is_qr_superadmin === 1` → `/superadmin-portal`
  - else `is_qr_admin === 1` → `/admin-portal`
  - else `is_qr_member === 1` → `/members-portal`
  - else → `/`
- Stores target in `localStorage["redirectAfterLogin"]`
- Calls `window.location.reload()` for a hard refresh

**Source:** `src/stores/useAuthStore.ts:28-63`

---

**EVIDENCE** — Step 3: `/api/auth/login/route.ts:28-61` POST handler:
- reads `{ email, password }` from request JSON
- creates SSR Supabase client
- `supabase.auth.signInWithPassword({ email, password })`
- on error → 400 with message
- on success → 200 JSON `{ data }` plus aggressive no-cache headers and a debug header `x-login-cookie-names: sb-access-token,sb-refresh-token`

**Source:** `src/app/api/auth/login/route.ts:28-61`

---

**EVIDENCE** — Step 4: After `window.location.reload()`, `LoginForm.tsx:57-65` runs in a `useEffect` on mount and reads `localStorage["redirectAfterLogin"]`. If present, it `router.replace(target)` and removes the localStorage key.

**Source:** `src/components/auth/LoginForm.tsx:55-65`

---

**EVIDENCE** — `useAuthStore` is wrapped in Zustand's `persist` middleware with `name: "auth-store"` (`useAuthStore.ts:81-83`), so the user shape and roles persist across page loads in `localStorage`. Note that this is in addition to the Supabase HTTP cookies that drive server-side auth.

**Source:** `src/stores/useAuthStore.ts:17-18,81-83`

---

**INFERENCE** — There are TWO sources of truth for "is this user logged in":
- Supabase session cookies (server-side, authoritative for RLS)
- `useAuthStore` persisted state (client-side, drives UI like Hero CTA branching)

These can diverge. If a Supabase session expires while the persisted `useAuthStore.user` is still set, components like `Hero.tsx:46-69` will render an authenticated CTA even though server-side requests will return 401.

*Built on:*
- EVIDENCE: `src/components/home/Hero.tsx:7,46-69` reads only `useAuthStore`
- EVIDENCE: `src/utils/supabase/middleware.ts:36-37` refreshes the session cookie but does not signal the client
- EVIDENCE: `src/stores/useAuthStore.ts:81-83` persists to localStorage with name "auth-store"

---

### Lifecycle 3 — PDF Save & Email (`POST /api/reports/save` then `POST /api/reports/email`)

**EVIDENCE** — Step 1: User clicks "Save PDF" in `ReportActions.tsx`. Visibility gate: `canShowSave = owedType === "underpaid" && pbm !== "All"` (`ReportActions.tsx:50`).

**Source:** `src/components/admin/ReportActions.tsx:50,268-278`

---

**EVIDENCE** — Step 2: `handleSave` (`ReportActions.tsx:97-149`):
- POST `/api/reports/save` with `{ tab, dateFrom, dateTo, owedType, pbmName, rows: filteredRows }`
- Falls back to hardcoded `dateFrom = "2025-07-01"` / `dateTo = "2025-08-29"` if filters are empty (lines 34-35)
- On JSON success response: extracts `pdfPath`, calls `setLastSavedPdfForContext(activeTab, pbm, dateFrom, dateTo, [data.pdfPath])`

**Source:** `src/components/admin/ReportActions.tsx:34-35,97-149`

---

**EVIDENCE** — Step 3: `/api/reports/save/route.ts:19-82`:
- Parses payload `{ tab, dateFrom, dateTo, pbmName, rows, noAuthDownload? }`
- If `noAuthDownload === true`: builds PDF with `generateReportPdfBuffer(rows, { title, subtitle })` and returns `Content-Type: application/pdf` direct download (no upload, no auth)
- Otherwise:
   - SSR `supabase.auth.getUser()` → 401 if no user
   - `createAdminClient()` (service role)
   - `getPharmacySlugForUser(supa, user.id)`:
      - `pharma_pharmacy_members.select(pharmacy_id).eq(user_id, userId).maybeSingle()`
      - `pharma_pharmacy_profile.select(pharmacy_slug).eq(pharmacy_id, ...).maybeSingle()`
   - If no slug → 403
   - Builds storage path `${pharmacySlug}/${folderForTab(tab)}/${buildReportFilename(...)}`
   - `supa.storage.from('pharma_reports').upload(storagePath, pdf, { upsert: true })`
   - `supa.storage.from('pharma_reports').createSignedUrl(storagePath, 3600)`
   - Returns `{ ok: true, pdfPath, signedUrl }`

**Source:** `src/app/api/reports/save/route.ts:19-82,122-155`

---

**EVIDENCE** — Step 4: PDF generation in `src/server/reports/pdf.ts:26-81`:
- Uses `pdfkit/js/pdfkit.standalone.js` (bundled fonts, avoids fs reads)
- Default 9 columns: Date, Script, NDC, Drug, Qty, Expected, Paid, Owed, Method
- Buffers chunks via `doc.on('data', ...)`, resolves on `doc.on('end', ...)`

**Source:** `src/server/reports/pdf.ts:26-81`

---

**EVIDENCE** — Step 5: User then clicks "Send Email". `handleEmail` (`ReportActions.tsx:195-232`) POSTs `/api/reports/email` with `{ tab, dateFrom, dateTo, pbmName, pdfPaths: savedPaths }`.

**Source:** `src/components/admin/ReportActions.tsx:195-232`

---

**EVIDENCE** — Step 6: `/api/reports/email/route.ts:15-133`:
- Looks up PBM email from `pharma_pbm_info.select(email).eq(pbm_name, pbmName).limit(1)` using admin client
- If no email → 404
- For each `pdfPath`: `supa.storage.from('pharma_reports').download(path)` → attaches to mail
- Builds `.eml` via `mailcomposer({ from: 'noreply@cyberpharma.local', to: pbmEmail, subject, text, attachments }).build(...)`
- Best-effort DB update: `pharma_user_data.update({ status: 'emailed', pdf_file: normalized }).eq(pharmacy_id, ...).gte/lte(date_dispensed, ...).is/in(bin, ...)` — wrapped in try/catch, errors logged but not propagated
- Returns the `.eml` buffer with `Content-Type: message/rfc822` so the user's desktop email client opens it

**Source:** `src/app/api/reports/email/route.ts:15-133`

---

### Notable Lifecycle Properties

**EVIDENCE** — All API responses set `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` either explicitly (login route lines 22-24) or via the global `next.config.js` headers config (lines 7-28).

**Source:** `next.config.js:7-28`; `src/app/api/auth/login/route.ts:22-24,39-41,46-48`

---

**EVIDENCE** — `/api/auth/login/route.ts` exports also include `dynamic = "force-dynamic"`, `revalidate = 0`, `fetchCache = "force-no-store"` (lines 5-7) — explicit cache-disabling on top of the global header.

**Source:** `src/app/api/auth/login/route.ts:5-7`

---

**EVIDENCE** — `/api/reports/{save,email}` declare `export const runtime = "nodejs"` to opt out of Edge runtime (required for `pdfkit` and `mailcomposer` which depend on Node Buffer / fs).

**Source:** `src/app/api/reports/save/route.ts:1`; `src/app/api/reports/email/route.ts:1`

---

## Open Questions

1. The hardcoded fallback dates `2025-07-01` / `2025-08-29` in `ReportActions.tsx:34-35` are baked into report saving. Are these the intended permanent demo window (Coach is vibing on this date range)? Or stale defaults that should expire?
2. Why does the OwedBook always fetch `limit=10000` and apply filters client-side rather than push filters into `/api/user-data`? The route accepts the filters but the store never sends them.
3. Is the `skipFilters=true` query parameter on the OwedBook fetch (`useUserDataStore.ts:196`) intended to be honored by the route? Currently the route does not check for it (verified — `skipFilters` does not appear in `route.ts`).

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
