# Playbook 04 — Sub-Phase 3: Mock Data

> **Goal:** Minimal test fixtures for Phase 1 auth flow testing.
> **AI time:** 30 min | **Review time:** 5 min
> **Code produced:** `/src/mocks/auth.ts` with role fixtures

---

## Phase 1's Limited Mock Scope

Phase 1 has very few mocks because:
- No Frank-domain data yet (Phase 3)
- No OwedBook data (Phase 2)
- No demo data flows (Phase 2)

The only mocks Phase 1 needs are **AuthenticatedUser fixtures** for role-resolution tests and component tests.

🔒 **Do NOT add Frank-domain mocks here.** No `Business` mocks, no `Subscription` mocks, no PBM data. Those land in Phase 2+ FFMs.

---

## Steps

### Step 1 — Create `/src/mocks/auth.ts`

```ts
// src/mocks/auth.ts
import type { AuthenticatedUser } from '@/types';

export const mockAdminUser: AuthenticatedUser = {
  user: {
    id: 'mock-admin-id-001',
    email: 'admin@test.cyberpharma.local',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  role: 'admin',
  is_super_admin: false,
};

export const mockMemberUser: AuthenticatedUser = {
  user: {
    id: 'mock-member-id-001',
    email: 'member@test.cyberpharma.local',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  role: 'member',
  is_super_admin: false,
};

export const mockSuperadminUser: AuthenticatedUser = {
  user: {
    id: 'mock-superadmin-id-001',
    email: 'super@test.cyberpharma.local',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  role: 'superadmin',
  is_super_admin: true,
};

export const mockUnauthenticated: AuthenticatedUser | null = null;
```

### Step 2 — Verify Type Conformance

```bash
npx tsc --noEmit
```

Should be clean. If errors, fixtures don't match the types — fix immediately.

### Step 3 — Use In Existing Service Tests

Update `src/services/__tests__/auth.test.ts` and `src/services/__tests__/role.test.ts` to import from `@/mocks/auth` instead of inline-defining fixtures.

### Step 4 — Document Deletability

Add a comment at the top of `/src/mocks/auth.ts`:

```ts
// src/mocks/auth.ts
//
// PHASE 1 TEST FIXTURES — DELETABLE
// 
// These fixtures exist for Phase 1 service tests and component tests.
// They are NOT used in production code.
// When real auth flows are in place, these fixtures remain only as test data.
// They are NEVER imported by components.

import type { AuthenticatedUser } from '@/types';
// ... rest
```

🔒 The "components NEVER import from /src/mocks/" rule from service layer doctrine still applies.

### Step 5 — Verify No Component Imports Mocks

```bash
grep -rn "from '@/mocks" src/components/ src/app/
# Should return zero matches
```

If matches found, the component is breaking service-layer discipline.

### Step 6 — Produce Completion Summary

```
## Sub-Phase 3 Complete

### What I Did
- Created /src/mocks/auth.ts with three role fixtures
- Verified all fixtures satisfy AuthenticatedUser type
- Updated service tests to import from mocks
- Verified no component imports /src/mocks/

### Files Created
- src/mocks/auth.ts

### Files Modified
- src/services/__tests__/auth.test.ts (use shared fixtures)
- src/services/__tests__/role.test.ts (use shared fixtures)

### Files NOT Touched
- /src/components/ (sub-phase 4)
- Frank-domain mocks (Phase 2/3 — out of scope)

### Tests Run
- Vitest: all service tests still passing
- `npx tsc --noEmit`: clean
- grep check: zero mock imports in components

### Concerns / Open Questions
- (none, or list)

### Proposed Sub-Phase 4 Plan
- Build placeholder pages (admin-portal, members-portal)
- Apply brand tokens
- Verify role gates hold via protectPage
- Apply design system scaffolding (Tailwind tokens)
- Write LoginForm, RegisterForm component tests

### Awaiting Approval
Ready to proceed to Sub-Phase 4 (Components)?
Type "approved" or specify changes.
```

### Step 7 — Stop

Wait for operator approval.

---

## Verification Gate

Operator confirms:
- [ ] All three role fixtures exist
- [ ] Fixtures satisfy `AuthenticatedUser` type (compile-checked)
- [ ] Mock files documented as deletable
- [ ] No component imports from `/src/mocks/`
- [ ] Service tests use the shared fixtures
- [ ] Zero Frank-domain mocks (Phase 1 has none)

If any fail, fix before advancing.

---

## Common Stumbles

- AI adds Frank-domain mocks (Business, Subscription) → STOP. Those are Phase 2/3.
- AI imports mocks into components → STOP. Service layer doctrine violated.
- AI invents fields not in the type → STOP. Type-conformance is mandatory.
- AI adds rich Phase 2 data (PBM names, script counts) → STOP. Phase 1 has minimal mocks only.
- AI forgets the "DELETABLE" comment → push back. Future readers need to know mocks are temporary.

---

## Anti-Patterns

```ts
// ❌ WRONG — Frank-domain mock in Phase 1
export const mockBusiness = { id: '...', npi: '...', ... };

// ❌ WRONG — component imports mock
'use client';
import { mockAdminUser } from '@/mocks/auth';
export function Header() {
  // using mockAdminUser in production code
}

// ❌ WRONG — fixture with extra fields
export const mockAdminUser = {
  user: { ..., display_name: 'Test Admin' }, // ← not in type
  role: 'admin',
  is_super_admin: false,
};

// ✅ CORRECT — minimal Phase 1 fixture
export const mockAdminUser: AuthenticatedUser = {
  user: { id: 'mock-admin-id-001', email: 'admin@test.cyberpharma.local', ... },
  role: 'admin',
  is_super_admin: false,
};
```
