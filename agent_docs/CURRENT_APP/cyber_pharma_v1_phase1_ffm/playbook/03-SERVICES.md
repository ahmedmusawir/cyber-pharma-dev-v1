# Playbook 03 — Sub-Phase 2: Service Layer

> **Goal:** Wrap the starter kit's Supabase auth in a service layer so components never call Supabase directly.
> **AI time:** ~1 hour | **Review time:** 10 min
> **Code produced:** `authService` + `roleService` in `/src/services/`

---

## Why This Matters

Per `_project/CLAUDE.md` doctrine, the service layer is the **sole swap point** for backend changes. UI components NEVER:
- Import Supabase clients
- Call `fetch()` directly to backend APIs
- Talk to mock data files directly

UI components ALWAYS call domain-named service methods.

Phase 1 establishes this discipline from day one. Every later phase inherits it.

---

## Steps

### Step 1 — Locate The Starter Kit's Auth Code

Find where the starter kit handles auth:

```bash
ls src/utils/supabase/
# Expected: client.ts, server.ts, admin.ts, middleware.ts, actions.ts
```

Read each file briefly. Understand what's already wired:
- `client.ts` — browser client (anon key)
- `server.ts` — SSR client (cookie-bound)
- `admin.ts` — service role client (server-only)
- `middleware.ts` — session refresh middleware
- `actions.ts` — server actions (likely has `signIn`, `signOut`, etc.)

🔒 **Do NOT modify these files.** They are the starter kit's foundation. Wrap them, don't rewrite them.

### Step 2 — Create `/src/services/auth.ts`

This file wraps the starter kit's auth flow in the service contract from DATA_CONTRACT §5.

Authoring approach:
- Import the necessary Supabase clients from `src/utils/supabase/`
- Implement each method in the `AuthService` contract
- Return shapes that exactly match the types defined in Sub-Phase 1
- Handle errors cleanly — throw typed errors, don't return null on failure

Pseudocode structure (Claudy fills in the details):

```ts
// src/services/auth.ts
import { createClient } from '@/utils/supabase/server';
import type { AuthenticatedUser, AppRole } from '@/types';
import { resolveRole } from './role';

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;
  
  const role = await resolveRole(user.id);
  
  return {
    user: {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    },
    role,
    is_super_admin: role === 'superadmin',
  };
}

export async function signIn(email: string, password: string): Promise<AuthenticatedUser> {
  // wrap starter kit's signin flow
  // throw on failure
  // return AuthenticatedUser on success
}

export async function signOut(): Promise<void> {
  // wrap starter kit's signout flow
}

export async function register(email: string, password: string): Promise<AuthenticatedUser> {
  // wrap starter kit's register flow
  // handle_new_user() trigger auto-creates user_roles row
}
```

⚠️ **Claudy: do NOT copy this pseudocode literally. Read the starter kit's actual auth code first, then write idiomatic wrappers.** The pseudocode above is illustrative only.

### Step 3 — Create `/src/services/role.ts`

This file resolves user roles from the `user_roles` table.

🔒 **CRITICAL:** Read from `user_roles` table only. NEVER read from `user_metadata`. This is a security boundary inherited from TONY_DEMO findings.

```ts
// src/services/role.ts
import { createClient } from '@/utils/supabase/server';
import type { AppRole } from '@/types';

export async function resolveRole(userId: string): Promise<AppRole | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  
  return data.role as AppRole;
}

export async function isAuthorized(
  userId: string,
  allowedRoles: AppRole[]
): Promise<boolean> {
  const role = await resolveRole(userId);
  if (!role) return false;
  return allowedRoles.includes(role);
}
```

### Step 4 — Verify The `protectPage` Server Action Exists

The starter kit ships with `protectPage(allowedRoles)`. Verify it:
- Reads role from `user_roles` (via `roleService.resolveRole`)
- Returns the authenticated user OR redirects
- Works at layout level (e.g., `src/app/(admin)/layout.tsx`)

If `protectPage` doesn't already use `roleService`, refactor it to do so. This is the bridge between the layout-level role gate and the service layer.

