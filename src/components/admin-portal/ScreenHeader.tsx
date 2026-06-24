import type { ReactNode } from "react";
import DemoMarker from "@/components/admin-portal/DemoMarker";

export interface ScreenHeaderProps {
  /** Uppercase eyebrow above the title. Defaults to the portal name. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Optional trailing slot (e.g. an "Add store" button) aligned with the title row. */
  action?: ReactNode;
}

// Shared page header for every Admin Portal screen (mockup `.eyebrow`/`.page`/
// `.sub`). The DemoMarker rides in the eyebrow row so the "mock data" signal is
// present on every screen. Token-only; no new brand colors.
const ScreenHeader = ({
  eyebrow = "Admin Portal",
  title,
  subtitle,
  action,
}: ScreenHeaderProps) => {
  return (
    <header className="mb-2">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span>{eyebrow}</span>
        <DemoMarker />
      </div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
};

export default ScreenHeader;
