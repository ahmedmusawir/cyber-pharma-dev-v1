/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the service (the screen's only data source). Empty/zero returns mirror
// the Cluster-2 stub: the screen must render the shell + EmptyState, NOT crash.
jest.mock("@/services/owedbook", () => ({
  owedBookService: {
    getKpis: jest.fn().mockResolvedValue({
      commercial_underpaid: 0,
      commercial_scripts: 0,
      updated_difference: 0,
      owed: 0,
    }),
    getRows: jest
      .fn()
      .mockResolvedValue({ rows: [], page: 1, pageCount: 0, limit: 25, total: 0 }),
    getSummary: jest.fn().mockResolvedValue([]),
    getPbmOptions: jest.fn().mockResolvedValue([]),
  },
}));

// Unit-isolate the orchestrator from the Radix-Select-bearing filter rail.
jest.mock("@/components/owedbook/FilterRail", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-rail" />,
}));

import OwedBookScreen from "@/components/owedbook/OwedBookScreen";

describe("OwedBookScreen", () => {
  it("renders KPI tiles, the 4 tabs, and EmptyState when the service returns empty", async () => {
    render(<OwedBookScreen />);

    // KPI tiles render immediately from the zero seed.
    expect(screen.getByText("Commercial Underpaid")).toBeInTheDocument();
    expect(screen.getByText("Owed")).toBeInTheDocument();

    // All four tabs present.
    expect(screen.getByRole("tab", { name: "Commercial Dollars" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Updated Payments" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Federal Dollars" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Summary" })).toBeInTheDocument();

    // After the async load resolves with zero rows, EmptyState shows.
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });
});
