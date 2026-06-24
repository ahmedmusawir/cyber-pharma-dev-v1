import type { ReactNode } from "react";

// Generic status pill for the Admin Portal screens — mirrors owedbook's
// StatusChip pattern (literal class strings so Tailwind's scanner keeps them)
// but tone-driven so each surface maps its own vocab → tone + label. Matches the
// mockup `.pill` styling; built from existing semantic tokens (no new colors).
export type PillTone = "success" | "warning" | "destructive" | "info" | "neutral";

const TONE: Record<PillTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  neutral: "bg-muted text-muted-foreground",
};

interface StatusPillProps {
  tone: PillTone;
  children: ReactNode;
}

const StatusPill = ({ tone, children }: StatusPillProps) => {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE[tone]}`}
    >
      {children}
    </span>
  );
};

export default StatusPill;
