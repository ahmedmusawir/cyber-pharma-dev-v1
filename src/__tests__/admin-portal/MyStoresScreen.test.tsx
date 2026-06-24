/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;

import MyStoresScreen from "@/components/admin-portal/MyStoresScreen";
import { ownerStoresService } from "@/services/adminDemo";
import { useAdminDemoStore } from "@/store/useAdminDemoStore";

// Intent (K9): the owner sees a card for each of HIS stores, and the glance
// summarizes how many need attention (so a past-due/suspended store is visible
// at a glance, not buried). Empty owner → the "No stores yet" state, not a blank.
describe("MyStoresScreen", () => {
  beforeEach(() => useAdminDemoStore.getState().reset());

  it("renders a card per owned store + the glance count", async () => {
    render(<MyStoresScreen />);
    await waitFor(() =>
      expect(screen.getByText("Hyde Park Pharmacy")).toBeInTheDocument()
    );
    expect(screen.getByText("Southside Drug Mart")).toBeInTheDocument();
    expect(screen.getByText("Lakeview Apothecary")).toBeInTheDocument();
    expect(screen.getByText("Cornerstone Pharmacy")).toBeInTheDocument();
    // 4 stores; store-2 (past_due) + store-3 (suspended/canceled) need attention.
    expect(screen.getByText(/need attention/i)).toHaveTextContent(
      "4 stores · 2 need attention"
    );
  });

  it("shows the empty state when the owner has no stores", async () => {
    jest.spyOn(ownerStoresService, "listMyStores").mockResolvedValueOnce([]);
    render(<MyStoresScreen />);
    await waitFor(() =>
      expect(screen.getByText("No stores yet")).toBeInTheDocument()
    );
  });
});
