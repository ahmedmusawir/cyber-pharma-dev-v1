/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import KpiTiles from "@/components/owedbook/KpiTiles";

// Intent: the 4 tiles surface the headline reconciliation numbers (UI_SPEC
// §5.2) — money formatted as USD, scripts as a plain count.
describe("KpiTiles", () => {
  it("renders all four labels with formatted values", () => {
    render(
      <KpiTiles
        kpis={{
          commercial_underpaid: 12669.63,
          commercial_scripts: 2631,
          updated_difference: 100.5,
          owed: 12627.77,
        }}
      />
    );

    expect(screen.getByText("Commercial Underpaid")).toBeInTheDocument();
    expect(screen.getByText("$12,669.63")).toBeInTheDocument();

    expect(screen.getByText("Commercial Scripts")).toBeInTheDocument();
    expect(screen.getByText("2,631")).toBeInTheDocument();

    expect(screen.getByText("Updated Difference")).toBeInTheDocument();
    expect(screen.getByText("Owed")).toBeInTheDocument();
    expect(screen.getByText("$12,627.77")).toBeInTheDocument();
  });
});
