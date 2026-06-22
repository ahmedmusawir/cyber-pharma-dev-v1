import type { ColumnDef, SemanticColor } from "@/components/common/DataTable";
import type { OwedBookRow, OwedBookSummaryRow } from "@/types/OwedBook";
import StatusChip from "./StatusChip";
import { usd } from "./format";

const money = (v: unknown) => usd(Number(v ?? 0));

const posNeg = (n: number | null): SemanticColor =>
  n == null || n === 0 ? "foreground" : n > 0 ? "success" : "destructive";

// Report affordance — shows when a report exists; real view/download is Phase 5/6.
const reportColumn: ColumnDef<OwedBookRow> = {
  key: "report_file",
  label: "Report",
  render: (row) =>
    row.report_file ? (
      <button type="button" className="text-primary text-sm underline-offset-2 hover:underline">
        Report
      </button>
    ) : (
      <span className="text-muted-foreground">—</span>
    ),
};

// Commercial Dollars (§5.3): Date · Script · Qty · Medicaid Rate · Method ·
// Expected · Original Paid · Owed · Report · Status. (commercial = demo spread.)
export const COMMERCIAL_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script" },
  { key: "qty", label: "Qty", align: "right", numeric: true },
  { key: "medicaid_rate", label: "Medicaid Rate", align: "right", numeric: true, format: money },
  { key: "method", label: "Method" },
  { key: "expected", label: "Expected", align: "right", numeric: true, format: money },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
  { key: "owed", label: "Owed", align: "right", numeric: true, hero: true, format: money, semanticColor: (row) => posNeg(row.owed) },
  reportColumn,
  { key: "status", label: "Status", render: (row) => <StatusChip status={row.status} /> },
];

// Updated Commercial Payments (§5.3): Date · Script · Original Paid · New Paid · Updated Difference.
export const UPDATED_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script", hero: true },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
  { key: "new_paid", label: "New Paid", align: "right", numeric: true, format: money },
  { key: "updated_difference", label: "Updated Difference", align: "right", numeric: true, format: money, semanticColor: (row) => posNeg(row.updated_difference) },
];

// Federal Dollars (§5.3): Date · Script · Qty · AAC · Expected · Original Paid · Diff · Report.
// Uses the REAL federal fields (aac / federal_expected / federal_diff).
export const FEDERAL_COLUMNS: ColumnDef<OwedBookRow>[] = [
  { key: "date", label: "Date" },
  { key: "script", label: "Script" },
  { key: "qty", label: "Qty", align: "right", numeric: true },
  { key: "aac", label: "AAC", align: "right", numeric: true, format: money },
  { key: "federal_expected", label: "Expected", align: "right", numeric: true, format: money },
  { key: "original_paid", label: "Original Paid", align: "right", numeric: true, format: money },
  { key: "federal_diff", label: "Diff", align: "right", numeric: true, hero: true, format: money, semanticColor: (row) => posNeg(row.federal_diff) },
  reportColumn,
];

// Summary (§5.3): PBM Name · Commercial Dollars · Federal Dollars (getSummary).
export const SUMMARY_COLUMNS: ColumnDef<OwedBookSummaryRow>[] = [
  { key: "pbm", label: "PBM Name", hero: true },
  { key: "commercial_dollars", label: "Commercial Dollars", align: "right", numeric: true, format: money },
  { key: "federal_dollars", label: "Federal Dollars", align: "right", numeric: true, format: money },
];
