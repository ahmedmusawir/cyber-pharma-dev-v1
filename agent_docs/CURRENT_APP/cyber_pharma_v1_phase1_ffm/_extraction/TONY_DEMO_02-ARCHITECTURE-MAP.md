# TONY_DEMO_02 — ARCHITECTURE MAP

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The app is a Next.js App Router monolith with five route groups (`(public)`, `(auth)`, `(members)`, `(admin)`, `(superadmin)`), each gated by a layout that calls `protectPage([role])`. State is held in Zustand stores (with one duplicate `store/` ↔ `stores/` directory pair), and Supabase is accessed via three client variants (browser, SSR, service-role). Despite a `src/services/` folder that follows Cyberize doctrine, the OwedBook hero feature **bypasses the service layer entirely** and calls `/api/user-data` directly from a Zustand thunk. Schema lives only inside route handlers as inline `from('table')` queries — there are no migrations, no generated types, no service-layer abstractions.

---

## Findings

### Top-Level Module Boundaries

**EVIDENCE** — Three categories of code in `src/`:

| Layer | Folder | Purpose |
|---|---|---|
| Routes | `src/app/` | App Router pages, layouts, route handlers |
| UI components | `src/components/` | shadcn primitives + composed components |
| Plumbing | `src/{lib, server, services, store, stores, styles, types, utils}/` | helpers, state, types, server-only modules |

**Source:** Top-level directory listing of `src/`, 2026-05-02

---

### Route Group Architecture

**EVIDENCE** — Five route groups under `src/app/`. Each has its own `layout.tsx` that wraps children with role-appropriate chrome and (for authenticated groups) calls `protectPage`.

| Group | Layout file | Protection | Chrome |
|---|---|---|---|
| `(public)` | `src/app/(public)/layout.tsx` | None | `Navbar` + `Main` + `Footer` |
| `(auth)` | `src/app/(auth)/layout.tsx` | None (login is here) | `NavbarLoginReg` only |
| `(members)` | `src/app/(members)/layout.tsx:10-12` | `protectPage(["member"])` | `Navbar` + `Sidebar` (left rail) |
| `(admin)` | `src/app/(admin)/layout.tsx:10-12` | `protectPage(["admin"])` | `Navbar` + `AdminSidebar` (left rail) |
| `(superadmin)` | `src/app/(superadmin)/layout.tsx:9-11` | `protectPage(["superadmin"])` | `Navbar` only |

**Source:** All five `src/app/(*)/layout.tsx` files

---

### Page Inventory

**EVIDENCE** — Concrete user-reachable routes (each backed by a `page.tsx` in App Router):

| Route | File | Required role | Top-level data |
|---|---|---|---|
| `/` | `src/app/(public)/page.tsx` → `HomePageContent.tsx` → `Hero.tsx` | Public | `useAuthStore.user` (client) for CTA branching |
| `/auth` | `src/app/(auth)/auth/page.tsx` → `AuthTabs.tsx` | Public | None |
| `/demo` | `src/app/(public)/demo/page.tsx` → `DemoPageContent.tsx` | Public | None (shadcn typography demo) |
| `/old` | `src/app/(public)/old/page.tsx` → `HomePageContent.tsx` (separate copy) | Public | None |
| `/template` | `src/app/template/page.tsx` → `TemplatePageContent.tsx` | Public (no group layout) | None |
| `/error` | `src/app/error/page.tsx` | Public | None (1-line placeholder) |
| `/admin-portal` | `src/app/(admin)/admin-portal/page.tsx` → `AdminPortalContent.tsx` | admin | `pharma_user_data` + 3 enrichment tables via `/api/user-data` |
| `/profile` | `src/app/(admin)/profile/page.tsx` → `ProfileContent.tsx` | admin | None (forms have hardcoded defaults — see Doc 06) |
| `/settings` | `src/app/(admin)/settings/page.tsx` → `SettingsContent.tsx` | admin | None (form has no submit handler) |
| `/members-portal` | `src/app/(members)/members-portal/page.tsx` | member | None (10-line placeholder) |
| `/booking` | `src/app/(members)/booking/page.tsx` → `InsertForm.tsx` | member | Calls `usePostStore.addPost` → `postServices.createPost` → `${NEXT_PUBLIC_API_BASE_URL}/api/posts` (route does not exist — see Doc 10) |
| `/superadmin-portal` | `src/app/(superadmin)/superadmin-portal/page.tsx` → `SuperadminPortalPageContent.tsx` | superadmin | None (Lorem ipsum placeholder) |
| (404 fallback) | `src/app/not-found.tsx` + per-group `not-found.tsx` | n/a | None |

