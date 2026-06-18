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

// Intent: ONE surface-aware component (UI_SPEC §C) — the route decides the
// item-set. Wrong items on a surface = a navigation leak between surfaces.
describe("AdminSidebar surface-awareness", () => {
  it("on /owedbook shows only Dashboard", () => {
    mockUsePathname.mockReturnValue("/owedbook");
    render(<AdminSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Member")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("on /admin-portal shows Users / Add Member / Profile, not Dashboard", () => {
    mockUsePathname.mockReturnValue("/admin-portal/users");
    render(<AdminSidebar />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Add Member")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
