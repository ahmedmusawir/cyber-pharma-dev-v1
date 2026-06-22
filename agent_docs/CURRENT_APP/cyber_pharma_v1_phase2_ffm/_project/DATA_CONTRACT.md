# DATA_CONTRACT v1.0 — Cyber Pharma v1 / Phase 2

> **Reader:** Claudy. **Authored from:** recon report (verified stack/auth/DB) + the OwedBook design artifacts in `_design/`.
> **Phase 2 is demo-data-only.** No Frank tables. Every shape below is satisfied by a mock in Phase 2 and by real Supabase in Phase 3 — the contract is the swap-stable boundary.

---

## 1. Tables In Play For This Phase

**NONE new.** Phase 2 creates zero tables. The only DB objects that exist (recon-verified) are the Phase-1 kit tables:
- `public.user_roles` (role gating — unchanged)
- `public.profiles` (display name — unchanged)

The 13 Frank-domain tables (`businesses`, `user_businesses`, `user_data`, `subscriptions`, `aac_reference`, etc.) **do NOT exist and are NOT created here.** They land in Phase 3. OwedBook data in Phase 2 is demo fixtures served through the service layer.

## 2. Tables NOT In Play (explicit)

All 13 Frank-domain tables — Phase 3. If Claudy is tempted to `CREATE TABLE` anything for "demo data," STOP. Demo data is fixtures in `src/mocks/owedbook.ts`, not a table.

## 3. Inherited Triggers / Functions

- `public.handle_new_user()` (SECURITY DEFINER) — auto-inserts `user_roles` + `profiles` rows. Unchanged.
- `on_auth_user_created` trigger — unchanged.

## 4. TypeScript Types (Phase 2)

