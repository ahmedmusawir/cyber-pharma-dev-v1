/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DataTable, type ColumnDef } from "@/components/common/DataTable";

interface Row extends Record<string, unknown> {
  id: string;
  status: string;
}

// Intent: a column with `render` produces a custom cell node (e.g. a status
// chip) that a formatted string can't express — the escape hatch the OwedBook
// Status column relies on. `render` must win over `format`/String fallback.
const columns: ColumnDef<Row>[] = [
  {
    key: "status",
    label: "Status",
    render: (row) => <span data-testid="chip">{row.status.toUpperCase()}</span>,
  },
];

const rows: Row[] = [{ id: "1", status: "ok" }];

describe("DataTable custom cell render", () => {
  it("renders the custom node instead of the raw value", () => {
    render(<DataTable<Row> columns={columns} rows={rows} />);
    // Both desktop table + mobile cards render in jsdom (L2): expect ≥1.
    expect(screen.getAllByTestId("chip").length).toBeGreaterThan(0);
    expect(screen.getAllByText("OK").length).toBeGreaterThan(0);
    // The raw lowercase value must NOT leak through.
    expect(screen.queryByText("ok")).not.toBeInTheDocument();
  });
});