**Source:** All cited `page.tsx` and `layout.tsx` files

**INFERENCE** — `/template` is the only page outside any route group. It uses no layout protection (Next App Router will render it inside the root layout only).

*Built on:*
- EVIDENCE: `src/app/template/` directory contains `page.tsx` + `TemplatePageContent.tsx`, no `layout.tsx`
- EVIDENCE: No parent `(group)/template/` exists

---

### API Route Inventory

**EVIDENCE** — Eleven `route.ts` files under `src/app/api/`:

| Endpoint | Method(s) | Purpose | Tables touched |
|---|---|---|---|
| `/api/auth/confirm` | GET | Supabase email-OTP verify and redirect | (auth schema only) |
| `/api/auth/login` | GET, POST | POST: `signInWithPassword`. GET: scaffold ("Testing the route") that does `supabase.from('posts').select('*')` | `posts` (GET only — see Doc 10) |
| `/api/auth/logout` | POST | `signOut` | none |
| `/api/auth/logout/route-1.ts` | (inert) | Byte-identical duplicate of `route.ts` — Next.js does not register it | none |
| `/api/auth/signup` | POST | `signUp` with arbitrary `user_metadata` payload | none |
| `/api/auth/superadmin-add-user` | POST | Byte-identical to `signup` (does NOT use admin client, does NOT verify caller role) | none |
| `/api/kpis` | GET | Server-side KPI aggregation (~233 LOC). **Dead** — only `ClaimsServices.getKpis` references it, and `ClaimsServices` itself is dead. | `pharma_user_data`, `pharma_baseline`, `pharma_alt_rates`, `pharma_pbm_info` |
| `/api/pbm-email` | GET | Looks up `email` for a `pbmName` | `pharma_pbm_info` |
| `/api/reports/email` | POST | Builds `.eml` with PDF attachments via `mailcomposer`; updates `pharma_user_data.status='emailed'` | `pharma_pbm_info`, `pharma_pharmacy_profile`, `pharma_user_data` |
| `/api/reports/save` | POST | Generates PDF via `pdfkit`, uploads to `pharma_reports` Storage bucket; resolves pharmacy slug per user | `pharma_pharmacy_members`, `pharma_pharmacy_profile`, Storage |
| `/api/user-data` | GET | THE OwedBook data fetch — batches `pharma_user_data`, enriches with baseline/alt-rates/PBM, applies derived filters | `pharma_user_data`, `pharma_baseline`, `pharma_alt_rates`, `pharma_pbm_info` |

**Source:** All eleven cited route files; method exports verified at top of each file

---

### Component Layout

**EVIDENCE** — `src/components/` is organized by feature domain, not by atomic-design tier:

| Folder | Contents | Notes |
|---|---|---|
| `admin/` | AdminSidebar, FiltersPanel, ReportActions, FiltersDrawerContext, **AdminBookingList** | AdminBookingList exported but never imported (mock data — see Doc 10) |
| `auth/` | AuthTabs, LoginForm, RegisterForm, Logout | All used by `/auth` page |
| `common/` | BackButton, Box, Container, Main, Page, Row, Spinner | Layout primitives |
| `dashboard/` | DashboardCard, sidebar/README.md (only) | DashboardCard never imported; sidebar/ is empty placeholder |
| `global/` | **5 navbar variants** (Navbar, Navbar-1, NavbarHome, NavbarLoginReg, NavbarSuperadmin), ThemeToggler | See Doc 10 — only Navbar and NavbarLoginReg are imported |
| `home/` | Footer, **2 hero variants** (Hero, Hero-1) | Hero-1 unused |
| `layout/` | AdminSidebar (separate from `admin/AdminSidebar.tsx`!), Sidebar | `layout/AdminSidebar` may collide with `admin/AdminSidebar` — verified separate files |
| `profile/` | ProfileContent, forms/{Personal,Contact,Organization}InfoForm.tsx | All forms lack submit handlers (see Doc 06) |
| `settings/` | SettingsContent | No submit handler |
| `ui/` | 17 shadcn primitives (avatar, badge, button, card, command, dialog, dropdown-menu, form, input, label, pagination, table, tabs, textarea, toast, toaster, use-toast) | Generated by shadcn CLI |

**Source:** Recursive listing of `src/components/`, 2026-05-02

---

### State Layer

**EVIDENCE** — Zustand stores exist in TWO directories with overlapping content:

| File | `src/store/` | `src/stores/` | Notes |
|---|:-:|:-:|---|
| `useAuthStore.ts` | ✅ | ✅ | **Byte-identical** between the two (verified by reading both, both 86 lines) |
| `useJsonsrvPostStore.ts` | ✅ | ✅ | Both reference `@/services/jsonsrvPostServices` |
| `usePostStore.ts` | ✅ | ✅ | Both reference `@/services/postServices` |
| `useUserDataStore.ts` | ❌ | ✅ | Only in `stores/` — the live OwedBook store |
| `__tests__/useUserDataStore.test.ts` | ❌ | ✅ | Only in `stores/` |

**Source:** Directory listings of `src/store/` and `src/stores/`, 2026-05-02; full `Read` of `src/store/useAuthStore.ts` and `src/stores/useAuthStore.ts`

**EVIDENCE** — All active imports use `@/stores/` (the plural). Verified via grep: every `useAuthStore` import is from `@/stores/useAuthStore` (LoginForm, Logout, Hero), and `usePostStore` is imported from `@/stores/usePostStore` in `InsertForm.tsx:20`. The singular `src/store/` directory has zero importers in source.

**Source:** Grep `from "@/store/` returns 0 hits in `.tsx` source files; `from "@/stores/` is used by the live components

---

### Service Layer

**EVIDENCE** — `src/services/` contains four files:
- `ClaimsServices.ts` (157 lines) — well-formed service for OwedBook with `getClaims()` and `getKpis()` functions
- `ClaimsServices.test.ts` (82 lines) — Jest test for `getClaims`
- `postServices.ts` (102 lines) — CRUD against `${NEXT_PUBLIC_API_BASE_URL}/api/posts` (route does not exist in this app)
- `jsonsrvPostServices.ts` (122 lines) — CRUD against `https://jsonplaceholder.typicode.com/posts`

**Source:** `src/services/` directory listing

