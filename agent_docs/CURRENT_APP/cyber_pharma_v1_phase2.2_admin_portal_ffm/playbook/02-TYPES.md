# Playbook 02 — Sub-Phase 1: Types & Contract

> **Goal:** Establish the TypeScript type contract that both mock and real implementations will satisfy.
> **AI time:** 30 min | **Review time:** 5 min
> **Code produced:** TypeScript type files in `/src/types/`

---

## Steps

### Step 1 — Re-read `_project/DATA_CONTRACT.md` §4

The DATA_CONTRACT specifies three types for Phase 1:
- `User`
- `UserRole` (with `AppRole` enum)
- `AuthenticatedUser` (composite)

### Step 2 — Create The Type Files

Two options based on team preference:

**Option A — one file per entity:**
```
src/types/
├── User.ts
├── UserRole.ts
├── AuthenticatedUser.ts
└── index.ts
```

**Option B — single index file:**
```
src/types/
└── index.ts  (all types exported from one file)
```

Phase 1 is small enough for either. **Default to Option A** for parity with Phase 2+ when many more types land.

### Step 3 — Author Each Type Exactly As Specified

Copy field-for-field from DATA_CONTRACT §4. Do not invent fields. Do not add convenience flags.

```ts
// src/types/User.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```

```ts
// src/types/UserRole.ts
export type AppRole = 'superadmin' | 'admin' | 'member';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
```

```ts
// src/types/AuthenticatedUser.ts
import type { User } from './User';
import type { AppRole } from './UserRole';

export interface AuthenticatedUser {
  user: User;
  role: AppRole | null;
  is_super_admin: boolean;
}
```

```ts
// src/types/index.ts
export type { User } from './User';
export type { UserRole, AppRole } from './UserRole';
export type { AuthenticatedUser } from './AuthenticatedUser';
```

### Step 4 — Verify TypeScript Compiles

```bash
npx tsc --noEmit
```

Must exit clean. Zero errors. Zero warnings related to the new files.

If errors:
- Surface to operator
- Do NOT proceed

### Step 5 — Verify No Backend Imports

These types do NOT import from Supabase. They are PURE shape declarations.

```bash
grep -rn "from '@supabase" src/types/
# Should return zero matches
```

If matches found, surface — types should be Supabase-agnostic.

### Step 6 — Produce Completion Summary

```
## Sub-Phase 1 Complete

### What I Did
- Authored three TypeScript types from DATA_CONTRACT §4
- Set up barrel export from src/types/index.ts
- Verified compilation clean

### Files Created
- src/types/User.ts
- src/types/UserRole.ts
- src/types/AuthenticatedUser.ts
- src/types/index.ts

### Files Modified
- (none)

### Files NOT Touched
- /src/services/ (next sub-phase)
- /src/components/ (sub-phase 4)
- /src/mocks/ (sub-phase 3)
- Backend code (forbidden zone)

### Tests Run
- `npx tsc --noEmit` → clean exit, zero errors

### Concerns / Open Questions
- (none, or list)

### Proposed Sub-Phase 2 Plan
- Create `/src/services/auth.ts` wrapping starter kit's Supabase auth
- Create `/src/services/role.ts` for role resolution
- Verify no component imports Supabase directly

### Awaiting Approval
Ready to proceed to Sub-Phase 2 (Service Layer)?
Type "approved" or specify changes.
```

### Step 7 — Stop

Wait for operator approval.

---

## Verification Gate

Operator confirms:
- [ ] All three types exist
- [ ] Types match DATA_CONTRACT exactly (field-for-field)
- [ ] `tsc --noEmit` clean
- [ ] No Supabase imports in `/src/types/`
- [ ] Barrel export from `index.ts` works

If any fail, fix before advancing.

---

## Common Stumbles

- AI invents fields not in DATA_CONTRACT → STOP. Update DATA_CONTRACT first or remove the field.
- AI imports types from `@supabase/supabase-js` → STOP. Types are pure declarations, not derived from Supabase.
- AI adds convenience types not in DATA_CONTRACT (e.g., `UserWithRole`) → push back. If needed, add to DATA_CONTRACT first.
- AI creates types for Frank-domain entities (`Business`, `Subscription`) → STOP. Those are Phase 3.

---

## Anti-Patterns

```ts
// ❌ WRONG — using `any`
export interface User {
  id: any;
}

// ❌ WRONG — inventing fields not in DATA_CONTRACT
export interface User {
  id: string;
  email: string;
  display_name: string;  // ← invented
}

// ❌ WRONG — importing from Supabase
import type { User as SupabaseUser } from '@supabase/supabase-js';
export type User = SupabaseUser;

// ✅ CORRECT — types are pure declarations
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```
