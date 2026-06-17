# TONY_DEMO_07 — SECURITY (adapted from GUARDRAILS-AND-SANDBOXING)

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

The security model is layered: Supabase Auth handles identity (cookies set via `@supabase/ssr`), `protectPage(allowedRoles)` enforces role gates at the layout level (server-side, redirecting on failure), and Supabase RLS is presumed to scope rows for data routes. Several findings warrant flagging: the misleadingly-named `/api/auth/superadmin-add-user` is byte-identical to public `/api/auth/signup` and performs no authorization check; the role-flag system uses raw `user_metadata` (client-mutable in some Supabase configurations); cookies are set with `httpOnly: false` so they're accessible to JS in the browser; and the registration flow assigns roles on the basis of fully client-supplied `user_metadata`. RLS posture cannot be verified from this repo since no policies are committed.

---

## Findings

### Authentication

**EVIDENCE** — Auth provider: Supabase Auth via `@supabase/ssr`. Identity is established by `supabase.auth.signInWithPassword({ email, password })` in `/api/auth/login` POST handler.

**Source:** `src/app/api/auth/login/route.ts:32-35`

---

**EVIDENCE** — Session cookies are set by Supabase SSR. Cookie configuration in `src/utils/supabase/server.ts:21-26`:
```ts
const cookieOptions = {
  ...options,
  secure,                  // determined by NEXT_PUBLIC_SITE_URL.startsWith('https://')
  sameSite: 'lax' as const,
  httpOnly: false,         // Supabase needs client access
}
```

**Source:** `src/utils/supabase/server.ts:21-26`

**INFERENCE** — The `httpOnly: false` setting allows the browser-side `@supabase/ssr` `createBrowserClient` (`src/utils/supabase/client.ts`) to read auth cookies. This is required by Supabase's SSR pattern but means session cookies are accessible to any JavaScript running in the document — including third-party scripts if loaded. No CSP header is present (verified by reading `next.config.js`).

*Built on:*
- EVIDENCE: `src/utils/supabase/server.ts:25` (`httpOnly: false`)
- EVIDENCE: `src/utils/supabase/client.ts:1-8` (browser client uses cookies)
- EVIDENCE: `next.config.js:7-28` (only Cache-Control/Pragma/Expires headers; no CSP, no X-Frame-Options, no Strict-Transport-Security)

---

**EVIDENCE** — Middleware refreshes the session on every (non-static) request via `supabase.auth.getUser()` at `src/utils/supabase/middleware.ts:37`. The middleware does NOT redirect or gate — auth enforcement is delegated to layouts.

**Source:** `src/utils/supabase/middleware.ts:36-37`

---

**EVIDENCE** — A vestigial `middleware.org.ts` exists alongside the active middleware. It DOES enforce auth at the middleware layer (`src/utils/supabase/middleware.org.ts:38-41`), redirecting to `/login` on no-user. **Critical:** the redirect target `/login` does not exist in the route tree — the active login page is at `/auth`. If `middleware.org.ts` were ever swapped in as the active middleware, all unauthenticated requests would 404 instead of reaching the login page.

**Source:** `src/utils/supabase/middleware.org.ts:38-41`; absence of `/login` route in `src/app/`

---

### Authorization (Role Gates)

**EVIDENCE** — Authorization primitive: `protectPage(allowedRoles: AppRole[])` in `src/utils/supabase/actions.ts:7-23`. Steps:
1. SSR Supabase client
2. `auth.getUser()` — if no user, `redirect("/auth")`
3. `getUserRole(user.user_metadata)` — derives role
4. If role is null OR not in `allowedRoles`, `redirect("/auth")`

**Source:** `src/utils/supabase/actions.ts:7-23`

---

**EVIDENCE** — `getUserRole` resolution priority (highest to lowest): `superadmin` > `admin` > `member`. Returns first match. Reads `is_qr_superadmin`, `is_qr_admin`, `is_qr_member` from `user.user_metadata`. Accepts truthy values: number `1`, boolean `true`, string `'1'` or `'true'`. All other values count as false.

**Source:** `src/utils/get-user-role.ts:9-27`

---

**EVIDENCE** — Three layouts call `protectPage`:
- `src/app/(admin)/layout.tsx:11` — `protectPage(["admin"])`
- `src/app/(members)/layout.tsx:11` — `protectPage(["member"])`
- `src/app/(superadmin)/layout.tsx:10` — `protectPage(["superadmin"])`

