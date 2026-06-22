/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Radix Select inside the rail needs ResizeObserver in jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

const mockUpload = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn().mockResolvedValue(undefined);
jest.mock("@/services/owedbook", () => ({
  owedBookService: {
    uploadData: (f: File) => mockUpload(f),
    refreshData: () => mockRefresh(),
  },
}));

import FilterRail from "@/components/owedbook/FilterRail";

// Intent (UI-functional mock): the Upload button opens a type-filtered picker
// and reports success THROUGH the service — but the component never reads/parses
// the file itself (real ingest is Phase 5). The boundary is the service call.
describe("FilterRail upload", () => {
  it("offers a .csv/.xlsx/.xls picker and shows mock success via the service", async () => {
    render(<FilterRail pbmOptions={["OptumRx"]} onApply={() => {}} onClear={() => {}} />);

    const input = screen.getByLabelText("Upload claims file");
    expect(input).toHaveAttribute("accept", ".csv,.xlsx,.xls");
    expect(input).toHaveAttribute("type", "file");

    const file = new File(["irrelevant"], "claims.csv", { type: "text/csv" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/claims\.csv — Upload complete/)).toBeInTheDocument();
    expect(mockUpload).toHaveBeenCalledWith(file);
  });

  it("Get Fresh Data reports mock refresh THROUGH the service (no real fetch)", async () => {
    render(<FilterRail pbmOptions={["OptumRx"]} onApply={() => {}} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Get Fresh Data" }));
    expect(await screen.findByText("Done")).toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
