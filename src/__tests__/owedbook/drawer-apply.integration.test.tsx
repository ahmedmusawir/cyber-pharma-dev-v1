/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";

// cmdk + Radix Select inside the real FilterRail need these in jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
Element.prototype.scrollIntoView = () => {};

jest.mock("@/components/global/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar" />,
}));
jest.mock("@/services/owedbook", () => ({
  owedBookService: {
    getPbmOptions: jest.fn().mockResolvedValue([]),
    uploadData: jest.fn().mockResolvedValue(undefined),
    refreshData: jest.fn().mockResolvedValue(undefined),
  },
}));

import { OwedBookProvider } from "@/components/owedbook/OwedBookContext";
import AuthedShell from "@/components/layout/AuthedShell";
import { AppRole } from "@/utils/app-role";
import type { User as SupabaseUser } from "@supabase/auth-js";

const mockUsePathname = usePathname as jest.Mock;

// Identity props are pass-through to the (stubbed) Navbar — any authed pair works.
const tony = { email: "tony@stark.com" } as SupabaseUser;

// END-TO-END (#1): the REAL OwedBookProvider → AuthedShell → AdminSidebar →
// FilterRail → Apply path. Clicking Apply inside the drawer must dismiss it.
describe("OwedBook mobile drawer — close on Apply (integration)", () => {
  it("dismisses the open drawer when Apply is clicked inside it", async () => {
    mockUsePathname.mockReturnValue("/owedbook");
    render(
      <OwedBookProvider>
        <AuthedShell user={tony} role={AppRole.ADMIN}>
          <p>main content</p>
        </AuthedShell>
      </OwedBookProvider>
    );

    // await flushes the provider's async PBM load inside act().
    fireEvent.click(await screen.findByRole("button", { name: "Open Filters" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Real FilterRail's Apply, scoped to the drawer (a second instance lives in
    // the hidden desktop rail).
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
