# TONY_DEMO_08 — ERROR HANDLING AND RECOVERY

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

Error handling is consistent at the API-route boundary (each route wraps its handler in a try/catch returning `{ error: message }` JSON) but inconsistent in the UI: the OwedBook stores errors in Zustand and renders an inline red banner, while `ReportActions` uses native `window.alert()` calls. There is no React Error Boundary, no `error.tsx` boundary file in any App Router segment, no retry logic on failed fetches, and no toast-based recovery affordance for async failures. The PDF/email best-effort DB updates swallow errors with `console.warn`. Recovery from auth-state divergence relies on hard `window.location.reload()` rather than graceful refresh.

---

## Findings

### API Route Error Pattern

**EVIDENCE** — Every API route follows the same structure: `try { ... return NextResponse.json(success) } catch (e: any) { console.error(...); return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 }) }`. Verified in:
- `src/app/api/user-data/route.ts:32-127` (try block) and `120-126` (catch)
- `src/app/api/kpis/route.ts:18-227` (try) and `228-231` (catch)
- `src/app/api/reports/save/route.ts:20-78` (try) and `79-81` (catch)
- `src/app/api/reports/email/route.ts:16-129` (try) and `130-132` (catch)

**Source:** Cited line ranges

---

**EVIDENCE** — Error responses use a `jsonError(status, message)` helper in `reports/save` and `reports/email`:
```ts
function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status, headers: { "Content-Type": "application/json" },
  });
}
```

**Source:** `src/app/api/reports/save/route.ts:114-119`; `src/app/api/reports/email/route.ts:135-140`

---

**EVIDENCE** — Other routes (`user-data`, `kpis`, `auth/login`, `auth/logout`, `auth/signup`, `auth/superadmin-add-user`) use `NextResponse.json({ error: ... }, { status: ... })` directly. Two patterns coexist for the same purpose.

**Source:** All cited route files

---

### Auth Flow Error Surfacing

**EVIDENCE** — Login: `LoginForm.tsx:73-77` catches the error from `useAuthStore.login`, logs to console, sets local `error` state, sets `isLoading=false`. The error is rendered as a `<div>` below the form (line 137-141).

**Source:** `src/components/auth/LoginForm.tsx:67-78,137-141`

---

**EVIDENCE** — Signup: `RegisterForm.tsx:87-93` checks `response.ok`. On error, parses the JSON body and sets `error` state with `result.error`. Logs to console. No try/catch — if the `fetch` itself fails (network), the unhandled promise rejection bubbles up.

**Source:** `src/components/auth/RegisterForm.tsx:73-93`

---

**EVIDENCE** — Logout: `Logout.tsx:16-23` checks `response.ok`. On failure, only logs to console — no UI feedback to the user. The user is not told the logout failed.

**Source:** `src/components/auth/Logout.tsx:12-24`

---

### OwedBook Error Surfacing

**EVIDENCE** — `useUserDataStore.fetchUserData` wraps the `fetch` in try/catch (`useUserDataStore.ts:191-235`). On failure, sets `error: error.message || 'Failed to fetch data'` and `loading: false` in store state.

**Source:** `src/stores/useUserDataStore.ts:191-235`

---

**EVIDENCE** — `AdminPortalContent.tsx` reads `error` from the store and renders an inline red banner per tab when present:
- Commercial tab: `<div className="m-3 rounded border border-red-300 bg-red-50 p-3 text-red-700 text-sm">{error}</div>` (line 440-442)
- Updated tab: line 543
- Federal tab: line 612
- Summary tab: line 696

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:440-442,543,612,696`

---

**EVIDENCE** — There is no "Retry" button or affordance attached to the error display. The only path to recovery is to click "Get Fresh Data" in the filter sidebar (which calls `fetchUserData` again) — but that button lives behind the filter UI, not adjacent to the error.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:309-318` (mobile refresh handler) and `src/components/admin/AdminSidebar.tsx:50` (`onRefresh={() => fetchUserData()}`)

---

### Report Actions Error Surfacing

