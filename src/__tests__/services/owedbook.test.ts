import { owedBookService } from "@/services/owedbook";
import type { OwedBookFilters, OwedStatus } from "@/types/OwedBook";

const NONE: OwedBookFilters = { pbms: [] };

// Intent: Cluster-3 wiring serves real, filterable, paginated fixture data —
// the screen must show populated KPIs/tables, all chips, all PBMs, working
// filters + pager, and STILL an empty state for a zero-result combo.
describe("owedBookService (mock-backed)", () => {
  it("lists all 7 PBMs, sorted, no nulls", async () => {
    const pbms = await owedBookService.getPbmOptions();
    expect(pbms).toHaveLength(7);
    expect(pbms.every(Boolean)).toBe(true);
    expect([...pbms]).toEqual([...pbms].sort());
    expect(pbms).toContain("OptumRx");
    expect(pbms).toContain("Caremark");
  });

  it("computes populated KPIs over 150 scripts", async () => {
    const kpis = await owedBookService.getKpis(NONE);
    expect(kpis.commercial_scripts).toBe(150);
    expect(kpis.commercial_underpaid).toBeGreaterThan(0);
    expect(kpis.owed).toBe(kpis.commercial_underpaid);
    expect(typeof kpis.updated_difference).toBe("number");
  });

  it("paginates the commercial tab (25/page across 150 rows) and clamps overflow", async () => {
    const p1 = await owedBookService.getRows("commercial_dollars", NONE, 1);
    expect(p1.total).toBe(150);
    expect(p1.pageCount).toBe(6);
    expect(p1.rows).toHaveLength(25);
    expect(p1.page).toBe(1);

    const overflow = await owedBookService.getRows("commercial_dollars", NONE, 99);
    expect(overflow.page).toBe(6); // clamped
    expect(overflow.rows).toHaveLength(25);
  });

  it("scopes the Updated tab to rows that have new_paid", async () => {
    const { rows, total } = await owedBookService.getRows("updated_commercial_payments", NONE, 1);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(150);
    expect(rows.every((r) => r.new_paid !== null)).toBe(true);
  });

  it("scopes the Federal tab to rows that carry real federal data", async () => {
    const { rows, total } = await owedBookService.getRows("federal_dollars", NONE, 1);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(150);
    expect(rows.every((r) => r.federal_expected !== null)).toBe(true);
  });

  it("aggregates the Summary tab by PBM, sorted by commercial dollars", async () => {
    const summary = await owedBookService.getSummary(NONE);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary.length).toBeLessThanOrEqual(7);
    summary.forEach((r) => {
      expect(typeof r.pbm).toBe("string");
      expect(typeof r.commercial_dollars).toBe("number");
      expect(typeof r.federal_dollars).toBe("number");
    });
    const dollars = summary.map((r) => r.commercial_dollars);
    expect([...dollars]).toEqual([...dollars].sort((a, b) => b - a));
  });

  it("applies the date, PBM, and status filters", async () => {
    const june = await owedBookService.getRows("commercial_dollars", { ...NONE, from: "2026-06-01", to: "2026-06-30" }, 1);
    expect(june.total).toBeLessThan(150);
    expect(june.rows.every((r) => r.date >= "2026-06-01" && r.date <= "2026-06-30")).toBe(true);

    const caremark = await owedBookService.getRows("commercial_dollars", { ...NONE, pbms: ["Caremark"] }, 1);
    expect(caremark.rows.every((r) => r.pbm === "Caremark")).toBe(true);

    const recovered = await owedBookService.getRows("commercial_dollars", { ...NONE, filter: "recovered" }, 1);
    expect(recovered.rows.every((r) => r.status === "recovered")).toBe(true);
  });

  it("returns an empty result for a zero-match filter (drives EmptyState)", async () => {
    const none = await owedBookService.getRows("commercial_dollars", { ...NONE, from: "2099-01-01" }, 1);
    expect(none.total).toBe(0);
    expect(none.rows).toHaveLength(0);
  });

  it("carries all five status chips + nulls across the dataset", async () => {
    const { rows } = await owedBookService.getRows("commercial_dollars", NONE, 1);
    // page 1 may not hold all; pull the full set via a wide pager walk.
    const all = [];
    for (let p = 1; p <= 6; p++) {
      all.push(...(await owedBookService.getRows("commercial_dollars", NONE, p)).rows);
    }
    const statuses = new Set(all.map((r) => r.status));
    (["recovered", "emailed_pbm", "pending", "underpaid", "new"] as OwedStatus[]).forEach((s) =>
      expect(statuses.has(s)).toBe(true)
    );
    expect(rows.length).toBeGreaterThan(0);
  });
});
