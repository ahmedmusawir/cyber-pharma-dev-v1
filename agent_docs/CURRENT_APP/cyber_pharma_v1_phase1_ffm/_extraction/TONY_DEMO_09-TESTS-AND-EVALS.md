# TONY_DEMO_09 — TESTS AND EVALS

**Repo:** cyber-pharma-demo-for-frank
**Extraction Date:** 2026-05-02
**Extracted By:** Claude Code
**Status:** FINAL

---

## Summary

Test infrastructure exists (Jest + ts-jest, configured for `src/`) but coverage is minimal: only three test files and 24 test cases total. Tests cover the role-resolution helper (`getUserRole`), the OwedBook KPI calculation logic (`useUserDataStore`), and the dead `ClaimsServices.getClaims` function. There are no end-to-end tests, no Playwright/Cypress setup, no integration tests against Supabase, no API-route tests, no React component render tests, no test-coverage reporting configuration, and no CI configuration. Tests that exist are pure-function unit tests with mocked `fetch`. The test for `ClaimsServices` is testing dead production code (see Doc 02).

---

## Findings

### Test Infrastructure

**EVIDENCE** — Jest 30.0.5 with ts-jest 29.4.1. Configuration:
```js
// jest.config.js
preset: 'ts-jest',
testEnvironment: 'node',
clearMocks: true,
roots: ['<rootDir>/src'],
testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
```

**Source:** `jest.config.js:1-25`

---

**EVIDENCE** — `package.json` script: `"test": "jest"` (no flags, no coverage flag, no watch flag).

**Source:** `package.json:10`

---

**EVIDENCE** — `testEnvironment: 'node'` — NOT jsdom. This means tests cannot render React components or use the DOM. Component testing is unsupported by the current config.

**Source:** `jest.config.js:8`

---

**GAP** — No `@testing-library/react`, `@testing-library/jest-dom`, or `@testing-library/user-event` in `package.json`. No React component test helpers.

**GAP** — No Playwright, Cypress, or other E2E framework in `package.json`.

**GAP** — No `jest.coverageThreshold`, `collectCoverage`, or `--coverage` flag configured. The `coverage/` directory is `.gitignored` (line 8) but no command produces it.

**Source:** `package.json:45-56`; `.gitignore:8`

---

### Test File Inventory

**EVIDENCE** — Three test files exist:
- `src/utils/get-user-role.test.ts` — 11 cases
- `src/services/ClaimsServices.test.ts` — 2 cases
- `src/stores/__tests__/useUserDataStore.test.ts` — 5 cases

Total: 18 test cases (Jest counts each `it(...)` as a case).

**Source:** Glob `src/**/*.test.ts` and `src/**/__tests__/**/*.ts`, 2026-05-02

---

### Test 1 — `getUserRole` (`src/utils/get-user-role.test.ts`)

**EVIDENCE** — 11 cases covering:
- `superadmin` resolution (numeric 1, boolean true)
- `admin` resolution (when superadmin=0, admin=1)
- `member` resolution (when only member=1)
- null returns: all flags 0, empty object, null, undefined
- Edge: non-1 numbers (`2`), non-true strings (`'yes'`) → null
- Resolution priority: superadmin > admin > member

**Source:** `src/utils/get-user-role.test.ts:5-58`

**INFERENCE** — The most thorough test in the repo. It exercises the helper's truthy-value matrix from `getUserRole.ts:13-20` (number 1, boolean true, string '1', string 'true'). Provides reasonable confidence that the role resolution behaves as intended.

*Built on:* the EVIDENCE above plus `src/utils/get-user-role.ts:9-27`

---

### Test 2 — `ClaimsServices.getClaims` (`src/services/ClaimsServices.test.ts`)

**EVIDENCE** — 2 cases:
- `it('builds query params and maps numbers correctly')` — mocks `global.fetch`, verifies the URL contains `/api/user-data` and that string-coerced numbers in the response (`'2'`, `'3.0'`) are properly converted to numbers in the parsed result
- `it('throws on non-OK responses')` — mocks fetch to return 500, expects `getClaims` to throw with `'getClaims failed: 500'`

**Source:** `src/services/ClaimsServices.test.ts:7-82`

**EVIDENCE** — `ClaimsServices.getClaims` is dead in production code. Confirmed in Doc 02: only `ClaimsServices.test.ts` imports it. The Zustand store fetches `/api/user-data` directly via `useUserDataStore.fetchUserData`. The test verifies a function that no production caller invokes.

**Source:** `src/app/(admin)/admin-portal/AdminPortalContent.tsx:12` (`// Removed ClaimsServices`); grep `ClaimsServices` in `src/app/`, `src/components/`, `src/stores/` returns 0 hits

---

### Test 3 — `useUserDataStore` (`src/stores/__tests__/useUserDataStore.test.ts`)

**EVIDENCE** — 5 cases against the two pure functions exported by the store (NOT against the Zustand store itself):

`describe('applyClientSideFilters')` — 4 cases:
- date range filtering
- `owedType: 'underpaid'` (positive owed)
- `owedType: 'overpaid'` (negative owed)
- PBM name filter

`describe('calculateKPIs')` — 1 case:
- "calculates commercial KPIs excluding Federal" — exercises `scriptsCommercial`, `underpaidCommercialAbs`, `updatedDifferenceTotal`, `owedTotal` formulas

**Source:** `src/stores/__tests__/useUserDataStore.test.ts:24-69`

---

