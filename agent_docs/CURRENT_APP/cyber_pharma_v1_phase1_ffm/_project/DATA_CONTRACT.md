# DATA CONTRACT — Cyber Pharma v1 / Phase 1: Foundation Skeleton

> **Scope:** Phase 1 only. Frank-domain tables are Phase 3's concern.
> **Reader:** Claudy (Claude Code)
> **Source:** Mirrors `DATA_CONTRACT_PHASE_1.md` from the factory docs, restated here for FFM portability

---

## 1. Tables In Play For Phase 1

Phase 1 uses **only** the tables inherited from the starter kit. No Frank-domain tables exist yet.

### `auth.users` (Supabase managed)

Standard Supabase Auth users table. Not modified.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | text | UNIQUE |
| encrypted_password | text | Managed by Supabase Auth |
| user_metadata | jsonb | **NOT USED for roles** (security decision) |
| app_metadata | jsonb | Reserved for future server-set claims |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

🔒 **LOCKED:** Roles never written to `user_metadata`. Role data lives in `user_roles` table (below).

### `user_roles` (starter kit — kept as-is)

Server-controlled role table. Inherited from starter kit version 2.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to `auth.users(id)`, UNIQUE (one role row per user) |
| role | `app_role` enum | Values: `superadmin`, `admin`, `member` |
| created_at | timestamptz | Auto |

### `app_role` ENUM (starter kit — kept as-is)

Values: `superadmin`, `admin`, `member`.

🔒 **Phase 1 caveat:** In Phase 1, `admin` and `member` are platform-level (inherited from starter kit). In Phase 3, the semantics shift: `superadmin` stays platform-level, but `admin`/`member` become per-pharmacy (via the `user_businesses` junction added in Phase 3). The Phase 1 starter kit pattern remains valid for now — Phase 3 will refactor.

---

## 2. Tables NOT In Play For Phase 1

These tables are documented in MASTER_APP_BRIEF §5 but **do not exist yet** in Phase 1. They land in Phase 3.

- `businesses` (the tenant spine)
- `user_businesses` (multi-store admin junction)
- `user_data` (PHI fact table)
- `subscriptions` (Stripe state mirror)
- `apa_memberships`
- `aac_reference`, `wac_reference`, `ful_reference`
- `pbm_info`
- `audit_logs`
- `report_files`
- `reference_dataset_versions`
- `pending_registrations`

🔒 **LOCKED:** Phase 1 does NOT create or migrate any of these tables. Phase 1 does NOT use any Frank-domain data.

---

## 3. Trigger / Function Inventory

The starter kit ships with three database functions. Verify they exist after deployment:

| Function | Purpose |
|---|---|
| `handle_new_user()` | Trigger on `auth.users` insert; auto-creates a `user_roles` row with default role `member` |
| `update_updated_at()` | Trigger function for any table needing auto-updated `updated_at` |
| `rls_auto_enable()` | Event trigger that auto-enables RLS on newly created tables (defense-in-depth) |

🔒 **LOCKED:** All three preserved. `rls_auto_enable()` especially valuable — when Phase 3 creates Frank-domain tables, RLS is on by default instead of requiring manual enablement.

---

## 4. TypeScript Types (Phase 1)

Claudy generates these in `/src/types/` during Phase 1 work. One file per major entity, or all in `index.ts` if small.

### `User` type

```ts
// /src/types/User.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```

Mirrors `auth.users` fields needed in the UI. Sensitive fields (`encrypted_password`, raw metadata) are not exposed.

### `UserRole` type

```ts
// /src/types/UserRole.ts
export type AppRole = 'superadmin' | 'admin' | 'member';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
```

The `AppRole` enum value mirrors the database `app_role` enum exactly.

### `AuthenticatedUser` type (composite)

```ts
// /src/types/AuthenticatedUser.ts
export interface AuthenticatedUser {
  user: User;
  role: AppRole | null;  // null if no row in user_roles (shouldn't happen post-trigger, but defensive)
  is_super_admin: boolean;
}
```

Composite type returned by the auth service. Components consume this — they don't compose `User` + `UserRole` themselves.

---

## 5. Service Contracts (Phase 1) — 🛑 STALE / SUPERSEDED (2026-06-05)