### Step 5 — Write Service Contract Tests

In `/src/services/__tests__/`:

```
src/services/__tests__/
├── auth.test.ts        ← verifies each method returns correct shape
└── role.test.ts        ← verifies role resolution, regression guards
```

Mock Supabase responses. Verify:
- `getCurrentUser()` returns `null` for unauthenticated
- `getCurrentUser()` returns `AuthenticatedUser` with correct role for authenticated
- `signIn()` throws on invalid creds, returns `AuthenticatedUser` on valid
- `resolveRole()` reads from `user_roles` table (verify SQL query shape)
- `resolveRole()` does NOT read from `user_metadata` (regression guard)
- `isAuthorized()` returns boolean per role check

### Step 6 — Verify No Component Imports Supabase

```bash
grep -rn "from '@supabase" src/components/ src/app/
# Should return zero matches
```

If matches found, the component is breaking service-layer discipline. Refactor to call a service method instead.

### Step 7 — Produce Completion Summary

```
## Sub-Phase 2 Complete

### What I Did
- Created authService wrapping starter kit's auth flow
- Created roleService resolving roles from user_roles table
- Verified protectPage uses roleService
- Wrote service contract tests
- Verified no component imports Supabase directly

### Files Created
- src/services/auth.ts
- src/services/role.ts
- src/services/__tests__/auth.test.ts
- src/services/__tests__/role.test.ts

### Files Modified
- src/app/(admin)/layout.tsx (if needed — to use protectPage)
- src/app/(superadmin)/layout.tsx (if needed)
- src/app/(members)/layout.tsx (if needed)

### Files NOT Touched
- /src/utils/supabase/* (starter kit foundation — preserved)
- /src/components/ (sub-phase 4)
- /src/mocks/ (sub-phase 3)

### Tests Run
- Vitest: service contract tests passing
- `npx tsc --noEmit`: clean
- grep check: zero Supabase imports in components

### Concerns / Open Questions
- (none, or list)

### Proposed Sub-Phase 3 Plan
- Create test fixtures in /src/mocks/auth.ts
- Mock AuthenticatedUser for each role
- Use in service tests

### Awaiting Approval
Ready to proceed to Sub-Phase 3 (Mock Data)?
Type "approved" or specify changes.
```

### Step 8 — Stop

Wait for operator approval.

---

## Verification Gate

Operator confirms:
- [ ] `authService` implements full DATA_CONTRACT §5 interface
- [ ] `roleService` reads ONLY from `user_roles` table
- [ ] `protectPage` uses `roleService`
- [ ] Service tests pass
- [ ] Zero Supabase imports in components
- [ ] No `user_metadata` role reads anywhere
- [ ] Starter kit's `/src/utils/supabase/*` files unchanged

If any fail, fix before advancing.

---

## Common Stumbles

- AI rewrites starter kit's Supabase clients → STOP. Wrap, don't rewrite.
- AI reads role from `user_metadata` → STOP. user_roles table only.
- AI adds methods not in DATA_CONTRACT §5 → push back or update contract first.
- AI uses `any` types in service signatures → STOP. Use types from `/src/types/`.
- AI skips service tests → push back. Service contract tests are mandatory in this sub-phase.
- AI tries to call services from server components without `await` properly → check Next.js docs, fix.

---

## Anti-Patterns

```ts
// ❌ WRONG — component imports Supabase directly
'use client';
import { createBrowserClient } from '@supabase/ssr';
export function MyComponent() {
  const supabase = createBrowserClient(...);
  // ...
}

// ❌ WRONG — reading role from user_metadata
const role = user.user_metadata?.role;

// ❌ WRONG — returning raw Supabase user shape
return user; // not AuthenticatedUser

// ✅ CORRECT — component calls service
import { getCurrentUser } from '@/services/auth';
export async function MyServerComponent() {
  const auth = await getCurrentUser();
  // ...
}

// ✅ CORRECT — role from user_roles table
const role = await resolveRole(user.id);
```
