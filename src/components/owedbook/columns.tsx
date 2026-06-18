import type { ColumnDef } from "@/components/common/DataTable";
import type { OwedBookRow, OwedBookSummaryRow } from "@/types/OwedBook";
import StatusChip from "./StatusChip";
import { usd } from "./format";

const money = (v: unknown) => usd(Number(v ?? 0));

// Inert Report affordance — real export wires in Phase 5/6 (UI_SPEC §5.4 pattern).
const reportColumn: ColumnDef<OwedBookRow> = {
  key: "id",
  label: "Report",
  render: () => (
    <button
      type="button"
      className="text-primary text-sm underline-offset-2 hover:underline"
    >
      Report
    </button>
  ),
};

const owedSemantic = (row: OwedBookRow) =>
  row.owed > 0 ? "success" : row.owed < 0 ? "destructive" : "foreground";

// Commercial Dollars (§5.3): Date · Script · Qty · Medicaid Rate · Method ·
// Expected · Original Paid · Owed · Report · Status.
export const COMMERCIAL_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script" },
  { key: "qty", label: "Qty", align: "right", numeric: true },
  { key: "medicaid_rate", label: "Medicaid Rate", align: "right", numeric: true, format: money },
  { key: "method", label: "Method" },
  { key: "expected", label: "Expected", align: "right", numeric: true, format: money },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
  { key: "owed", label: "Owed", align: "right", numeric: true, hero: true, format: money, semanticColor: owedSemantic },
  reportColumn,
  { key: "status", label: "Status", render: (row) => <StatusChip status={row.status} /> },
];

// Federal Dollars (§5.3): Date · Script · Qty · AAC · Expected · Original Paid · Diff · Report.
// Per DATA_CONTRACT: AAC = medicaid_rate; Diff = owed.
export const FEDERAL_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script" },
  { key: "qty", label: "Qty", align: "right", numeric: true },
  { key: "medicaid_rate", label: "AAC", align: "right", numeric: true, format: money },
  { key: "expected", label: "Expected", align: "right", numeric: true, format: money },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
  { key: "owed", label: "Diff", align: "right", numeric: true, hero: true, format: money, semanticColor: owedSemantic },
  reportColumn,
];

// Updated Commercial Payments (§5.3): Date · Script · Original Paid · New Paid · Updated Difference.
// SURFACED GAP (DATA_CONTRACT §8): OwedBookRow has no `new_paid` / per-row
// `updated_difference` field. Not invented here — extending the contract is an
// operator decision (Cluster 3). Built with the columns the contract supports.
export const UPDATED_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script", hero: true },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
];

// Summary (§5.3): PBM Name · Commercial Dollars · Federal Dollars (getSummary).
export const SUMMARY_COLUMNS: ColumnDef<OwedBookSummaryRow>[] = [
  { key: "pbm", label: "PBM Name", hero: true },
  { key: "commercial_dollars", label: "Commercial Dollars", align: "right", numeric: true, format: money },
  { key: "federal_dollars", label: "Federal Dollars", align: "right", numeric: true, format: money },
];
