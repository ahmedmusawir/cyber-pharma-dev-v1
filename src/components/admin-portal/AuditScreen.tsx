"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import ScreenHeader from "@/components/admin-portal/ScreenHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import { auditActionLabel } from "@/components/admin-portal/statusPresentation";
import { formatAuditTime } from "@/components/admin-portal/format";
import { auditService } from "@/services/adminDemo";

// Pre-formatted display row (a type alias, so it satisfies DataTable's
// Record<string, unknown> constraint). Result renders Done/Failed from the enum.
type AuditRow = {
  id: string;
  time: string;
  action: string;
  target: string;
  result: string;
};

const COLUMNS: ColumnDef<AuditRow>[] = [
  { key: "time", label: "Time", numeric: true },
  { key: "action", label: "Action", hero: true },
  { key: "target", label: "Target" },
  {
    key: "result",
    label: "Result",
    semanticColor: (row) => (row.result === "Failed" ? "destructive" : "success"),
  },
];

const Skeleton = () => (
  <div className="space-y-2" data-testid="audit-skeleton">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-10 bg-muted animate-pulse" />
    ))}
  </div>
);

const AuditScreen = () => {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    auditService
      .listAudit()
      .then((entries) => {
        if (cancelled) return;
        setRows(
          entries.map((e) => ({
            id: e.id,
            time: formatAuditTime(e.occurredAt),
            action: auditActionLabel[e.action],
            target: e.target,
            result: e.result === "failed" ? "Failed" : "Done",
          }))
        );
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load audit log");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <ScreenHeader
        title="Audit log"
        subtitle="A record of actions across your stores."
      />
      <div className="mt-6">
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : loading ? (
          <Skeleton />
        ) : (
          <DataTable<AuditRow>
            columns={COLUMNS}
            rows={rows!}
            getRowKey={(r) => r.id}
            emptyState={
              <EmptyState
                icon={<ScrollText className="h-10 w-10" />}
                headline="No activity yet"
                subcopy="Actions you take across your stores will show up here."
              />
            }
          />
        )}
      </div>
    </div>
  );
};

export default AuditScreen;