**EVIDENCE** — `ClaimsServices` is dead in production code. `AdminPortalContent.tsx:12` carries the comment `// Removed ClaimsServices - using Zustand store only`, and the only importers of `ClaimsServices` (verified via grep) are `ClaimsServices.test.ts:2`. The `getClaims` and `getKpis` functions are not invoked anywhere in `src/app/**` or `src/components/**`.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:12`; grep `ClaimsServices` across `src/`

**INFERENCE** — The `services/` folder follows Cyberize doctrine in shape but is functionally bypassed: the live OwedBook flow goes `useUserDataStore.fetchUserData()` → `fetch('/api/user-data?...')` directly. The doctrine layer was constructed and then disconnected.

*Built on:*
- EVIDENCE: `src/stores/useUserDataStore.ts:196-204` — `fetch('/api/user-data?limit=10000&skipFilters=true')`
- EVIDENCE: `AdminPortalContent.tsx:12` comment + `AdminPortalContent.tsx:13` direct store import

---

### Supabase Client Architecture

**EVIDENCE** — Three Supabase client constructors, each with a distinct trust boundary:

| File | Client type | Key | Use site |
|---|---|---|---|
| `src/utils/supabase/client.ts` | `createBrowserClient` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `Navbar.tsx` for `auth.getUser()` and `onAuthStateChange` |
| `src/utils/supabase/server.ts` | `createServerClient` (cookie-bound) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All API routes that respect RLS (`/api/user-data`, `/api/kpis`, `/api/auth/*`) and `protectPage` server action |
| `src/utils/supabase/admin.ts` | `createClient` from `@supabase/supabase-js` (no SSR) | `SUPABASE_SERVICE_ROLE_KEY` | `/api/reports/save` (Storage upload + cross-table reads), `/api/reports/email` (DB updates + Storage download), `/api/pbm-email` |

**Source:** All three cited files

**EVIDENCE** — Two additional `*.org.ts` files exist alongside the live ones:
- `src/utils/supabase/server.org.ts` — older variant using synchronous `cookies()` (current `server.ts` uses `await cookies()`)
- `src/utils/supabase/middleware.org.ts` — older middleware that REDIRECTS to `/login` on no user; current `middleware.ts` does NOT redirect (it just refreshes the session)

**Source:** `src/utils/supabase/server.org.ts`; `src/utils/supabase/middleware.org.ts:38-41`

**EVIDENCE** — The `middleware.org.ts` redirect target `/login` does not exist in the route tree; the actual login route is `/auth`. If `middleware.org.ts` were active, every unauthenticated request would redirect to a 404.

**Source:** `src/utils/supabase/middleware.org.ts:40` (redirect to `/login`); `src/app/` directory has no `login/` route

---

### Authorization Architecture

**EVIDENCE** — Authorization primitive is `protectPage(allowedRoles: AppRole[])` defined as a server action:

```ts
// src/utils/supabase/actions.ts:7-23
"use server";
export async function protectPage(allowedRoles: AppRole[]) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  if (!user) return redirect("/auth");
  const userRole = getUserRole(user.user_metadata);
  if (!userRole || !allowedRoles.includes(userRole)) return redirect("/auth");
  return user;
}
```

**Source:** `src/utils/supabase/actions.ts:1-23`

**EVIDENCE** — Role resolution from `user_metadata` is in `src/utils/get-user-role.ts:9-27`. Priority order: superadmin > admin > member. Accepts numeric (1/0), boolean, and string variants.

**Source:** `src/utils/get-user-role.ts:9-27`

**EVIDENCE** — Three role layouts call `protectPage`:
- `src/app/(admin)/layout.tsx:11` → `await protectPage(["admin"])`
- `src/app/(members)/layout.tsx:11` → `await protectPage(["member"])`
- `src/app/(superadmin)/layout.tsx:10` → `await protectPage(["superadmin"])`

**Source:** All three cited layout files

---

### Data Flow Diagram (OwedBook hot path)

**EVIDENCE** — From URL `/admin-portal` to rendered tables:

```
Browser → Next middleware (refresh session cookie)
       → (admin)/layout.tsx → protectPage(["admin"]) 
            ├─ supabase.auth.getUser() (server, anon, RLS-bound)
            └─ getUserRole(user.user_metadata) → "admin" | redirect("/auth")
       → admin-portal/page.tsx → AdminPortalContent (client component)
            └─ React.useEffect → useUserDataStore.fetchUserData()
                 └─ fetch('/api/user-data?limit=10000&skipFilters=true', { cache: 'no-store' })
                      → /api/user-data/route.ts GET
                           ├─ supabase.auth.getUser() (re-check, anon, RLS-bound)
                           ├─ batch loop (1000 rows at a time):
                           │    ├─ from('pharma_user_data').select('*').range(start, ...)
                           │    ├─ from('pharma_baseline').select('ndc,aac,drug_name').in('ndc', ndcs)
                           │    ├─ from('pharma_alt_rates').select('ndc,wac,pkg_size,pkg_size_mult,generic_indicator').in('ndc', ndcs)
                           │    ├─ from('pharma_pbm_info').select('bin,pbm_name').in('bin', bins)
                           │    └─ enrich + derive method/expected/owed (FIXED_FEE = 10.64)
                           └─ NextResponse.json({ rows, total, page, limit })
                 └─ useUserDataStore: set({ allRows: rows }) → applyFilters() → calculateKPIs()
            └─ React renders: KPI strip + 4 tabs (Commercial / Updated / Federal / Summary)
```

**Source:** Full traces in `src/middleware.ts`, `src/app/(admin)/layout.tsx`, `src/app/(admin)/admin-portal/{page,AdminPortalContent}.tsx`, `src/stores/useUserDataStore.ts:191-236`, `src/app/api/user-data/route.ts:31-127,129-277`

---

### Notable Architectural Choices

**EVIDENCE** — `next.config.js:7-28` sets a global `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` header on every response. This effectively disables Next.js's built-in caching for the entire app.

**Source:** `next.config.js:7-28`

---

**EVIDENCE** — Login flow uses `window.location.reload()` (hard refresh) rather than client-side router push, to "sync client caches with server auth cookies" (per inline comment).

**Source:** `src/stores/useAuthStore.ts:61-62`

---

**EVIDENCE** — The OwedBook store fetches **the entire dataset** (`limit=10000`) on mount, then does all filtering/sorting/KPI math client-side. The server-side filter parameters in `/api/user-data` (`dateFrom`, `dateTo`, `pbm`, `owedType`, `method`) are ignored on the live path because the store doesn't pass them.

**Source:** `src/stores/useUserDataStore.ts:196-198`; `src/app/api/user-data/route.ts:36-50` (params parsed but receive nothing on the OwedBook fetch)

---

## Open Questions

1. The `src/store/` directory appears entirely vestigial. Should it be deleted in a cleanup, or does it serve as a fallback that some external tooling references? (Operator guidance needed.)
2. The `ClaimsServices.ts` service layer matches Cyberize doctrine but is bypassed. Was this a deliberate architecture pivot ("just use Zustand to fetch") or an in-progress migration that stalled?
3. `/api/kpis` (~233 LOC of careful Python-parity logic) is dead because nothing calls it. Should it be considered the canonical KPI definition (in case the client-side logic in `useUserDataStore.calculateKPIs` is the throwaway), or is it the throwaway? They produce different numbers in some edge cases (server-side counts only rows with AAC available; client-side counts all commercial rows after filter).

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