**EVIDENCE** — `ReportActions.tsx` uses native `window.alert()` for all error feedback:
- Save error: `alert(e.message || "Save failed")` (line 145)
- Save success: `alert("Report saved successfully.")` (line 124)
- Save unknown content type fallback: `alert("Save completed.")` (line 141)
- Download error: `alert(e.message || "Download failed")` (line 189)
- Email error: `alert(e.message || "Email failed")` (line 228)

**Source:** `src/components/admin/ReportActions.tsx:124,141,144-145,188-189,227-228`

---

**EVIDENCE** — The `useToast` toast system is wired up in the root layout (`src/components/ui/toaster.tsx` mounted via `app/layout.tsx:36`) but is NOT used by `ReportActions`. The booking form (`InsertForm.tsx:38,54-64`) is the only consumer of `useToast` in `src/app/`.

**Source:** `src/app/layout.tsx:4,36`; `src/components/ui/toaster.tsx`; grep `useToast` returns hits only in the toast component, the use-toast hook, and `InsertForm.tsx`

---

### Missing Error Boundaries

**GAP** — No React Error Boundary component exists in the repo. Searched for `componentDidCatch`, `getDerivedStateFromError`, `ErrorBoundary` — zero matches in `src/`.

**GAP** — No `error.tsx` file exists in any App Router segment. Searched `src/app/**/error.tsx` — only `src/app/error/page.tsx` exists (a route, not an error boundary). App Router segments without an `error.tsx` use the default Next.js error page on render-time exceptions.

**GAP** — No `global-error.tsx` at the root (Next 13+ root error boundary).

**Implication for downstream:** Render-time exceptions in any client component (e.g., `AdminPortalContent`, `Hero`, `ReportActions`) will bubble to the default Next.js error page rather than showing a contextual error within the route segment.

---

### Loading States

**EVIDENCE** — Each role-protected route group has a `loading.tsx`:
- `src/app/(admin)/loading.tsx`
- `src/app/(members)/loading.tsx`
- `src/app/(public)/loading.tsx`
- `src/app/(superadmin)/loading.tsx`
- `src/app/(public)/old/loading.tsx`

(Contents not deeply read but they exist as App Router loading boundaries.)

**Source:** Directory listings of each `(group)/` folder, 2026-05-02

---

**EVIDENCE** — The OwedBook uses two loading visualizations:
- `<Spinner />` (`src/components/common/Spinner.tsx`) inside the KPI strip when `loading=true` (line 344-346)
- `<Loader2 className="animate-spin" />` (lucide-react icon) inside tab triggers and apply buttons during transient operations

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:344-346,391-393,399-401,407-409,415-417`

---

**EVIDENCE** — A `uiBusyMobile` boolean (`AdminPortalContent.tsx:49`) provides a 200ms transient busy indicator for filter Apply on mobile. The `useEffect` polls `loading` every 100ms after Refresh until store loading flips false (`AdminPortalContent.tsx:312-318`) — manual polling rather than reactive subscription.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:49,309-318`

---

### Network Failure Handling

**GAP** — No retry logic on any fetch call. `useUserDataStore.fetchUserData` makes a single attempt, sets error on failure (`useUserDataStore.ts:191-236`). `ReportActions.tsx` makes single attempts for save/download/email. `useAuthStore.login` makes a single attempt.

**GAP** — No exponential backoff, no jitter, no circuit breaker patterns in any store or component.

**GAP** — No offline detection. `navigator.onLine` is not checked anywhere. Verified via grep.

---

### Best-Effort Updates with Swallowed Errors

**EVIDENCE** — `/api/reports/email/route.ts:69-119` wraps the `pharma_user_data` status update in `try { ... } catch (updateErr) { console.warn(...); }` — if the DB update fails, the email response still succeeds (the user gets the `.eml` download). The failure is logged server-side only.

**Source:** `src/app/api/reports/email/route.ts:69-119`

---

**EVIDENCE** — `getPharmacySlugForUser` in `/api/reports/save/route.ts:122-155` returns `null` on any lookup failure (membership row missing, profile row missing) and logs intermediate states with `console.debug`. The route then returns 403 ("No pharmacy slug found"). No distinction is made between "user has no membership" vs "membership exists but profile lookup failed".

**Source:** `src/app/api/reports/save/route.ts:122-155`

---

