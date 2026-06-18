"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import { owedBookService } from "@/services/owedbook";
import type {
  OwedBookFilters,
  OwedBookKpis,
  OwedBookPage,
  OwedBookRow,
  OwedBookSummaryRow,
  OwedTab,
} from "@/types/OwedBook";
import KpiTiles from "./KpiTiles";
import FilterRail from "./FilterRail";
import {
  COMMERCIAL_COLUMNS,
  FEDERAL_COLUMNS,
  SUMMARY_COLUMNS,
  UPDATED_COLUMNS,
} from "./columns";

const TABS: { value: OwedTab; label: string }[] = [
  { value: "commercial_dollars", label: "Commercial Dollars" },
  { value: "updated_commercial_payments", label: "Updated Payments" },
  { value: "federal_dollars", label: "Federal Dollars" },
  { value: "summary", label: "Summary" },
];

const ZERO_KPIS: OwedBookKpis = {
  commercial_underpaid: 0,
  commercial_scripts: 0,
  updated_difference: 0,
  owed: 0,
};

const columnsForTab = (tab: OwedTab) =>
  tab === "federal_dollars"
    ? FEDERAL_COLUMNS
    : tab === "updated_commercial_payments"
      ? UPDATED_COLUMNS
      : COMMERCIAL_COLUMNS;

const SkeletonRows = () => (
  <div className="flex flex-col gap-2" data-testid="owedbook-skeleton">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-10 bg-muted animate-pulse" />
    ))}
  </div>
);

const OwedBookScreen = () => {
  const [activeTab, setActiveTab] = useState<OwedTab>("commercial_dollars");
  const [filters, setFilters] = useState<OwedBookFilters>({ pbms: [] });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>();
  const [kpis, setKpis] = useState<OwedBookKpis>(ZERO_KPIS);
  const [pageData, setPageData] = useState<OwedBookPage | null>(null);
  const [summaryRows, setSummaryRows] = useState<OwedBookSummaryRow[]>([]);
  const [pbmOptions, setPbmOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSummary = activeTab === "summary";

  // Distinct PBM names for the filter — load once.
  useEffect(() => {
    let cancelled = false;
    owedBookService
      .getPbmOptions()
      .then((o) => !cancelled && setPbmOptions(o))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // KPI tiles react to the filter set.
  useEffect(() => {
    let cancelled = false;
    owedBookService
      .getKpis(filters)
      .then((k) => !cancelled && setKpis(k))
      .catch(() => !cancelled && setKpis(ZERO_KPIS));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Ledger rows / summary react to tab + filters + page.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (activeTab === "summary") {
          const s = await owedBookService.getSummary(filters);
          if (!cancelled) {
            setSummaryRows(s);
            setPageData(null);
          }
        } else {
          const p = await owedBookService.getRows(activeTab, filters, page);
          if (!cancelled) setPageData(p);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, filters, page]);

  const handleApply = useCallback((f: OwedBookFilters) => {
    setFilters(f);
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ pbms: [] });
    setPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }, []);

  // Client-side sort of the current page (server-side sort is a Phase-3 concern
  // — the service contract takes no sort param yet).
  const rows = pageData?.rows ?? [];
  const sortedRows = sort
    ? [...rows].sort((a, b) => {
        const av = a[sort.key as keyof OwedBookRow];
        const bv = b[sort.key as keyof OwedBookRow];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.direction === "asc" ? cmp : -cmp;
      })
    : rows;

  const emptyState = (
    <EmptyState
      icon={<Inbox className="w-10 h-10 text-muted-foreground" />}
      headline="No results"
      subcopy="No rows match the current filters. Adjust or clear them to see data."
      action={{ label: "Clear filters", onClick: handleClear }}
    />
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-6">
      <FilterRail pbmOptions={pbmOptions} onApply={handleApply} onClear={handleClear} />

      <div className="flex flex-col gap-6 min-w-0">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-bold mt-1">OwedBook</h1>
          <p className="text-muted-foreground mt-1">
            Ledger-level clarity on every dollar you&apos;re owed.
          </p>
        </header>

        <KpiTiles kpis={kpis} />

        {!isSummary && pageData && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Page {pageData.page} of {Math.max(pageData.pageCount, 1)}
            </span>
            <button
              type="button"
              disabled={pageData.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="disabled:opacity-40 hover:text-foreground"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={pageData.page >= pageData.pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-40 hover:text-foreground"
            >
              Next
            </button>
            <span>
              Limit {pageData.limit} · Total {pageData.total}
            </span>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as OwedTab);
            setPage(1);
          }}
        >
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div>
          {error ? (
            <div className="flex items-center gap-3 text-sm text-destructive">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f }))}
                className="underline"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <SkeletonRows />
          ) : isSummary ? (
            <DataTable<OwedBookSummaryRow>
              columns={SUMMARY_COLUMNS}
              rows={summaryRows}
              emptyState={emptyState}
              getRowKey={(r) => r.pbm}
            />
          ) : (
            <DataTable<OwedBookRow>
              columns={columnsForTab(activeTab)}
              rows={sortedRows}
              sort={sort}
              onSort={handleSort}
              emptyState={emptyState}
              getRowKey={(r) => r.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OwedBookScreen;
