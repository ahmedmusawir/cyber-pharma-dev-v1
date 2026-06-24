/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// Radix Dialog touches these in jsdom (no layout engine / pointer capture).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;
Element.prototype.scrollIntoView = () => {};
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

jest.mock("@/services/adminDemo", () => ({
  ownerStoresService: { addStore: jest.fn() },
}));
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

import AddStoreButton from "@/components/admin-portal/AddStoreButton";
import { ownerStoresService } from "@/services/adminDemo";

const addStoreMock = ownerStoresService.addStore as jest.Mock;

// Intent (K9): the demo's add-store affordance is a requirement-harvesting facade.
// It must advertise the proposed new-store field set (name / NCPDP / NPI / address)
// so Frank can confirm what a real store needs, AND it must read as non-charging
// (the Phase-7 caption). It must still drop a card into the store on submit so the
// demo feels alive. These assertions fail the build if the harvest intent regresses.
describe("AddStoreButton — mock harvest form", () => {
  beforeEach(() => {
    addStoreMock.mockReset();
    addStoreMock.mockResolvedValue({ name: "New Pharmacy", storeId: "store-9" });
  });

  const openDialog = () => {
    render(<AddStoreButton onAdded={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /add store/i }));
  };

  it("advertises the proposed new-store field set: name, NCPDP, NPI, address", () => {
    openDialog();
    expect(screen.getByLabelText(/store name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ncpdp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/npi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
  });

  it("reads as non-charging via the Phase-7 caption", () => {
    openDialog();
    expect(
      screen.getByText(
        /Demo only — real add-store \+ subscription checkout is Phase 7\./i
      )
    ).toBeInTheDocument();
  });

  it("still drops a card on submit (calls addStore + onAdded)", async () => {
    const onAdded = jest.fn();
    render(<AddStoreButton onAdded={onAdded} />);
    fireEvent.click(screen.getByRole("button", { name: /add store/i }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /add store/i }));

    await waitFor(() => expect(addStoreMock).toHaveBeenCalledTimes(1));
    expect(onAdded).toHaveBeenCalledTimes(1);
  });
});
