# Testing

## Overview

Cyber Pharma ships a **Jest** suite that covers two things: the inherited
RBAC/auth security boundaries (foundation) and the Phase-2 application surfaces —
OwedBook and the Admin Portal Demo Shell (services, components, and the mock
seed). A **Playwright** e2e scaffold exists for browser-level flows.

> **Current inventory: 25 test suites, 117 passing tests** (run `npm test`).

The goal is not coverage for its own sake. Foundation tests prove unauthorized
access fails safely; app tests encode the **intent** behind each surface —
including the hard product rules (no-password invites, no-charge billing).

---

## Frameworks

- **Jest** + **ts-jest** — unit/component/integration.
- **@testing-library/react** — component tests.
- **Playwright** — end-to-end (scaffold; scripts below).

### Config files

- `jest.config.js`
- `src/__tests__/jest.setup.ts`

---

## Jest Configuration

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',          // default; UI tests opt into jsdom (below)
  clearMocks: true,
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '.../jest.setup.ts'],
};
```

### The node + jsdom split

The default environment is `node` (correct for service/server/security tests).
Component tests that render React opt into jsdom **per file** with a docblock at
the top:

```ts
/**
 * @jest-environment jsdom
 */
```

About 19 of the suites use this. `jest-environment-jsdom` is installed.

### Shared mocks (`jest.setup.ts`)

Mocks `next/navigation` (`redirect`, `useRouter`, `usePathname`) and
`next/cache` (`revalidatePath`). Supabase server/admin clients are mocked
per-test so auth/security behavior is asserted without a real database.

---

## What's Covered

### Foundation — auth & RBAC (`src/__tests__/`)

- **`get-user-role.test.ts`** — `getUserRole()` maps each DB role to the right
  `AppRole`, and missing rows / empty ids / query failures fail safe (return
  `null`), not loud.
- **`actions.test.ts`** — `protectPage()` lets the allowed role through and
  redirects unauthenticated callers, wrong-role callers, and role-less callers.
- **`proxy.test.ts`** — `proxy()` delegates to `updateSession()` and the matcher
  excludes static/image paths.

> The old `superadmin-add-user.test.ts` suite was **removed** along with the
> superadmin provisioning route during Phase 2 — Cyber Pharma ships no superadmin
> portal. (See [AUTHORIZATION.md](./AUTHORIZATION.md).)

### OwedBook (`src/__tests__/owedbook/`, `services/owedbook.test.ts`)

Service filtering/pagination/aggregation, KPI tiles, the StatusChip, the
FilterRail, the screen, and a drawer-apply integration test (filter state flows
from the mobile drawer into the screen).

### Admin Portal (`src/__tests__/admin-portal/`, `services/adminDemo.test.ts`, `mocks/adminDemo.seed.test.ts`)

The five demo services (with hard invariants), the seed self-check, and the
screens. Highlights that encode **product rules**, not just behavior:

- **`InviteMemberForm`** — a HARD assertion that there is **no password input and
  no permission selector**. This is the UI last line of the one hard rule. The
  service test backs it with a **compile-time** `@ts-expect-error` making a
  `password` key a build failure.
- **`MemberRow`** — actions are status-dependent and Suspend flips real state
  through the service (never the store directly).
- **`MyStoresScreen`** / **`SettingsForm`** / **`AddStoreButton`** — card-per-store
  glance, empty-state toggle, save-through-service, and the add-store harvest
  form.

### Shared UI & layout (`common/`, `layout/`, `global/`, `member/`)

`DataTable` (desktop table → mobile cards), `EmptyState`, `MultiSelect`,
`AuthedShell`, `AdminSidebar`, the `Navbar` switcher + mobile menu (close paths +
the Radix-popper guard + theme-pick close), and `ProfileForm`.

---

## How to Run

```bash
npm test                    # full Jest suite (117 / 25)
npm test -- --runInBand     # single-threaded (CI debugging / determinism)
npm run test:e2e            # Playwright e2e
npm run test:e2e:ui         # Playwright UI mode
```

> **Note:** `npm run test:integration` targets `src/__tests__/api/`, which does
> **not exist yet** — so it currently matches no tests. It's reserved for future
> API-route integration tests.

---

## Testing Philosophy

> A real suite doesn't just prove authorized users succeed and correct data
> renders. It proves unauthorized users fail immediately and safely, and that the
> product's hard rules (no-password invites, no-charge billing) can't silently
> regress.

That's the standard. When the Phase-7 backend swap lands, these tests should stay
green with only the service internals changing — if a component or type test
breaks, the swap leaked past the service boundary.
