/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";

// cmdk (the Command primitive the sidebar is built on) uses ResizeObserver,
// which jsdom doesn't provide. Minimal no-op polyfill, test-scoped.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
// cmdk also scrolls the active item into view; jsdom has no layout engine.
Element.prototype.scrollIntoView = () => {};

import AdminSidebar from "@/components/layout/AdminSidebar";

// next/navigation is globally mocked in jest.setup; override usePathname per test.
const mockUsePathname = usePathname as jest.Mock;

// Intent: ONE surface-aware component, ONE container (UI_SPEC v1.4 §A.1/§C) —
// only the content below the command input differs. Admin shows nav items;
// OwedBook shows the FilterRail. Wrong content on a surface = a leak.
describe("AdminSidebar surface-awareness", () => {
  it("on /owedbook renders the filter rail, not nav items", () => {
    mockUsePathname.mockReturnValue("/owedbook");
    render(<AdminSidebar />);
    expect(screen.getByText("Upload Data")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("Get Fresh Data")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("on /admin-portal renders nav items, not the filter rail", () => {
    mockUsePathname.mockReturnValue("/admin-portal/users");
    render(<AdminSidebar />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Add Member")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Upload Data")).not.toBeInTheDocument();
  });
});
