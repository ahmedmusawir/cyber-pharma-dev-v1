# App Architecture — Frontend-First & the Phase-7 Swap Point

> How Cyber Pharma's application layer is built **on top of** the RBAC foundation.
> The foundation docs ([ARCHITECTURE](./ARCHITECTURE.md), [AUTHENTICATION](./AUTHENTICATION.md),
> [AUTHORIZATION](./AUTHORIZATION.md)) cover auth, roles, and RLS. This covers the
> product's own data flow — and why it is the way it is.

---

## The Core Idea: One Swap Point

Cyber Pharma was built **frontend-first**. Every screen is fully interactive, but
its domain data comes from mock fixtures and an in-memory store — never from a
real backend (auth is the exception; that's real). This is deliberate. The whole
app is wired so that **the service layer is the single place a real backend gets
plugged in.** Components, stores, and mocks do not change when the backend
arrives — only the service implementations do. That cutover is **Phase 7**.

```
 Component  ──calls──▶  Service  ──reads/writes──▶  Store / Mock fixtures
 (UI only)             (THE SWAP)                   (in-memory "database")
```

The rule that makes this work:

> **Components never touch mocks or stores directly. They only call services.**
> Services are the only code that reads fixtures or mutates the store.

This is enforced by convention and verified by greps in the phase gates (no
`@/mocks` import in components, no direct store import in components).

---

## The Four Layers

### 1. Types — the contract (`src/types/`)

View-model types are the contract every layer agrees on: `OwedBook.ts`,
`adminDemo.ts`, plus the auth/user types. No `any`; strict mode. When the real
backend lands, these shapes are what the new queries must return — so the UI
doesn't move.

### 2. Services — the swap point (`src/services/`)

- `services/owedbook.ts` — `getKpis` / `getRows` / `getSummary` / `getPbmOptions`
  / `uploadData` / `refreshData`.
- `services/adminDemo.ts` — five services (OwnerStores / StoreMember / Billing /
  Settings / Audit).

Every service method carries a **`BACKEND_SWAP_NOTES`** JSDoc block stating
exactly what the real implementation should do (which table, which RLS scope,
which `WHERE`/`GROUP BY`). Methods that fake an effect are marked
**`UI-FUNCTIONAL MOCK`** with their real-phase boundary. For example,
`owedbook.uploadData(file)` resolves after a short delay and **never reads,
parses, sends, or stores the file** — real ingest is Phase 5, and the method
signature is chosen so it won't change when that happens.

The services own all the logic the backend will eventually own: filtering,
pagination, aggregation. The mock `owedbook` service filters and paginates
fixtures in-memory exactly where the real one will push `WHERE`/`LIMIT` into SQL.

### 3. Stores — in-memory state (`src/store/`)

- `useAuthStore.ts` — real auth snapshot, **persisted**.
- `useAdminDemoStore.ts` — the admin demo's in-memory "database". Plain Zustand,
  **deliberately NOT `persist`-wrapped**: a refresh resets to the seed by design
  (`reset()` re-applies `makeAdminDemoSeed()`). Only the service layer calls its
  mutators; components never do.
- `useNavSpinner.ts` — UI-only navigation spinner state.

The admin store keeps derived fields consistent (e.g. a store card's
`memberCount` tracks the roster; audit entries prepend newest-first) so the demo
behaves like a real system without one.

### 4. Mocks — the seed (`src/mocks/`)

- `mocks/owedbook.ts` — the claims fixtures the OwedBook service aggregates.
- `mocks/adminDemo.ts` — `makeAdminDemoSeed({empty?})`, covering every status the
  UI must render (active / past_due / suspended members and stores, etc.).
- `mocks/auth.ts` — auth test doubles.

Mocks are **deletable at swap time.** They are imported only by services (and by
the store's seed) — nothing in the component tree depends on them.

---

## How a Mutation Flows (Admin Portal)

Suspending a member is the canonical example of mock-functional behavior:

1. `MemberRow` (component) calls the **StoreMember service** — not the store.
2. The service validates, calls `useAdminDemoStore`'s `setMemberStatus`, and
   appends an `AuditEntry` (one audit row per state mutation — a hard invariant).
3. The store updates in memory; the roster re-renders with the new status pill;
   a toast fires.
4. On refresh, `reset()` restores the seed. Nothing hit a database.

When Phase 7 arrives, step 2's body becomes a Supabase write + audit insert. The
component, the type, the toast, and the test all stay the same.

---

## Hard Invariants (carried from the build)

These are encoded in code and tests, not just docs:

- **Invite has no password and no permission dropdown.** V1 is one admin (the
  owner); a member invite is Email + Job title only. A `password` key on the
  invite payload is a **compile-time** failure (`@ts-expect-error` guard).
- **Billing is visual-only — no real charge, no audit entry** (no audit vocab
  covers billing).
- **Owner-scoped, single-tenant in V1** — services assume the caller owns the
  stores they see; there is no cross-tenant path.

---

## What "Phase 7" Actually Means

Phase 7 is the backend swap. The work is bounded to the service layer:

1. Implement each `services/*` method against Supabase per its `BACKEND_SWAP_NOTES`.
2. Replace `useAdminDemoStore`-backed reads/writes with real queries (or keep
   the store as a cache).
3. Delete `src/mocks/` once nothing imports it.
4. Add the domain tables + RLS (the [DATABASE_SETUP](./DATABASE_SETUP.md) RLS
   pattern is the template).

If the swap touches a component, a type, or a test, something was wired wrong —
that's the signal the boundary leaked.