> **Status:** This section was rewritten on 2026-06-05 after the Gate 0 Discovery surfaced a conflict with `STARTER_KIT_HANDBOOK_v1.0.md §1` ("DO NOT AUTHOR `src/services/authService.ts`"). The kit handbook wins. Operator (Tony) confirmed option (b): skip the service-layer wrappers entirely.

**Phase 1 uses the kit's auth primitives directly (`useAuthStore`, `getUserRole()`). No service-layer auth wrappers — that's the anti-pattern the kit handbook prevents. Service layer begins Phase 3 with Frank-domain data access.**

### Where the actual auth pattern lives (kit primitives)

| Need | Use this | Location |
|---|---|---|
| Current user + role flags (client) | `useAuthStore` | `src/store/useAuthStore.ts` |
| Current user role (server) | `getUserRole()` | `src/utils/get-user-role.ts` |
| `AppRole` enum (universal, safe in client components) | `AppRole` | `src/utils/app-role.ts` |
| Role-gate a protected layout | `protectPage([AppRole.X])` | `src/utils/supabase/actions.ts` |
| Browser Supabase client | `createClient()` | `src/utils/supabase/client.ts` |
| Server Supabase client (anon, respects RLS) | `createClient()` | `src/utils/supabase/server.ts` |
| Admin Supabase client (service role, bypasses RLS) | `createAdminClient()` | `src/utils/supabase/admin.ts` |
| Login / logout / signup | POST `/api/auth/login`, `/api/auth/logout`, `/api/auth/signup` | already wired |

### What this means for downstream sections of this contract

- **§4 `AuthenticatedUser` type** — still useful as a shape, but the docstring's "Composite type returned by the auth service" wording is now stale. `useAuthStore` already exposes the same composition (user + role + derived flags) on the client side; server code composes ad hoc via `getUserRole()`. Decide in Sub-Phase 1 whether to keep, drop, or rename this type.
- **§6 mock data for `authService`** — `mockAdminUser` etc. are still valid as `AuthenticatedUser` fixtures for testing components that consume `useAuthStore`, but they are no longer "fixtures for `authService`." Same data, different consumer.

---

## 6. Mock Data Strategy (Phase 1)

Phase 1 has **minimal** mock data because Phase 1 has no real data flows yet. Mocks exist only for:

### Auth flow testing

Test fixtures for `authService`:
- `mockAdminUser` — `AuthenticatedUser` with `role: 'admin'`
- `mockMemberUser` — `AuthenticatedUser` with `role: 'member'`
- `mockSuperadminUser` — `AuthenticatedUser` with `role: 'superadmin'`, `is_super_admin: true`
- `mockUnauthenticated` — `null`

These fixtures live in `/src/mocks/auth.ts` and are used by Vitest tests for role-resolution and protected-route checks.

🔒 **No Frank-domain mocks in Phase 1.** No OwedBook fixtures, no PBM data, no script data, no businesses. Those land in Phase 2.

---

## 7. Phase 2 Decision Points

When Phase 2 begins, these decisions must be made (NOT in Phase 1):

- How will demo data be structured? (Will inform Phase 2 FFM's DATA_CONTRACT.)
- Will demo data live in `/src/mocks/` or in a separate fixtures repo?
- Will demo data be deletable in one commit (per service-layer doctrine)?

🔒 These are explicitly DEFERRED. Phase 1 does not pre-decide for Phase 2.

---

## 8. Conflict Resolution

If a code change requires a data shape that isn't in this contract:

1. STOP
2. Surface to operator
3. Propose either: (a) update this contract first, or (b) defer the feature to later phase

🔒 Inventing fields mid-component-build = violation. Always update the contract first.

---

## 9. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-03 | Initial DATA_CONTRACT for Cyber Pharma v1 Phase 1. Inherits from DATA_CONTRACT_PHASE_1.md. Type definitions + service contracts added for FFM completeness. |
| 1.1 | 2026-06-05 | §5 marked STALE / SUPERSEDED. Service-layer auth wrappers removed — conflicted with Starter Kit Handbook v1.0 §1 ("DO NOT AUTHOR authService"). Operator decision: components consume kit primitives (`useAuthStore`, `getUserRole()`) directly. Service layer begins Phase 3. §4 and §6 flagged for Sub-Phase 1 review (still valid as shapes, stale in their docstring framing). |