All in `src/types/`. Wire format mirrors what Phase-3 Supabase will return (snake_case where it'll come from a DB column) so the service swap is mechanical. Enum-like values are string literal unions. No `any`.

```typescript
// src/types/OwedBook.ts

// One ledger row (one script's reconciliation line)
// Cluster-3 extension (2026-06-22, operator-approved): added the updated-payment
// pair, the REAL federal fields, report_file, and made pbm nullable — backs all
// 4 tabs honestly per UI_SPEC §5.3. The Federal AAC/Diff are NOW DISTINCT fields
// (aac / federal_diff), NOT aliases of medicaid_rate / owed (the demo proved them
// separate). Resolves the §7 "medicaid_rate vs AAC" open question.
export interface OwedBookRow {
  id: string;
  date: string;              // ISO 'YYYY-MM-DD'
  script: string;            // e.g. "751291-02"
  qty: number;
  pbm: string | null;        // null shows as "—" (was non-null)
  status: OwedStatus | null; // null shows as "—"
  report_file: string | null; // Report column; null shows as "—"
  // commercial
  original_paid: number;
  medicaid_rate: number;     // demo
  method: string;            // e.g. "AAC"
  expected: number;          // commercial expected (demo)
  owed: number;              // commercial; positive = owed-to-pharmacy; negative = overpaid
  // updated commercial payments (Updated tab)
  new_paid: number | null;
  updated_difference: number | null; // new_paid − original_paid
  // federal — REAL (distinct from the commercial/demo values above)
  aac: number | null;
  federal_expected: number | null;   // aac × qty
  federal_diff: number | null;       // federal_expected − original_paid
}

export type OwedStatus =
  | "recovered"
  | "emailed_pbm"
  | "pending"
  | "underpaid"
  | "new";

// The 4 KPI tiles
export interface OwedBookKpis {
  commercial_underpaid: number;  // $ — chart-1 (red)
  commercial_scripts: number;    // count — chart-2 (blue)
  updated_difference: number;    // $ — chart-3 (green)
  owed: number;                  // $ — chart-4 (maroon)
}

// Which tab's dataset
export type OwedTab =
  | "commercial_dollars"
  | "updated_commercial_payments"
  | "federal_dollars"
  | "summary";

// Filter state (drives the service query)
export interface OwedBookFilters {
  from?: string;             // ISO date
  to?: string;               // ISO date
  pbms: string[];            // empty = "All"
  filter?: string;           // the generic "Filter" dropdown value
}

// One page of results
export interface OwedBookPage {
  rows: OwedBookRow[];
  page: number;
  pageCount: number;
  limit: number;
  total: number;
}

// Summary-tab aggregate (PBM → dollars)
export interface OwedBookSummaryRow {
  pbm: string;
  commercial_dollars: number;
  federal_dollars: number;
}
```

## 5. Service Contracts

**This is the first real domain service in the project.** It is justified (the kit knows nothing about PBM reconciliation) and is NOT the forbidden auth-wrapper. Components call this service; they never touch mocks or Supabase directly.

```typescript
// src/services/owedbook.ts  (CONTRACT)

export interface OwedBookService {
  /**
   * KPI tile values for the current filter set.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns fixtures; real impl aggregates
   * `user_data` joined with reference tables, scoped by RLS to the caller's business_id(s).
   */
  getKpis(filters: OwedBookFilters): Promise<OwedBookKpis>;

  /**
   * Paginated ledger rows for a given tab + filter set.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns demo fixtures filtered in-memory;
   * real impl queries `user_data` with WHERE/ORDER/LIMIT, RLS-scoped.
   */
  getRows(tab: OwedTab, filters: OwedBookFilters, page: number): Promise<OwedBookPage>;

  /**
   * Summary-tab aggregate (PBM → commercial/federal dollars).
   * BACKEND_SWAP_NOTES (Phase 3): mock aggregates fixtures; real impl GROUP BY pbm.
   */
  getSummary(filters: OwedBookFilters): Promise<OwedBookSummaryRow[]>;

  /**
   * Distinct PBM names for the MultiSelect filter.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns the fixture PBM list; real impl
   * SELECT DISTINCT pbm FROM user_data (RLS-scoped).
   */
  getPbmOptions(): Promise<string[]>;
}
```

**Auth stays direct (recon-locked):** role still resolves via `getUserRole()` → `user_roles`; layouts still use `protectPage([AppRole.ADMIN])`. The OwedBook lives behind the admin gate. NO auth-service wrapper — `useAuthStore` + `supabase.auth.getUser()` consumed directly, exactly as Phase 1.

## 6. Mock Data Strategy

- `src/mocks/owedbook.ts` — demo fixtures: a realistic set of `OwedBookRow`s across PBMs, dates, and statuses (model the numbers in the design artifacts — e.g. Commercial Underpaid $12,669.63, Owed $12,627.77, 2,631 scripts). Documented **DELETABLE**.
- The mock implementation of `OwedBookService` filters/paginates/aggregates the fixtures in-memory so every method is exercised.
- **Components import `owedBookService`, never `src/mocks/` directly** (hard gate G7).

## 7. Future Phase Decision Points (NOT decided now)

- Real `user_data` column names + the exact join to reference tables → Phase 3 (resolved from Frank API extracts).
- ~~Whether `medicaid_rate` and the Federal-tab `AAC` are the same column or two~~ → **RESOLVED Cluster 3: two distinct fields** (`medicaid_rate` demo, `aac` real).
- Pagination strategy (offset vs cursor) for real data volumes → Phase 3.
- Whether Summary aggregates server-side or client-side at real scale → Phase 3.

## 8. Conflict Resolution

If a component needs a shape not in this contract: STOP and surface — don't invent a field or a table. The contract describes the demo reality and the Phase-3 swap target; extending it is an operator decision.

## 9. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.1 | 2026-06-22 | **Cluster-3 `OwedBookRow` extension (operator-approved).** Added in ONE entry: `new_paid`, `updated_difference` (Updated tab); `aac`, `federal_expected`, `federal_diff` (Federal tab — REAL, now distinct from the demo `medicaid_rate`/`owed` aliases); `report_file` (Report column); and `pbm` made nullable (`string \| null`). Backs all 4 tabs honestly per UI_SPEC §5.3. Resolves the §7 "medicaid_rate vs AAC" open question (they're two fields). `owedBookService` wired to `src/mocks/owedbook.ts` (150 scrubbed rows from Frank's demo DB); filters (date/PBM/status) + pagination live in the service, not components. Still mock-backed; service remains the Phase-3 swap point. |
| 1.0 | 2026-06-09 | Initial Phase 2 data contract. OwedBook row/KPI/filter/page/summary types; `OwedBookService` (first real domain service, mock-backed, swap-stable to Phase-3 Supabase); demo-data-only, zero Frank tables; auth stays direct (no wrapper). |
