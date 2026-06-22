// `type` (not interface) so the generic DataTable's `Record<string, unknown>`
// constraint is satisfied. Cluster-3 extension (2026-06-22): added the
// updated-payment pair, the REAL federal fields, report_file, and made pbm
// nullable — backs all 4 tabs honestly per UI_SPEC §5.3. See DATA_CONTRACT §4.
export type OwedBookRow = {
  id: string;
  date: string;                       // ISO yyyy-mm-dd
  script: string;
  qty: number;
  pbm: string | null;                 // null → renders "—"
  status: OwedStatus | null;          // null → renders "—"
  report_file: string | null;         // Report column; null → "—"
  // commercial
  original_paid: number;
  medicaid_rate: number;
  method: string;
  expected: number;                   // commercial expected
  owed: number;                       // commercial: expected − original_paid
  // updated commercial payments (Updated tab)
  new_paid: number | null;
  updated_difference: number | null;  // new_paid − original_paid
  // federal — REAL, distinct from the commercial/demo values above
  aac: number | null;
  federal_expected: number | null;    // aac × qty
  federal_diff: number | null;        // federal_expected − original_paid
};

export type OwedStatus =
  | "recovered"
  | "emailed_pbm"
  | "pending"
  | "underpaid"
  | "new";

export interface OwedBookKpis {
  commercial_underpaid: number;
  commercial_scripts: number;
  updated_difference: number;
  owed: number;
}

export type OwedTab =
  | "commercial_dollars"
  | "updated_commercial_payments"
  | "federal_dollars"
  | "summary";

export interface OwedBookFilters {
  from?: string;
  to?: string;
  pbms: string[];
  filter?: string;
}

export interface OwedBookPage {
  rows: OwedBookRow[];
  page: number;
  pageCount: number;
  limit: number;
  total: number;
}

// `type` (not interface) for the DataTable generic constraint — see OwedBookRow.
export type OwedBookSummaryRow = {
  pbm: string;
  commercial_dollars: number;
  federal_dollars: number;
};