**EVIDENCE** — `Hero.tsx:7` reads `useAuthStore.user`. If the persisted user state is stale (Supabase session expired but Zustand still has the user), the Hero renders authenticated CTAs that will redirect to `/auth` when clicked. There is no synchronization check between `useAuthStore.user` and `supabase.auth.getUser()`.

**Source:** `src/components/home/Hero.tsx:6-69`; `src/stores/useAuthStore.ts:81-83` (persist middleware)

---

### Edge Cases in Number Coercion

**EVIDENCE** — `useUserDataStore.fetchUserData` (lines 205-223) coerces every numeric field via `Number(...)` or `typeof ... === 'number' ? ... : Number(...)`. If the API returns `NaN` (e.g., `Number("abc")`), it propagates silently — `NaN > 0` is false, `NaN.toFixed(2)` returns `"NaN"`, which would render in tables.

**Source:** `src/stores/useUserDataStore.ts:205-223`

---

**EVIDENCE** — `applyClientSideFilters` (lines 75-112) uses string `localeCompare` for date filtering: `row.date >= filters.dateFrom`. Since `date` strings come as `YYYY-MM-DD`, lexicographic comparison works correctly. If the API ever returns a non-ISO date format, the comparison silently malfunctions.

**Source:** `src/stores/useUserDataStore.ts:75-112`

---

**EVIDENCE** — `Federal Dollars` tab shows `(r.paid - r.expected)` as the diff but uses the same `r.owed` sort key (`AdminPortalContent.tsx:678,656-660`). The displayed number and the sort key are different formulas — sorting by "Diff" sorts the rendered value but with sign convention from `r.owed` (which is `-(paid-expected)`). Result: ascending sort by Diff displays as descending by displayed-value.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:656-660,678`

---

### Recovery via Hard Refresh

**EVIDENCE** — Both `login` and `logout` in `useAuthStore` call `window.location.reload()` (lines 62, 78) to "sync client caches with server auth cookies". This loses all in-memory state (including the Zustand `useUserDataStore.allRows` cache) and forces a full page reload.

**Source:** `src/stores/useAuthStore.ts:61-62,77-78`

---

### Confirmation Email Failure Path

**EVIDENCE** — `/api/auth/confirm/route.ts:30-32`: if OTP verification fails, redirects to `/error` (which renders only `<p>Sorry, something went wrong</p>`). The user gets no diagnostic information and no path to retry.

**Source:** `src/app/api/auth/confirm/route.ts:30-32`; `src/app/error/page.tsx:1-3`

---

### Async Concurrency

**GAP** — No request cancellation. `fetchUserData` does not use `AbortController`. If a user clicks "Get Fresh Data" twice in quick succession, both requests fire and the later response overwrites the earlier (or vice versa, depending on completion order).

**Source:** `src/stores/useUserDataStore.ts:191-236` — no `AbortController` usage

---

**EVIDENCE** — `ReportActions.tsx` does use `let abort = false; ... return () => { abort = true; }` cleanup pattern in the PBM email lookup `useEffect` (lines 58-80). This guards against state updates after unmount but does not actually cancel the in-flight `fetch`.

**Source:** `src/components/admin/ReportActions.tsx:58-80`

---

### Logging Posture

**EVIDENCE** — Server-side `console.error` logs include the route path:
- `console.error("/api/user-data GET error", e);`
- `console.error("/api/kpis GET error", e);`

Client-side `console.error` logs include context strings ("Login error:", "Signup error:", "Failed to log out", "[ReportActions] Save success") in various components.

**Source:** Multiple cited files

---

## Open Questions

1. Is the `window.alert()` pattern in `ReportActions` deliberate (operator preference) or a quick stub that should be migrated to the existing toast system?
2. Should `/api/reports/email`'s best-effort DB update failure surface to the user, or is silent-fail-with-server-log acceptable?
3. The OwedBook fetches up to 10,000 rows on mount with no progress indication beyond a spinner — is a slow fetch acceptable UX, or should there be a count-rendered-rows-as-they-arrive pattern?
4. With no error boundaries, any render exception in `AdminPortalContent` will white-screen the whole admin route. Acceptable for demo, but for production?
5. Date sort by string comparison is fragile. Should there be a Date object conversion?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
