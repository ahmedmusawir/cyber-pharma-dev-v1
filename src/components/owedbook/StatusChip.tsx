import type { OwedStatus } from "@/types/OwedBook";

// Status → semantic token (UI_SPEC v1.3 §5.5). Class strings are literals so
// Tailwind's content scanner keeps them. null → "—".
const STATUS: Record<OwedStatus, { label: string; className: string }> = {
  recovered: { label: "Recovered", className: "bg-success/10 text-success" },
  emailed_pbm: { label: "Emailed PBM", className: "bg-info/10 text-info" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  underpaid: { label: "Underpaid", className: "bg-destructive/10 text-destructive" },
  new: { label: "New", className: "bg-muted text-muted-foreground" },
};

interface StatusChipProps {
  status: OwedStatus | null;
}

const StatusChip = ({ status }: StatusChipProps) => {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const { label, className } = STATUS[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusChip;
