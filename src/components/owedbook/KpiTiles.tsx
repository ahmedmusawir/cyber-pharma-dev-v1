import type { OwedBookKpis } from "@/types/OwedBook";
import { usd, count } from "./format";

interface KpiTilesProps {
  kpis: OwedBookKpis;
}

interface Tile {
  label: string;
  value: string;
  bg: string; // literal so Tailwind keeps it
}

// 4 solid-color KPI tiles (UI_SPEC v1.3 §5.2). Tokens via --chart-* only (G10);
// chart-1 red / chart-2 blue / chart-3 green / chart-4 maroon.
const KpiTiles = ({ kpis }: KpiTilesProps) => {
  const tiles: Tile[] = [
    { label: "Commercial Underpaid", value: usd(kpis.commercial_underpaid), bg: "bg-chart-1" },
    { label: "Commercial Scripts", value: count(kpis.commercial_scripts), bg: "bg-chart-2" },
    { label: "Updated Difference", value: usd(kpis.updated_difference), bg: "bg-chart-3" },
    { label: "Owed", value: usd(kpis.owed), bg: "bg-chart-4" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className={`${t.bg} p-4 text-white`}>
          <div className="text-xs uppercase tracking-wide font-medium opacity-90">
            {t.label}
          </div>
          <div className="text-2xl font-bold tabular-nums mt-1">{t.value}</div>
        </div>
      ))}
    </div>
  );
};

export default KpiTiles;
