# Authorization

## Overview

This starter kit uses a **database-backed RBAC model**.

Authorization answers the question:

> **What is this authenticated user allowed to access?**

The answer does not come from browser state or auth metadata. It comes from the database.

---

## Core Authorization Model

### The `user_roles` table

The canonical source of truth is:

- `public.user_roles`

This table maps each authenticated user to exactly one application role.

Typical columns:

- `id`
- `user_id`
- `role`
- `created_at`
- `updated_at`

### Why a dedicated table matters

A dedicated role table gives you:

- SQL-native authorization logic
- clean joins for policy checks
- durable auditing and governance
- compatibility with RLS
- separation between identity and permissions

---

## The `AppRole` Enum

In the Next.js application layer, roles are represented by an enum defined in:

- `src/utils/app-role.ts`

```ts
export enum AppRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MEMBER = 'member'
}
```

> The `SUPERADMIN` value remains in the enum (and the DB `app_role` type), but
> Cyber Pharma ships no superadmin surface — only ADMIN and MEMBER are used by
> live route gates.

### Why use an enum

Using `AppRole` instead of raw strings prevents:

- string drift between layouts and database values
- typo bugs in protected route checks
- weakly typed route guard logic

The enum values map directly to the Postgres enum values.

---

## Role Assignment Model

## Default member assignment

New public signups are not manually assigned in application code.

Instead, a **Postgres trigger** automatically inserts a `member` role row when a new auth user is created.

This is the factory default behavior.

### Why this is important

- role assignment is centralized in the database
- signup route remains simple
- every new user gets a deterministic baseline role
- no frontend role flags are required

---

## `getUserRole()`

Role resolution happens in:

- `src/utils/get-user-role.ts`

This function:

1. accepts an authenticated `user.id`
2. queries `public.user_roles`
3. returns `AppRole` or `null`

This keeps role derivation explicit and server-side.

---

## `protectPage()` Server Action

Route protection happens in:

- `src/utils/supabase/actions.ts`

```ts
export async function protectPage(allowedRoles: AppRole[]) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (!user) {
    return redirect('/auth');
  }

  const userRole = await getUserRole(user.id);
  if (!userRole || !allowedRoles.includes(userRole)) {
    return redirect('/auth');
  }

  return user;
}
```

### What it guarantees

- unauthenticated users are blocked
- authenticated users with missing role rows are blocked
- authenticated users with incorrect roles are blocked
- only explicitly allowed roles can render the layout

### Where it is used

Protected App Router layouts call `protectPage()` before rendering, e.g.:

- the OwedBook layout — `protectPage([AppRole.ADMIN, AppRole.MEMBER])`
- the admin layout — `protectPage([AppRole.ADMIN], { unauthorizedRedirect: '/owedbook' })`

---

## Layout-Level Authorization

This starter uses layout-level authorization instead of scattering checks across pages.

### Benefits

- one guard protects an entire route group
- fewer inconsistent auth checks
- cleaner portal boundaries
- easier maintenance and testing

Example:

```ts
await protectPage([AppRole.ADMIN])
```

That means every page under that route group inherits the same gate.

---

## Privileged Operations (the "One-Two Punch" pattern)

> **Status in Cyber Pharma:** the starter kit's `POST /api/auth/superadmin-add-user`
> route — which created users with the service-role key — was **removed in Phase 2**
> along with the superadmin portal. Cyber Pharma's `/api/auth/*` routes are now
> just `login`, `logout`, `signup`, and `confirm`. The principle below is retained
> as doctrine for **any** future service-role operation.

The pattern for any privileged, service-role-key operation is a **two-stage
authorization flow**:

1. **Verify first.** Get the authenticated user, read their role from
   `user_roles`, and reject unauthorized callers with `403` **before** the
   service-role client is ever touched.
2. **Then act.** Only after verification, use the service-role client for the
   privileged write.

This keeps privileged operations server-side only, explicit, auditable, and
isolated from client code.

> **Security rule:** The service role key must never be exposed to the browser. Ever.

In the current app, the live example of stage 1 is `protectPage()` gating the
admin layout; there is no stage-2 service-role write path shipped (real-user CRUD
lives only in the env-gated `/moose-portal` operator tool — see
[ROUTES_AND_SURFACES.md](./ROUTES_AND_SURFACES.md)).

---

## Why Authorization Does Not Live in `user_metadata`

Role flags in `user_metadata` were intentionally removed from the architecture.

Reasons:

- poor fit for SQL policy enforcement
- weak separation of concerns
- encourages app-layer trust over database trust
- harder to maintain at scale

Authorization now lives in:

- `public.user_roles`
- `AppRole`
- `protectPage()`
- Postgres RLS policies

---

## Database-Enforced Authorization

The app layer improves user experience by directing people to the correct portal.

The database layer enforces the true security boundary.

Example RLS policy direction:

- members can access member-owned rows
- admins can access administrative domain rows
- superadmins can access global administrative data

Even if someone manually calls an endpoint or tampers with the client, RLS still evaluates the session and role relationship before releasing data.

---

## Authorization Summary

This authorization design is strong because it is layered.

- **UI layer:** route groups and portal rendering
- **Server layer:** `protectPage()` and role lookup
- **Database layer:** `user_roles` + RLS
- **Privileged ops pattern:** verify-then-act with the service-role key (doctrine; no live route in this app — see above)

> **Factory Standard rule:** Roles are records, not flags. Security is enforced by the database, not by hope.
