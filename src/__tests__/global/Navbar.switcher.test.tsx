/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Role drives switcher visibility (UI_SPEC §E). `mock`-prefixed so jest's
// hoisted factory may close over it.
let mockRole = "admin";

jest.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { role: string }) => unknown) => selector({ role: mockRole }),
}));

// ThemeToggler pulls next-themes context we don't provide here — stub it.
jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggler" />,
}));

// Navbar resolves the user via the supabase client on mount.
jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { email: "tony@stark.com" } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

import Navbar from "@/components/global/Navbar";

// Intent: a hidden link is UX, not security — but §E still requires the switcher
// to be ADMIN-only. A MEMBER must see a bare navbar (no surface links at all).
describe("Navbar surface switcher", () => {
  it("shows both switcher links for ADMIN", async () => {
    mockRole = "admin";
    render(<Navbar />);
    expect(await screen.findByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin Portal" })).toBeInTheDocument();
  });

  it("shows NO switcher links for MEMBER", async () => {
    mockRole = "member";
    render(<Navbar />);
    // Wait for the user to load (email span renders), then assert absence.
    expect(await screen.findByText("tony@stark.com")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "OwedBook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin Portal" })).not.toBeInTheDocument();
  });
});