The `(public)` and `(auth)` layouts have no protection.

**Source:** Cited layout files

---

**EVIDENCE** — Hierarchical role access is NOT implemented. A superadmin user has `is_qr_superadmin: 1` but typically does NOT have `is_qr_admin: 1` (and vice versa for admin/member). Each protected layout checks for an exact role membership in `allowedRoles`. So a superadmin cannot access `/admin-portal` unless their `user_metadata.is_qr_admin` is also `1`. Verified: no role layout calls `protectPage(["admin", "superadmin"])` or any multi-role list.

**Source:** All three protectPage call sites use single-element role lists; `getUserRole` returns the FIRST matching role and only one role is returned

---

### Identity Source Trust Model

**INFERENCE** — Roles are stored in `auth.users.user_metadata` (Supabase's user-modifiable metadata field). In a default Supabase setup, `user_metadata` can be set by the user themselves via `auth.updateUser({ data: { ... } })`. Whether this is locked down depends on the project configuration (RLS on `auth.users` and triggers).

*Built on:*
- EVIDENCE: `src/app/api/auth/signup/route.ts:8-13` accepts `user_metadata` from the client request body and passes it to `signUp({ options: { data: user_metadata } })`
- EVIDENCE: `src/components/auth/RegisterForm.tsx:66-71` constructs the `user_metadata` object client-side and POSTs it
- EVIDENCE: `getUserRole` reads from `user.user_metadata` (not `app_metadata`, which is server-only in Supabase)

**EVIDENCE** — The signup flow assigns `is_qr_member: 1` for all new users via the form (`RegisterForm.tsx:66-71`). However, the API route accepts ANY `user_metadata` payload from the client and passes it through verbatim to `signUp` — there is no server-side allowlist or sanitization.

**Source:** `src/components/auth/RegisterForm.tsx:66-71`; `src/app/api/auth/signup/route.ts:5-14`

**INFERENCE** — A client could craft a direct POST to `/api/auth/signup` with `user_metadata = { is_qr_superadmin: 1, is_qr_admin: 1, is_qr_member: 1 }` and (assuming Supabase signup is open and `user_metadata` is accepted as-is) self-provision a superadmin account. Whether this succeeds depends on the Supabase project's configuration of email confirmation, `auth.users.user_metadata` triggers, and RLS — none of which are visible in this repo.

*Built on:*
- EVIDENCE: `/api/auth/signup` does not validate or filter `user_metadata`
- EVIDENCE: `getUserRole` directly trusts `user_metadata.is_qr_*`

---

### `/api/auth/superadmin-add-user` — Misleadingly Named

**EVIDENCE** — `src/app/api/auth/superadmin-add-user/route.ts:1-22` is byte-identical to `src/app/api/auth/signup/route.ts:1-22`. Both:
- Read `{ email, password, user_metadata }` from request JSON
- Create an SSR Supabase client (anon key, NOT admin)
- Call `supabase.auth.signUp({ email, password, options: { data: user_metadata } })`
- Return `{ data }` or `{ error }`

The `superadmin-add-user` route does NOT:
- Verify the caller is a superadmin
- Use `createAdminClient()` (the service-role client)
- Use `auth.admin.createUser()` (the service-role admin API)
- Restrict the `user_metadata` payload

**Source:** `src/app/api/auth/superadmin-add-user/route.ts:1-22`; `src/app/api/auth/signup/route.ts:1-22`

**INFERENCE** — The route's URL implies superadmin-only user provisioning, but the implementation is identical to public signup. Anyone who can reach the URL — including unauthenticated attackers — can call it and create accounts. The misleading name may cause future maintainers to assume admin-only behavior that doesn't exist.

*Built on:* the EVIDENCE above

---

### Role-Bearing Surface for `/api/reports/save`

**EVIDENCE** — `/api/reports/save` enforces user authentication via `ssr.auth.getUser()` (lines 53-57). On no user → 401. Then resolves `pharmacy_slug` from `pharma_pharmacy_members` → `pharma_pharmacy_profile` for the user's `id`. If no slug → 403.

**Source:** `src/app/api/reports/save/route.ts:51-61`

**EVIDENCE** — The route DOES NOT check user role (e.g., admin-only). Any authenticated user with a pharmacy mapping can save reports. The visibility gate is enforced only on the client (`ReportActions.tsx:50` — `canShowSave = owedType === "underpaid" && pbm !== "All"`), which is bypassable.

**Source:** `src/app/api/reports/save/route.ts:51-82`; `src/components/admin/ReportActions.tsx:50,268`

---

**EVIDENCE** — `/api/reports/save` accepts `noAuthDownload: true` as a flag to bypass the auth+upload path and return a PDF directly (`route.ts:38-49`). The route comment calls it an "escape hatch" (line 16). When `noAuthDownload` is true, the `auth.getUser()` check at line 53 is NEVER reached (early return at line 49) — so an unauthenticated request can generate a PDF if `rows` are supplied in the request body.

**Source:** `src/app/api/reports/save/route.ts:16,22,38-49`

---

**INFERENCE** — Combined with the fact that the request body provides `rows`, an unauthenticated attacker who can guess column shapes can have the server generate arbitrary PDFs containing arbitrary content (subject to whatever PDF builder shape the route accepts). This is not a data exposure (the rows must be supplied by the caller), but it is a CPU-burning vector and potential for content abuse.

*Built on:* `src/app/api/reports/save/route.ts:38-49` (early return before auth check)

---

### Role Surface for Other API Routes

| Route | Auth check | Role check | Notes |
|---|---|---|---|
| `/api/auth/login` POST | n/a (provides auth) | n/a | Plain Supabase signInWithPassword |
| `/api/auth/login` GET | none | none | "Testing the route" — queries `posts`. See Doc 10 QUESTION |
| `/api/auth/logout` POST | implicit (signOut works either way) | n/a | |
| `/api/auth/signup` POST | n/a | n/a | Public signup, accepts any `user_metadata` |
| `/api/auth/superadmin-add-user` POST | NONE | NONE | Identical to signup; misleading name |
| `/api/auth/confirm` GET | n/a | n/a | OTP token verification |
| `/api/user-data` GET | YES (`getUser()` → 401) | NONE | Relies on RLS for row scoping |
| `/api/kpis` GET | YES (`getUser()` → 401) | NONE | Same as user-data; dead code |
| `/api/reports/save` POST | YES UNLESS `noAuthDownload: true` | NONE | Pharmacy slug required for upload path |
| `/api/reports/email` POST | NONE | NONE | Uses admin client for everything; no caller check |
| `/api/pbm-email` GET | NONE | NONE | Uses admin client; leaks PBM email by name to anyone |

**Source:** All cited route files

---

### `/api/reports/email` and `/api/pbm-email` — Service-Role Without Caller Check

**EVIDENCE** — `/api/reports/email/route.ts:24` instantiates the service-role admin client (`createAdminClient()`) for the entire request without first verifying the caller's identity or authorization. The route then:
- Reads PBM email from `pharma_pbm_info` (line 25-32)
- Downloads PDF attachments from Storage by path (line 46)
- Updates `pharma_user_data.status` and `pharma_user_data.pdf_file` (lines 98-114)

**Source:** `src/app/api/reports/email/route.ts:15-114`

**INFERENCE** — Any unauthenticated caller who can supply a `pdfPath` they don't own (e.g., `other_pharmacy/report_commercialdollars/foo.pdf`) can:
- Cause the server to download arbitrary PDFs from the bucket and embed them in a `.eml` returned to the caller (data exfiltration vector if attacker can guess paths)
- Trigger updates to `pharma_user_data.status = 'emailed'` and `pdf_file = <path>` for arbitrary `pharmacy_id`s if they can guess the slug-derived `pharmacy_id`

The actual exposure depends on whether storage paths are guessable (slug + folder + pbm + dates — partially predictable).

*Built on:*
- EVIDENCE: `src/app/api/reports/email/route.ts:24` (`createAdminClient()` without auth check)
- EVIDENCE: line 42-53 (downloads any path supplied)
- EVIDENCE: line 73-114 (updates DB based on path-derived slug)

---

**EVIDENCE** — `/api/pbm-email/route.ts:13` instantiates `createAdminClient()` and exposes `pharma_pbm_info.email` for any `pbmName` query param to any unauthenticated caller.

**Source:** `src/app/api/pbm-email/route.ts:5-32`

**INFERENCE** — PBM email addresses are not strictly secret, but the endpoint provides an enumeration vector against `pharma_pbm_info.pbm_name` and exposes the corresponding email to anyone who can reach the URL.

*Built on:* `src/app/api/pbm-email/route.ts:5-32`

---

### CSRF / Origin Posture

**GAP** — No CSRF token, no origin validation, no `X-Requested-With` check, no SameSite=Strict cookie config. Cookies use `sameSite: 'lax'` (`src/utils/supabase/server.ts:24`), which provides modest CSRF protection for state-changing requests but does not block top-level navigations or `<form method="POST">` from the same site.

**Source:** `src/utils/supabase/server.ts:24` (sameSite='lax'); grep for `csrf|origin|sameSite` in `src/` returns only the cookie config

---

### Input Validation

**EVIDENCE** — Zod schemas exist for two client-side forms:
- `LoginForm` — email format + non-empty password (`LoginForm.tsx:28-40`)
- `RegisterForm` — name + email + password + passwordConfirm with match refinement (`RegisterForm.tsx:26-49`)
- `InsertForm` (booking) — title + body + author all `z.string().min(1)` (`InsertForm.tsx:22-35`)

**Source:** Cited files

**GAP** — No server-side validation. None of the API routes validate the request body shape. They cast directly to expected TypeScript types (e.g., `const body = (await req.json()) as SavePayload` at `reports/save/route.ts:21`). If a malformed body arrives, downstream code may throw uncaught TypeErrors or silently accept invalid data (e.g., `pdfPaths: ["..", ".."]` for path traversal in the email route).

**EVIDENCE** — `/api/user-data/route.ts:54` accepts the `limit` query param, parses it, and clamps `Math.min(Math.max(parseInt(...), 1), 10000)` — so the limit is bounded but still allows up to 10,000 rows per call. This is an explicit DoS-bound choice.

**Source:** `src/app/api/user-data/route.ts:53-57`

**EVIDENCE** — `/api/user-data/route.ts:6-15` enumerates ALLOWED_SORT_KEYS as a `Set<...>` but **never consults it** — `params.get("sortKey")` is cast `as any` at line 49 and used directly in the order clause (line 81-82). Sort key allowlist exists in code but is not enforced.

**Source:** `src/app/api/user-data/route.ts:6-15,49,81-82`

---

### Path Traversal — `/api/reports/email`

**EVIDENCE** — `/api/reports/email/route.ts:43-50` accepts `pdfPaths` as an arbitrary array of strings and passes each to `supa.storage.from(bucket).download(path)` after stripping a leading slash but performing no other path normalization.

**Source:** `src/app/api/reports/email/route.ts:42-53`

**INFERENCE** — Storage path traversal is bounded by the bucket scope (Supabase Storage doesn't allow `..` to escape buckets per its API), but within the bucket, an attacker can download any file at any path. The bucket `pharma_reports` likely contains every pharmacy's reports keyed by slug — so an attacker who can guess `{some_other_pharmacy_slug}/report_commercialdollars/report_commercialdollars_Caremark_2025-07-01_2025-08-29.pdf` can have the server fetch and email-attach it. This is a cross-tenant read vector if Storage RLS is open or service-role-bypassed.

*Built on:*
- EVIDENCE: `src/app/api/reports/email/route.ts:46` uses `createAdminClient()` (service role bypasses Storage RLS)
- EVIDENCE: filename pattern is partially predictable from `src/utils/slug.ts:12-39`

---

### Secrets Posture

**EVIDENCE** — Three secret-bearing env vars referenced:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public by Supabase convention; used in browser
- `SUPABASE_SERVICE_ROLE_KEY` — secret; bypasses RLS; used only by `admin.ts`
- `NEXT_PUBLIC_SITE_URL` — public

**Source:** `src/utils/supabase/{server,client,admin,middleware}.ts`

---

**EVIDENCE** — `.env*.local` is gitignored (`/.gitignore:28`), and no `.env*` files are committed.

**Source:** `.gitignore:28`; verified no committed env files via Glob

---

**EVIDENCE** — `utils/reset_supabase_password.js` is a standalone Node script (CLI tool). It loads `.env.local`, validates that `SUPABASE_SERVICE_ROLE_KEY` decodes as a service-role JWT, then calls `supabase.auth.admin.updateUserById(userId, { password })`. Usage: `node utils/reset_supabase_password.js <email-or-user-id> <new-password>`. The script enforces JWT role validation before executing.

**Source:** `utils/reset_supabase_password.js:67-75,102-105`

**INFERENCE** — This script is a server-side admin tool, not exposed via HTTP. Its presence implies the operator does occasional manual password resets via the service-role key. Acceptable risk if the file is run only locally with the operator's `.env.local`.

*Built on:* file contents and absence of any HTTP route that wraps it

---

### Cookie Diagnostic Header — Information Disclosure

**EVIDENCE** — `/api/auth/login/route.ts:50-58` sets a debug response header on successful login: `x-login-cookie-names: sb-access-token,sb-refresh-token` and `x-login-cookies-set: 2`. This leaks the names of the auth cookies (which are well-known Supabase defaults anyway) but is unnecessary for production.

**Source:** `src/app/api/auth/login/route.ts:50-58`

---

### Aggressive No-Cache Posture

**EVIDENCE** — `next.config.js:7-28` sets the following headers on every response globally:
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`
- `Pragma: no-cache`
- `Expires: 0`

**Source:** `next.config.js:7-28`

**INFERENCE** — This guarantees no caching of any response anywhere — including static assets and font files normally cached aggressively by Next.js. Side effect: all browser/edge caching is disabled, hurting performance but eliminating cache-related auth-state-staleness bugs (which were possibly the trigger for the global config).

*Built on:* the EVIDENCE above plus `src/app/api/auth/login/route.ts:5-7` which adds `dynamic = "force-dynamic"`, `revalidate = 0`, `fetchCache = "force-no-store"` on top — suggests caching/auth interactions were a recurring concern.

---

### Logging & Information Disclosure

**EVIDENCE** — `console.debug`, `console.info`, `console.error`, `console.warn` calls are sprinkled across server routes:
- `src/app/api/reports/save/route.ts:123,127,133,137,143,146,153` — `getPharmacySlugForUser` logs userId, intermediate query results
- `src/utils/slug.ts:19,29,37` — debug logs for filename construction
- `src/app/api/user-data/route.ts:121` — error log
- `src/app/api/kpis/route.ts:229` — error log
- `src/app/api/reports/email/route.ts:118` — warn log

**Source:** Cited lines

**INFERENCE** — Server logs (depending on hosting platform) will include user IDs, pharmacy IDs, slug values, and intermediate query results. Acceptable for a demo; for production this would warrant scrubbing.

*Built on:* the EVIDENCE above

---

### Browser Security Headers

**GAP** — No Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy headers. The only headers set globally are caching-related (`next.config.js:7-28`).

---

### RLS / Database-Level Security

**GAP** — No RLS policies committed in the repo (no `supabase/` folder, no `*.sql` files). The application code at `/api/user-data:62` explicitly comments "Ensure caller is authenticated; otherwise RLS will silently return 0 rows" — confirming RLS is the row-scoping mechanism. Whether RLS is correctly configured for multi-tenancy on `pharma_user_data`, `pharma_pharmacy_members`, etc. cannot be determined from this codebase.

---

### Storage Bucket Access Control

**GAP** — Storage bucket policies for `pharma_reports` are not visible in this repo. The `/api/reports/save` route uses `createAdminClient()` which bypasses Storage RLS, so even restrictive bucket policies are bypassed for that route. Whether a non-admin client could read `pharma_reports` directly cannot be verified.

---

### Dual-Layer Validation (Client + Server)

**EVIDENCE** — Where validation exists, it is client-only (zod in forms). Server routes accept JSON bodies cast to types without runtime validation. There is no zod schema imported into any `route.ts` file — verified via grep.

**Source:** Grep `import { .* } from "zod"` in `src/app/api/` returns 0 hits

---

## Open Questions

1. (Operator-relevant) Is `/api/auth/superadmin-add-user` a planned endpoint that was scaffolded but never implemented as admin-restricted? Or a copy-paste artifact? Either way, the URL implies an authorization model that doesn't exist.
2. Is the `user_metadata`-based role system the intended permanent design, or a stepping stone to `app_metadata` + service-role-controlled role assignment? `app_metadata` is server-only and immune to client tampering.
3. Are RLS policies in the operator's Supabase project correctly scoping `pharma_user_data` by pharmacy_id resolved via `pharma_pharmacy_members`? Cannot verify from this repo.
4. Is `/api/pbm-email` intended to be public, or should it require admin auth?
5. Is `/api/reports/email` intentionally callable without auth, or was the `auth.getUser()` check accidentally omitted? `/api/reports/save` includes the check; `/api/reports/email` does not.
6. Is the `noAuthDownload: true` escape hatch in `/api/reports/save` intended for a specific UX flow (e.g., download-without-saving for users without storage permissions), or is it a development bypass that was forgotten?
7. Should the global `Cache-Control: no-store` header be relaxed for static assets (images, fonts, JS bundles)?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
