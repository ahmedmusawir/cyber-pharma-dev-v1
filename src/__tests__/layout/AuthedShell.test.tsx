/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";

// Isolate AuthedShell's drawer logic — stub the heavy children (Navbar pulls
// supabase/store; AdminSidebar pulls cmdk/Radix).
jest.mock("@/components/global/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar" />,
}));
jest.mock("@/components/layout/AdminSidebar", () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-content">SIDEBAR</div>,
}));

// `mock`-prefixed so jest's hoisted factory may close over it.
let mockTick = 0;
jest.mock("@/components/owedbook/OwedBookContext", () => ({
  useOwedBook: () => ({
    appliedTick: mockTick,
    filters: { pbms: [] },
    pbmOptions: [],
    applyFilters: () => {},
    clearFilters: () => {},
  }),
}));

import AuthedShell from "@/components/layout/AuthedShell";

const mockUsePathname = usePathname as jest.Mock;

// Intent (Rule Zero): the sidebar must be REACHABLE on mobile, not hidden with
// no affordance. A trigger opens a slide-over holding the same sidebar content;
// it closes on backdrop. Label is surface-aware (Filters on /owedbook).
describe("AuthedShell mobile sidebar drawer", () => {
  it("opens a slide-over with the sidebar and closes on backdrop", () => {
    mockUsePathname.mockReturnValue("/admin-portal/users");
    render(
      <AuthedShell>
        <p>main content</p>
      </AuthedShell>
    );

    // Desktop column always renders one sidebar instance; no drawer yet.
    expect(screen.getAllByTestId("sidebar-content")).toHaveLength(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));

    // Drawer open: dialog + a second sidebar instance inside it.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByTestId("sidebar-content")).toHaveLength(2);

    // Regression guard (Round-3 visual fix): 75vw phone / 50vw tablet.
    expect(screen.getByTestId("sidebar-drawer")).toHaveClass("w-3/4", "md:w-1/2");

    // Backdrop click closes it.
    fireEvent.click(screen.getByRole("dialog").querySelector("[aria-hidden]")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("labels the trigger 'Filters' on the /owedbook surface", () => {
    mockUsePathname.mockReturnValue("/owedbook");
    render(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    expect(screen.getByRole("button", { name: "Open Filters" })).toBeInTheDocument();
  });

  // Intent: a sidebar link navigates AND dismisses the drawer (it shouldn't
  // linger over the new page). Modeled as a route change.
  it("closes the drawer when the route changes", () => {
    mockUsePathname.mockReturnValue("/admin-portal/users");
    const { rerender } = render(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    mockUsePathname.mockReturnValue("/admin-portal/users/add-member");
    rerender(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Intent: /owedbook's wide filter rail collapses below xl (1280); the narrow
  // admin nav rail still collapses below lg (1024).
  it("collapses /owedbook below xl but /admin-portal below lg", () => {
    mockUsePathname.mockReturnValue("/owedbook");
    const { rerender } = render(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    expect(screen.getByTestId("desktop-sidebar")).toHaveClass("hidden", "xl:block");

    mockUsePathname.mockReturnValue("/admin-portal/users");
    rerender(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    expect(screen.getByTestId("desktop-sidebar")).toHaveClass("hidden", "lg:block");
  });

  // Intent: applying filters in the mobile drawer dismisses it so results show.
  it("closes the drawer when filters are applied (appliedTick bumps)", () => {
    mockTick = 0;
    mockUsePathname.mockReturnValue("/owedbook");
    const { rerender } = render(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open Filters" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    mockTick = 1; // an apply happened
    rerender(
      <AuthedShell>
        <p>main</p>
      </AuthedShell>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