**EVIDENCE** — The store's IMPERATIVE methods (`fetchUserData`, `setFilters`, `applyFilters`, `clearFilters`, `setLastSavedPdfForContext`, `getLastSavedPdfForContext`, `hasSavedPdfForContext`, `setPage`) are NOT directly tested. Only the two pure helpers (`applyClientSideFilters`, `calculateKPIs`) have coverage.

**Source:** `src/stores/__tests__/useUserDataStore.test.ts` — verified by full read; only `applyClientSideFilters` and `calculateKPIs` are imported

---

### What Is NOT Tested

**GAP** — No tests for any API route. Specifically:
- `/api/user-data` — the OwedBook hot path with batch enrichment, ~278 LOC of derivation logic
- `/api/kpis` — the parallel server-side KPI computation
- `/api/reports/save` — PDF generation, Storage upload, slug resolution
- `/api/reports/email` — `.eml` composition, attachment download, DB update
- `/api/auth/{login, signup, confirm, logout, superadmin-add-user}` — auth endpoints
- `/api/pbm-email` — admin client lookup

**Source:** Searched `src/app/api/**/*.test.ts` — zero matches

---

**GAP** — No tests for `protectPage`, `getPharmacySlugForUser`, `slugify`, `buildReportFilename`, `formatDate`, `generateReportPdfBuffer`. These all live in non-`__tests__` paths and have no neighbor `.test.ts` files.

**Source:** Searched for `*.test.ts` next to each named file — none exist

---

**GAP** — No tests for any React component. `AdminPortalContent` (748 LOC), `FiltersPanel`, `ReportActions`, `Navbar`, `Hero`, the auth forms — none have render tests.

---

**GAP** — No tests for the `useAuthStore` Zustand store. Login flow, role-based redirect logic, persist behavior — all untested.

---

**GAP** — No integration test against a real Supabase instance (no `supabase-js` mock, no test fixtures, no docker-compose with Supabase local).

---

**GAP** — No CI configuration. No `.github/workflows/`, no `.gitlab-ci.yml`, no `circle.yml`. Tests can be run locally only.

---

### Test-Quality Observations

**EVIDENCE** — `ClaimsServices.test.ts:8-49` uses `global.fetch = jest.fn(...)` to mock fetch. The mock includes a basic shape check (`expect(url).toContain('/api/user-data')`) inside the mock function — this is unusual (assertions inside mocks fire eagerly and can produce confusing failures). It also has a dead conditional: `if (url.includes('dateFrom=2025-01-01')) { /* ok */ }` (line 12-14) — comment-only, no behavior.

**Source:** `src/services/ClaimsServices.test.ts:8-49`

---

**EVIDENCE** — `useUserDataStore.test.ts` uses a helper factory `r(partial)` (lines 4-22) to construct test rows with sensible defaults (default `pbmName = 'OptumRx'`, `method = 'AAC'`). Clean and readable.

**Source:** `src/stores/__tests__/useUserDataStore.test.ts:4-22`

---

### Test Quality Counts

**EVIDENCE** — Counting `it(...)` blocks across the three files:
- `get-user-role.test.ts`: 11 cases
- `ClaimsServices.test.ts`: 2 cases
- `useUserDataStore.test.ts`: 5 cases (4 in `applyClientSideFilters` describe + 1 in `calculateKPIs` describe)

Total: 18 test cases.

**Source:** Full reads of all three files

---

### Coverage Gaps Most Relevant to Downstream

**GAP** — The 748-line OwedBook component (`AdminPortalContent.tsx`) — including tab switching, sort logic, drag-to-scroll, filter dialog, KPI rendering — is entirely untested.

**GAP** — The `/api/user-data` enrichment pipeline (AAC → WAC fallback, Federal classification, FIXED_FEE math) is entirely untested at the server-route level. The pure-function KPI logic in the store is partially tested but does NOT match the server-route logic in all cases (server-route only counts rows with AAC; client-store counts all commercial rows).

**GAP** — PDF generation (`src/server/reports/pdf.ts`) — no unit tests on layout, paging, or column rendering.

**GAP** — `getUserRole.test.ts` does not test the case where `is_qr_member` is the string `'true'` despite the implementation accepting it (`get-user-role.ts:14-19`). One untested branch.

---

### Vestigial / Misleading Test

**EVIDENCE** — `ClaimsServices.test.ts` is the only file in the repo that exercises `ClaimsServices.getClaims`. Since `ClaimsServices` is dead in production (see Doc 02), this test verifies an interface that no user-facing path consumes. It would still catch regressions if the file is later resurrected, but right now it is testing a museum exhibit.

**Source:** `src/services/ClaimsServices.test.ts` + grep `ClaimsServices` in production paths

---

## Open Questions

1. The 18-test footprint suggests testing was scoped to "the parts that are reusable pure logic". Is this intentional (UI-test budget will come later) or accidental (tests written ad-hoc)?
2. `ClaimsServices.test.ts` tests dead code. Should the test be deleted along with the dead service, or preserved as a regression net for a future revival?
3. No coverage threshold is configured. Is there an internal Cyberize bar (e.g., 70% line coverage) that should be applied?
4. The KPI math is implemented in TWO places (`useUserDataStore.calculateKPIs` and `/api/kpis/route.ts`) with subtly different semantics. Only the client-side one is tested. Should the server-side one be tested as a parity check?
5. `/api/user-data`'s enrichment math (FIXED_FEE = 10.64, brand 0.96 multiplier, generic_indicator branching) — these are business-critical and untested. Acceptable for demo?

---

## Verification Checklist

- [x] All findings labeled with evidence tags
- [x] All file references verified to exist
- [x] No invented function names or file paths
- [x] No synthesis or recommendations included
- [x] GAPs explicitly documented
