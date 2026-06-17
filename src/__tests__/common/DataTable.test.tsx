/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DataTable, type ColumnDef } from "@/components/common/DataTable";

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
  amount: number;
}

const columns: ColumnDef<TestRow>[] = [
  { key: "name", label: "Name" },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    numeric: true,
    hero: true,
    semanticColor: (_row, val) =>
      typeof val === "number" && val < 0 ? "destructive" : "success",
  },
];

const rows: TestRow[] = [
  { id: "1", name: "Alice", amount: 100 },
  { id: "2", name: "Bob", amount: -50 },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable<TestRow> columns={columns} rows={rows} />);
    expect(
      screen.getByRole("columnheader", { name: /name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /amount/i }),
    ).toBeInTheDocument();
  });

  it("renders row values", () => {
    render(<DataTable<TestRow> columns={columns} rows={rows} />);
    // Each row's name shows in BOTH the desktop table AND the mobile cards
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob").length).toBeGreaterThanOrEqual(1);
  });

  it("renders BOTH desktop table and mobile card structures (JSDOM renders both regardless of viewport; visual viewport check is the C4 seam-walk)", () => {
    render(<DataTable<TestRow> columns={columns} rows={rows} />);
    expect(screen.getByTestId("datatable-desktop")).toBeInTheDocument();
    expect(screen.getByTestId("datatable-mobile")).toBeInTheDocument();
  });

  it("calls onSort with the column key when a header is clicked", () => {
    const onSort = jest.fn();
    render(<DataTable<TestRow> columns={columns} rows={rows} onSort={onSort} />);
    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("does not throw when a header is clicked without an onSort handler", () => {
    render(<DataTable<TestRow> columns={columns} rows={rows} />);
    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));
    expect(
      screen.getByRole("columnheader", { name: /name/i }),
    ).toBeInTheDocument();
  });

  it("applies semantic-color class to cells (destructive for negative, success for positive)", () => {
    const { container } = render(
      <DataTable<TestRow> columns={columns} rows={rows} />,
    );
    expect(container.querySelector(".text-destructive")).toBeInTheDocument();
    expect(container.querySelector(".text-success")).toBeInTheDocument();
  });

  it("renders empty-state slot when rows are empty and emptyState is provided", () => {
    render(
      <DataTable<TestRow>
        columns={columns}
        rows={[]}
        emptyState={<div>No data found</div>}
      />,
    );
    expect(screen.getByText("No data found")).toBeInTheDocument();
    // Desktop + mobile structures NOT rendered when emptyState replaces them
    expect(screen.queryByTestId("datatable-desktop")).not.toBeInTheDocument();
    expect(screen.queryByTestId("datatable-mobile")).not.toBeInTheDocument();
  });

  it("uses getRowKey when provided", () => {
    const getRowKey = jest.fn((row: TestRow) => row.id);
    render(
      <DataTable<TestRow>
        columns={columns}
        rows={rows}
        getRowKey={getRowKey}
      />,
    );
    expect(getRowKey).toHaveBeenCalled();
  });
});
