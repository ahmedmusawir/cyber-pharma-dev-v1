"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export type SemanticColor = "success" | "destructive" | "foreground";

export interface ColumnDef<TRow extends Record<string, unknown>> {
  key: Extract<keyof TRow, string>;
  label: string;
  align?: "left" | "right";
  numeric?: boolean;
  hero?: boolean;
  semanticColor?: (row: TRow, value: unknown) => SemanticColor;
  format?: (value: unknown, row: TRow) => string;
}

export interface DataTableProps<TRow extends Record<string, unknown>> {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  sort?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
  emptyState?: ReactNode;
  getRowKey?: (row: TRow, index: number) => string | number;
}

const colorClass = (color: SemanticColor | undefined) => {
  if (color === "success") return "text-success";
  if (color === "destructive") return "text-destructive";
  return "text-foreground";
};

export function DataTable<TRow extends Record<string, unknown>>({
  columns,
  rows,
  sort,
  onSort,
  emptyState,
  getRowKey,
}: DataTableProps<TRow>) {
  const heroColumn = useMemo(() => columns.find((c) => c.hero), [columns]);

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div data-testid="datatable-desktop" className="hidden md:block overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-secondary text-secondary-foreground">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const sortIcon = !onSort ? null : !isSorted ? (
                  <ChevronsUpDown className="inline h-3 w-3 ml-1" />
                ) : sort.direction === "asc" ? (
                  <ChevronUp className="inline h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="inline h-3 w-3 ml-1" />
                );
                return (
                  <th
                    key={col.key}
                    onClick={onSort ? () => onSort(col.key) : undefined}
                    className={`px-3 py-2 text-xs uppercase font-bold tracking-wide ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${onSort ? "cursor-pointer select-none" : ""}`}
                    aria-sort={
                      isSorted
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    {col.label}
                    {sortIcon}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={getRowKey?.(row, idx) ?? idx} className="even:bg-card">
                {columns.map((col) => {
                  const value = row[col.key];
                  const formattedValue = col.format
                    ? col.format(value, row)
                    : String(value ?? "—");
                  const color = col.semanticColor?.(row, value);
                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-2 text-sm ${
                        col.align === "right" ? "text-right" : "text-left"
                      } ${col.numeric ? "tabular-nums" : ""} ${colorClass(color)}`}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-testid="datatable-mobile" className="md:hidden flex flex-col gap-3">
        {rows.map((row, idx) => {
          const heroValue = heroColumn ? row[heroColumn.key] : null;
          const heroFormatted = heroColumn?.format
            ? heroColumn.format(heroValue, row)
            : String(heroValue ?? "—");
          const heroColor = heroColumn?.semanticColor?.(row, heroValue);
          const restColumns = columns.filter((c) => !c.hero);

          return (
            <div
              key={getRowKey?.(row, idx) ?? idx}
              className="bg-card border border-border p-4 flex flex-col gap-3"
            >
              {heroColumn && (
                <div
                  className={`text-3xl font-bold tabular-nums ${colorClass(heroColor)}`}
                >
                  {heroFormatted}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                {restColumns.map((col) => {
                  const value = row[col.key];
                  const formattedValue = col.format
                    ? col.format(value, row)
                    : String(value ?? "—");
                  const color = col.semanticColor?.(row, value);
                  return (
                    <div key={col.key} className="contents">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {col.label}
                      </div>
                      <div
                        className={`${col.numeric ? "tabular-nums" : ""} ${colorClass(color)}`}
                      >
                        {formattedValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default DataTable;
