// `type` (not interface) so the generic DataTable's `Record<string, unknown>`
// constraint is satisfied — shape is identical to the DATA_CONTRACT.
export type OwedBookRow = {
  id: string;
  date: string;
  script: string;
  qty: number;
  medicaid_rate: number;
  method: string;
  expected: number;
  original_paid: number;
  owed: number;
  status: OwedStatus | null;
  pbm: string;
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
