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

  it("on /admin-portal renders the owner-scoped nav items, not the filter rail", () => {
    mockUsePathname.mockReturnValue("/admin-portal");
    render(<AdminSidebar />);
    expect(screen.getByText("My Stores")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Audit log")).toBeInTheDocument();
    expect(screen.queryByText("Upload Data")).not.toBeInTheDocument();
    // Route takeover (Phase 2.2): the old user-CRUD nav is gone.
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  // Intent: a section owns more than its own href — My Stores stays active
  // through the store drill-down, and only one item is active at a time.
  it("marks My Stores active on a /stores/* drill-down, not Billing", () => {
    mockUsePathname.mockReturnValue("/admin-portal/stores/store-1");
    render(<AdminSidebar />);
    expect(screen.getByText("My Stores").closest("[cmdk-item]")).toHaveClass("font-bold");
    expect(screen.getByText("Billing").closest("[cmdk-item]")).not.toHaveClass("font-bold");
  });
});
